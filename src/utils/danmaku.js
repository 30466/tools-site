/**
 * 弹幕工具：解析 Pocket48 LRC 弹幕 + 转为 ASS 滚动字幕
 * 从 ReplayPlayer.vue 提取，供所有剪切页面复用
 */

/**
 * 解析 Pocket48 弹幕 LRC 文件
 * 格式: [HH:MM:SS.xxx]用户名\t弹幕文本
 */
export function parseLRC(text) {
  const items = []
  const lines = text.split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\[(?:(\d{2}):)?(\d{2}):(\d{2}(?:\.\d+)?)\](.*)$/)
    if (match) {
      const h = match[1] ? parseInt(match[1]) : 0
      const m = parseInt(match[2])
      const s = parseFloat(match[3])
      const time = h * 3600 + m * 60 + s
      const parts = match[4].split('\t')
      const user = parts[0].trim()
      const text = parts[1] ? parts[1].trim() : ''
      if (user || text) {
        items.push({ user, text, time, color: '#fff', border: false })
      }
    }
  }
  return items
}

// ── ASS 格式工具 ──

/** 秒数 → ASS 时间戳 H:MM:SS.cc */
function secondsToASS(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = (sec % 60).toFixed(2)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(5, '0')}`
}

/** RGB hex → ASS BGR hex (不带 &H 前缀) */
function rgbToBGR(hex) {
  const r = hex.slice(1, 3)
  const g = hex.slice(3, 5)
  const b = hex.slice(5, 7)
  return b + g + r
}

/** 转义 ASS 特殊字符 */
function escapeASS(text) {
  return text
    .replace(/\\/g, '\\u005c')
    .replace(/\{/g, '\\u007b')
    .replace(/\}/g, '\\u007d')
    .replace(/\n/g, '\\N')
    .replace(/\r/g, '')
}

// ── 弹幕颜色表 ──
const DANMAKU_COLORS = [
  '#FFFFFF', '#FF6666', '#66FF66', '#6666FF',
  '#FFFF66', '#FF66FF', '#66FFFF', '#FF9966',
  '#99FF66', '#FF99CC', '#99CCFF', '#FFCC66'
]

/** 
 * 回放器弹幕过滤：仅移除口袋48已知的纯乱码占位符 [obj]。
 * 浏览器支持 Emoji，因此保留它们以增加趣味性。
 */
function cleanDanmakuText(s) {
  if (!s) return ''
  return s.replace(/\[obj\]/gi, '').trim()
}

/**
 * 将弹幕列表转为 ASS 滚动字幕
 */
export function lrcToASS(danmakuList, options = {}) {
  const {
    videoWidth = 1280,
    videoHeight = 720,
    fontSize = Math.floor(videoHeight / 25), 
    duration = 12,
    opacity = 0.85
  } = options

  const alphaHex = Math.round((1 - opacity) * 255).toString(16).padStart(2, '0').toUpperCase()
  const rowHeight = fontSize + 12
  const rows = Math.max(1, Math.floor((videoHeight - 20) / rowHeight))

  // 行占用追踪：避免同一行弹幕重叠
  const laneBusyUntil = new Array(rows).fill(0)

  const header = `[Script Info]
Title: Danmaku (Generated)
ScriptType: v4.00+
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Microsoft YaHei,${fontSize},&H${alphaHex}FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,2,1,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`

  let events = ''

  for (const dm of danmakuList) {
    const startSec = dm.time

    // 找空闲行
    let row = -1
    for (let r = 0; r < rows; r++) {
      if (laneBusyUntil[r] <= startSec) { row = r; break }
    }
    if (row === -1) {
      // 所有行都被占用，选最早释放的那行
      row = laneBusyUntil.indexOf(Math.min(...laneBusyUntil))
    }

    const endSec = Math.max(startSec + duration, laneBusyUntil[row] + 0.1)
    laneBusyUntil[row] = endSec

    const y = row * rowHeight + fontSize + 10
    const color = DANMAKU_COLORS[Math.floor(Math.random() * DANMAKU_COLORS.length)]
    const bgr = rgbToBGR(color)
    const startTime = secondsToASS(startSec)
    const endTime = secondsToASS(endSec)

    // \move(x1,y1,x2,y2) — 从右侧屏幕外滚动到左侧屏幕外
    const textWidthEstimate = dm.text.length * fontSize * 0.7
    const x1 = videoWidth + 20
    const x2 = -textWidthEstimate - 20

    const tags = `{\\move(${x1},${y},${x2},${y})\\c&H${bgr}&}`
    const rawText = cleanDanmakuText(dm.text)
    if (!rawText) continue
    const displayText = dm.user ? `${dm.user}: ${rawText}` : rawText
    events += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${tags}${escapeASS(displayText)}\n`
  }

  return header + events
}
