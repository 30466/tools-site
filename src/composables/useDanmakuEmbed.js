/**
 * 弹幕嵌入 composable：用 drawtext 滤镜将弹幕烧录到视频中
 *
 * 使用 textfile 属性（而非 text）彻底避免冒号/特殊字符的转义问题。
 * 字体只需下载一次，缓存在内存中。
 */
import { parseLRC } from '@/utils/danmaku'

// ── 中文字体 CDN（国内镜像优先）──
const FONT_URLS = [
  // Noto Sans CJK SC — 标准无衬线字体，类似微软雅黑 / 苹方
  'https://cdn.jsdmirror.com/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf',
  'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf',
  'https://fastly.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf',
  'https://jsd.onmicrosoft.cn/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'
]

const FONT_DOWNLOAD_TIMEOUT_MS = 25000

const DANMAKU_COLOR = 'white'
export const DANMAKU_VIDEO_CRF = '23'

export function resolveDanmakuMaxCount(value) {
  if (value === 'all' || value === undefined || value === null || value === '') return Infinity
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : Infinity
}

export function getDanmakuLimitLabel(value) {
  return resolveDanmakuMaxCount(value) === Infinity ? '全部' : `${Number(value)} 条`
}

export function getDanmakuPresetLabel(value) {
  return value === 'superfast' ? '时间慢文件小 (superfast)' : '时间快文件大 (ultrafast)'
}

export function formatDanmakuStats(result) {
  const carryIn = result.relevantCount > result.inRangeCount ? `，开头延续 ${result.relevantCount - result.inRangeCount} 条` : ''
  const truncated = result.truncatedCount > 0 ? `，已截断 ${result.truncatedCount} 条` : ''
  return `💬 弹幕统计：文件总数 ${result.sourceCount} 条，片段内 ${result.inRangeCount} 条，实际嵌入 ${result.count} 条${carryIn}${truncated}`
}

// ── 字体缓存 ──
let _fontBuffer = null
let _fontLoading = false
let _fontError = null

async function downloadFont(onLog) {
  if (_fontBuffer) return _fontBuffer
  if (_fontLoading) {
    while (_fontLoading) await new Promise(r => setTimeout(r, 100))
    if (_fontBuffer) return _fontBuffer
    throw _fontError || new Error('字体下载失败')
  }
  _fontLoading = true
  for (const url of FONT_URLS) {
    try {
      if (onLog) onLog(`  🔤 下载字体 (${url.split('/').pop()})...`)
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), FONT_DOWNLOAD_TIMEOUT_MS)
      let resp
      try {
        resp = await fetch(url, { signal: ctrl.signal })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        _fontBuffer = await resp.arrayBuffer()
      } finally {
        clearTimeout(timer)
      }
      if (onLog) onLog(`  ✅ 字体就绪 (${(_fontBuffer.byteLength / 1024 / 1024).toFixed(1)} MB)`)
      _fontLoading = false
      return _fontBuffer
    } catch (e) {
      const message = e?.name === 'AbortError'
        ? `下载超时 (${Math.round(FONT_DOWNLOAD_TIMEOUT_MS / 1000)}s)`
        : e.message
      if (onLog) onLog(`  ⚠️ ${url.split('/').pop()}: ${message}`)
    }
  }
  _fontError = new Error('所有字体源下载失败')
  _fontLoading = false
  throw _fontError
}

async function ensureFont(ffmpeg, onLog) {
  const fontBuf = await downloadFont(onLog)
  try {
    await ffmpeg.readFile('font.ttf')
    return
  } catch {}
  try {
    // slice(0) 拷贝一份——writeFile 会转移 ArrayBuffer，不能直接用缓存的
    const fontCopy = fontBuf.slice(0)
    await ffmpeg.writeFile('font.ttf', new Uint8Array(fontCopy))
  } catch (e) {
    throw new Error(`字体写入 VFS 失败: ${e?.message || String(e)}`)
  }
}

// ── drawtext 弹幕生成 ──

/** 
 * 严格过滤：只保留汉字、英文字母、数字及常用标点。
 * 彻底杜绝 ᶻᶻ 等各种特殊符号导致的 FFmpeg 渲染乱码（方框/叉号）。
 */
function stripEmoji(s) {
  if (!s) return ''
  
  // 1. 移除口袋48常见的 [obj] 占位符
  let t = s.replace(/\[obj\]/gi, '')

  // 2. 白名单正则：
  // \u4e00-\u9fa5 : 汉字
  // a-zA-Z0-9 : 英数字
  // \s : 空格
  // \u3000-\u303f\uff00-\uffef : 全角标点 (，。！？等)
  // \x20-\x7e : 半角 ASCII 打印字符 (,.!? 等)
  const regex = /[\u4e00-\u9fa5a-zA-Z0-9\s\u3000-\u303f\uff00-\uffef\x20-\x7e]/gu
  const matches = t.match(regex)
  
  return matches ? matches.join('').trim() : ''
}

function buildDrawtextChain(danmakuList, clipStartSec, clipEndSec, options = {}) {
  const { videoWidth = 1280, videoHeight = 720, 
          fontSize = Math.floor(videoHeight / 25), // 动态字号
          duration = 12, // 默认 12s 划过全屏
          maxCount = Infinity,
          textFilePrefix = 'dm' } = options

  // 速度 = (屏幕宽度 + 预估最大弹幕宽度) / 期望时长
  const scrollSpeed = Math.round((videoWidth + 800) / duration)

  const maxTextWidthEst = 800
  const maxScrollTime = (videoWidth + maxTextWidthEst + 40) / scrollSpeed

  const inRangeCount = danmakuList.filter(dm =>
    dm.time >= clipStartSec && dm.time <= clipEndSec
  ).length

  const relevant = danmakuList.filter(dm =>
    dm.time >= clipStartSec - maxScrollTime && dm.time <= clipEndSec
  )
  if (relevant.length === 0) {
    return {
      chain: '',
      textFiles: [],
      sourceCount: danmakuList.length,
      inRangeCount,
      relevantCount: 0,
      selectedCount: 0,
      truncatedCount: 0
    }
  }

  const limit = resolveDanmakuMaxCount(maxCount)
  const selected = limit === Infinity ? relevant : relevant.slice(0, limit)
  const rowHeight = fontSize + 10
  const rows = Math.max(1, Math.floor((videoHeight - 20) / rowHeight))
  const laneBusyUntil = new Array(rows).fill(0)
  const parts = []
  const textFiles = []

  for (let i = 0; i < selected.length; i++) {
    const dm = selected[i]
    const rawText = stripEmoji(dm.user ? `${dm.user} : ${dm.text}` : dm.text)
    if (!rawText) continue

    const textWidth = Math.round(rawText.length * fontSize * 0.6)
    const scrollDist = videoWidth + textWidth + 40
    const itemDuration = scrollDist / scrollSpeed
    const virtualStart = dm.time - clipStartSec
    const visStart = Math.max(0, virtualStart)

    let row = -1
    for (let r = 0; r < rows; r++) {
      if (laneBusyUntil[r] <= visStart) { row = r; break }
    }
    if (row === -1) row = laneBusyUntil.indexOf(Math.min(...laneBusyUntil))

    const y = row * rowHeight + fontSize + 10
    const actualStart = Math.max(visStart, laneBusyUntil[row])
    const actualEnd = actualStart + itemDuration
    laneBusyUntil[row] = actualEnd + 0.1

    const fn = `${textFilePrefix}_${i}.txt`
    textFiles.push({ filename: fn, content: rawText })

    const xExpr = `w-(t-${actualStart})*${scrollSpeed}`

    parts.push(
      `drawtext=fontfile=font.ttf:textfile=${fn}` +
      `:fontsize=${fontSize}:fontcolor=${DANMAKU_COLOR}` +
      `:x=${xExpr}:y=${y}` +
      `:borderw=1:bordercolor=black@0.6` +
      `:enable=between(t\\,${actualStart}\\,${actualEnd})`
    )
  }

  return {
    chain: parts.join(','),
    textFiles,
    sourceCount: danmakuList.length,
    inRangeCount,
    relevantCount: relevant.length,
    selectedCount: selected.length,
    truncatedCount: Math.max(0, relevant.length - selected.length)
  }
}

export function useDanmakuEmbed() {
  async function prepareDanmaku(ffmpeg, lrcText, videoMeta = {}, onLog, clipRange, options = {}) {
    const danmakuList = parseLRC(lrcText)
    if (danmakuList.length === 0) {
      throw new Error('弹幕数据为空或解析失败，无法嵌入')
    }

    await ensureFont(ffmpeg, onLog)

    const clipStart = clipRange?.startSec ?? 0
    const clipEnd = clipRange?.endSec ?? Infinity

    let result
    try {
      result = buildDrawtextChain(danmakuList, clipStart, clipEnd, {
        videoWidth: videoMeta.width || 1280,
        videoHeight: videoMeta.height || 720,
        ...options
      })
    } catch (e) {
      throw new Error(`生成弹幕滤镜链失败: ${e?.message || String(e)}`)
    }

    if (!result || result.textFiles.length === 0) {
      return { filterArgs: [], videoCodecArgs: [], audioCodecArgs: [],
               cleanup: async () => {}, count: 0, empty: true,
               sourceCount: result?.sourceCount ?? danmakuList.length,
               inRangeCount: result?.inRangeCount ?? 0,
               relevantCount: result?.relevantCount ?? 0,
               selectedCount: result?.selectedCount ?? 0,
               truncatedCount: result?.truncatedCount ?? 0 }
    }

    // 将弹幕文本文件写入 VFS
    for (const tf of result.textFiles) {
      await ffmpeg.writeFile(tf.filename, tf.content)
    }

    const filterArgs = ['-vf', result.chain]
    const preset = options.preset === 'superfast' ? 'superfast' : 'ultrafast'
    const videoCodecArgs = ['-c:v', 'libx264', '-preset', preset, '-crf', DANMAKU_VIDEO_CRF]
    const audioCodecArgs = ['-c:a', 'aac']

    const cleanup = async () => {
      for (const tf of result.textFiles) {
        try { await ffmpeg.deleteFile(tf.filename) } catch {}
      }
    }

    return { filterArgs, videoCodecArgs, audioCodecArgs, cleanup,
             count: result.textFiles.length,
             sourceCount: result.sourceCount,
             inRangeCount: result.inRangeCount,
             relevantCount: result.relevantCount,
             selectedCount: result.selectedCount,
             truncatedCount: result.truncatedCount,
             preset,
             crf: DANMAKU_VIDEO_CRF }
  }

  return { prepareDanmaku }
}
