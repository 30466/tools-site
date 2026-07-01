<template>
  <div class="p48-clip-panel">
    <div class="info-row"><span class="info-label">成员</span><span class="info-value">{{ member }}</span></div>
    <div class="info-row"><span class="info-label">录播时间</span><span class="info-value">{{ broadcastTime }}</span></div>
    <div class="info-row"><span class="info-label">M3U8</span><span class="info-value m3u8-text">{{ m3u8Url }}</span></div>

    <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap">
      <el-button size="small" @click="triggerTxtUpload">
        <el-icon><Document /></el-icon> 导入 TXT 切片本
      </el-button>
      <el-button size="small" @click="addEmptyRow">
        <el-icon><Plus /></el-icon> 手动添加
      </el-button>
      <el-button size="small" type="danger" plain @click="clearList">
        <el-icon><Delete /></el-icon> 清空
      </el-button>
      <input type="file" accept=".txt" @change="handleTxtSelect" style="display: none" ref="txtInputRef" />
    </div>

    <div class="clip-list">
      <div v-for="(clip, idx) in clipList" :key="idx" class="clip-item">
        <input v-model="clip.name" placeholder="片段名" class="clip-input name" />
        <input v-model="clip.start" placeholder="开始" class="clip-input time" />
        <input v-model="clip.end" placeholder="结束" class="clip-input time" />
        <button class="clip-del" @click="clipList.splice(idx, 1)">×</button>
      </div>
    </div>

    <div class="settings-row">
      <div class="setting-item">
        <span class="label">类别:</span>
        <el-radio-group v-model="outputCategory" size="small">
          <el-radio label="video" border>🎬 视频</el-radio>
          <el-radio label="audio" border>🎵 音频</el-radio>
        </el-radio-group>
      </div>
      <div class="setting-item">
        <span class="label">并发:</span>
        <el-input-number v-model="concurrency" :min="10" :max="30" :step="5" size="small" style="width: 100px" />
      </div>
      <div class="setting-item">
        <span class="label">格式:</span>
        <el-select v-model="targetFormat" style="width: 100px" size="small">
          <template v-if="outputCategory === 'video'">
            <el-option label="TS" value="ts" />
            <el-option label="MP4" value="mp4" />
            <el-option label="MKV" value="mkv" />
            <el-option label="AVI" value="avi" />
            <el-option label="MOV" value="mov" />
            <el-option label="WEBM" value="webm" />
            <el-option label="GIF" value="gif" />
          </template>
          <template v-else>
            <el-option label="M4A" value="m4a" />
            <el-option label="MP3" value="mp3" />
            <el-option label="FLAC" value="flac" />
            <el-option label="WAV" value="wav" />
            <el-option label="AAC" value="aac" />
            <el-option label="OPUS" value="opus" />
            <el-option label="OGG" value="ogg" />
          </template>
        </el-select>
      </div>
    </div>

    <div style="margin-top: 12px">
      <el-button
        v-if="!ffmpegReady"
        type="warning"
        size="large"
        :loading="ffmpegLoading"
        :disabled="!m3u8Url"
        @click="loadFFmpegCore"
        style="width: 100%"
      >
        {{ ffmpegLoading ? '⏳ 正在加载 FFmpeg 核心 (约30MB)...' : '🚀 加载 FFmpeg 核心' }}
      </el-button>
      <el-button
        v-else
        type="primary"
        size="large"
        :loading="isProcessing"
        :disabled="!m3u8Url || clipList.length === 0"
        @click="startClip"
        style="width: 100%"
      >
        <el-icon><Scissor /></el-icon>
        {{ isProcessing ? `处理中 (${progress}%)` : '开始批量处理并下载' }}
      </el-button>
    </div>

    <div class="log-box" ref="logBoxRef">
      <div v-for="(log, index) in logs" :key="index" class="log-line">{{ log }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Plus, Scissor } from '@element-plus/icons-vue'
import * as p48 from '@/api/pocket48'
import { FFmpegManager } from '@/composables/useFFmpeg'

const props = defineProps({
  m3u8Url: { type: String, default: '' },
  member: { type: String, default: '谭思慧' },
  broadcastTime: { type: String, default: '' }
})

const emit = defineEmits(['ffmpeg-needed'])

const clipList = ref([])
const txtInputRef = ref(null)
const outputCategory = ref('video')
const targetFormat = ref('ts')
const concurrency = ref(10)
const isProcessing = ref(false)
const progress = ref(0)
const logs = ref(['等待 FFmpeg 加载...'])
const logBoxRef = ref(null)
const ffmpegReady = ref(false)

const ffmpegMgr = new FFmpegManager(addLog)
const ffmpegLoading = ref(false)

async function loadFFmpegCore() {
  ffmpegLoading.value = true
  try {
    await ffmpegMgr.load()
    ffmpegReady.value = true
  } catch (e) {
    addLog('❌ FFmpeg 加载失败: ' + e.message)
  } finally {
    ffmpegLoading.value = false
  }
}

watch(outputCategory, (cat) => {
  targetFormat.value = cat === 'video' ? 'ts' : 'm4a'
})

function addLog(msg) {
  logs.value.push(msg)
  requestAnimationFrame(() => {
    if (logBoxRef.value) logBoxRef.value.scrollTop = logBoxRef.value.scrollHeight
  })
}

async function ensureFFmpeg() {
  if (ffmpegReady.value) return
  if (!ffmpegMgr.isLoaded.value) {
    addLog('⏳ 正在加载 FFmpeg 核心...')
    await ffmpegMgr.load()
  }
  ffmpegReady.value = true
}

function downloadBlob(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function getFileExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.slice(idx) : ''
}

function getAudioEncoder(format) {
  switch (format) {
    case 'mp3': return ['-c:a', 'libmp3lame']
    case 'm4a': case 'aac': return ['-c:a', 'aac']
    case 'flac': return ['-c:a', 'flac']
    case 'wav': return ['-c:a', 'pcm_s16le']
    case 'opus': return ['-c:a', 'libopus']
    case 'ogg': return ['-c:a', 'libvorbis']
    default: return ['-c:a', 'aac']
  }
}

function triggerTxtUpload() { txtInputRef.value?.click() }
function addEmptyRow() { clipList.value.push({ name: '', start: '', end: '' }) }
function clearList() { clipList.value = [] }

function handleTxtSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const lines = e.target.result.split(/\r?\n/)
    let temp = {}
    let count = 0
    lines.forEach(line => {
      line = line.trim()
      if (!line) return
      if (line.startsWith('名称:') || line.startsWith('名字:')) temp.name = line.substring(line.indexOf(':') + 1).trim()
      else if (line.startsWith('开始:') || line.startsWith('开始时间:')) temp.start = line.substring(line.indexOf(':') + 1).trim()
      else if (line.startsWith('结束:') || line.startsWith('结束时间:')) temp.end = line.substring(line.indexOf(':') + 1).trim()
      if (temp.name && temp.start && temp.end) {
        clipList.value.push({ ...temp })
        temp = {}
        count++
      }
    })
    if (count > 0) ElMessage.success(`成功导入 ${count} 条记录`)
    else ElMessage.warning('未识别到有效记录')
    event.target.value = ''
  }
  reader.readAsText(file)
}

async function startClip() {
  if (!props.m3u8Url || clipList.value.length === 0) return

  isProcessing.value = true
  progress.value = 0

  try {
    const proxiedM3U8 = p48.proxyCDN(props.m3u8Url)
    addLog(`📥 获取 M3U8: ${proxiedM3U8}`)
    const m3u8Text = await p48.fetchM3U8(proxiedM3U8)
    const realBaseUrl = p48.buildBaseUrl(props.m3u8Url)
    const segments = p48.parseM3U8(m3u8Text, realBaseUrl)
    addLog(`✅ 解析到 ${segments.length} 个分片`)

    const format = targetFormat.value
    const isAudio = ['mp3', 'm4a', 'flac', 'wav', 'aac', 'opus', 'ogg'].includes(format)
    let completedCount = 0
    const failedClips = []

    let recordContent = `--- 批量裁剪记录 ---\n源: 口袋48 ${props.member} ${props.broadcastTime}\nM3U8: ${props.m3u8Url}\n\n`
    clipList.value.forEach(c => {
      recordContent += `名称: ${c.name}\n开始: ${c.start}\n结束: ${c.end}\n\n`
    })

    async function fetchSeg(url, index, total) {
      const pad = String(total).length
      const prefix = `  [${String(index + 1).padStart(pad, ' ')}/${total}]`
      const MAX_RETRIES = 5
      const TIMEOUTS = [5000, 5000, 5000, 8000, 10000]

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const ctrl = new AbortController()
        const tid = setTimeout(() => ctrl.abort(), TIMEOUTS[attempt])

        const SOURCES = attempt < 2
          ? [{ url, label: '直连' }]
          : [
              { url: p48.proxyCDN(url), label: 'CDN' },
              { url: p48.proxySegment(url), label: '后端' },
              { url, label: '直连' }
            ]
        const t0 = performance.now()

        const doFetch = async (fetchUrl, label) => {
          const resp = await fetch(fetchUrl, { signal: ctrl.signal })
          if (!resp.ok) {
            let msg = `HTTP ${resp.status}`
            try { const body = await resp.json(); msg += `: ${body.error}` } catch {}
            throw new Error(msg)
          }
          return { label, data: await resp.arrayBuffer() }
        }

        try {
          const result = await Promise.any(SOURCES.map(s => doFetch(s.url, s.label)))
          const elapsed = (performance.now() - t0).toFixed(0)
          const retryTag = attempt > 0 ? ` (重试${attempt})` : ''
          addLog(`${prefix} ✅ ${result.label} ${elapsed}ms${retryTag}`)
          return result
        } catch (e) {
          const msgs = e instanceof AggregateError ? e.errors.map(err => err.message).join('; ') : e.message
          if (attempt < MAX_RETRIES - 1) {
            addLog(`${prefix} ⚠️ 失败: ${msgs}，重试 ${attempt + 1}/${MAX_RETRIES - 1}`)
          } else {
            addLog(`${prefix} ❌ 最终失败: ${msgs}`)
            throw new Error(msgs)
          }
        } finally {
          clearTimeout(tid)
          ctrl.abort()
        }
      }
    }

    const copyable = ['ts', 'mp4', 'mkv', 'avi', 'mov', 'webm', 'm4a']

    for (let i = 0; i < clipList.value.length; i++) {
      const clip = clipList.value[i]
      try {
        const safeName = clip.name || `clip_${i}`
        const outExt = '.' + format
        const outputName = `output_${i}${outExt}`

        const startSec = p48.timeToSeconds(clip.start)
        const endSec = p48.timeToSeconds(clip.end)
        const padding = 10

        addLog(`📥 [${i + 1}/${clipList.value.length}] 下载分片: ${safeName}`)

        const paddedStart = Math.max(0, startSec - padding)
        const paddedEnd = endSec + padding
        let currentTime = 0
        const neededSegs = []
        let firstSegStart = 0
        for (const seg of segments) {
          const segEnd = currentTime + seg.duration
          if (segEnd > paddedStart && currentTime < paddedEnd) {
            if (neededSegs.length === 0) firstSegStart = currentTime
            neededSegs.push(seg)
          }
          currentTime = segEnd
          if (currentTime >= paddedEnd) break
        }

        addLog(`  需下载 ${neededSegs.length} 个分片`)

        const buffers = new Array(neededSegs.length)
        const pathWins = { CDN: 0, '后端': 0, '直连': 0 }
        let nextIdx = 0

        const worker = async () => {
          while (true) {
            const idx = nextIdx
            nextIdx++
            if (idx >= neededSegs.length) break
            const result = await fetchSeg(neededSegs[idx].url, idx, neededSegs.length)
            pathWins[result.label]++
            buffers[idx] = result.data
          }
        }

        const workers = []
        const workerCount = Math.min(concurrency.value, neededSegs.length)
        for (let w = 0; w < workerCount; w++) workers.push(worker())
        await Promise.all(workers)

        addLog(`  📡 CDN:${pathWins.CDN} 后端:${pathWins['后端']} 直连:${pathWins['直连']}`)

        const totalLen = buffers.reduce((a, b) => a + b.byteLength, 0)
        if (totalLen > 1.4 * 1024 * 1024 * 1024) {
          throw new Error(`下载数据 ${(totalLen / 1024 / 1024 / 1024).toFixed(1)}GB 超过浏览器 WASM 内存上限 (1.4GB)`)
        }

        const concatData = new Uint8Array(totalLen)
        let off = 0
        for (const buf of buffers) { concatData.set(new Uint8Array(buf), off); off += buf.byteLength }
        buffers.length = 0

        await ffmpegMgr.ffmpeg.writeFile('concat.ts', concatData)
        addLog(`✂️ [${i + 1}/${clipList.value.length}] 剪切: ${safeName} -> ${format.toUpperCase()}`)

        const clipOffset = startSec - firstSegStart
        const clipDuration = endSec - startSec
        const baseCmd = ['-ss', String(clipOffset), '-i', 'concat.ts', '-to', String(clipOffset + clipDuration)]

        if (copyable.includes(format)) {
          try {
            const copyCmd = isAudio ? [...baseCmd, '-vn', '-c:a', 'copy', outputName] : [...baseCmd, '-c', 'copy', outputName]
            await ffmpegMgr.ffmpeg.exec(copyCmd)
            await ffmpegMgr.ffmpeg.readFile(outputName)
          } catch {
            addLog('  ⚠️ copy 失败，回退重编码...')
            const encArgs = isAudio ? ['-vn', ...getAudioEncoder(format)] : ['-c:v', 'libx264', '-c:a', 'aac']
            await ffmpegMgr.ffmpeg.exec([...baseCmd, ...encArgs, outputName])
          }
        } else {
          addLog('  ⚡ 直接重编码...')
          const encArgs = isAudio ? ['-vn', ...getAudioEncoder(format)] : ['-c:v', 'libx264', '-c:a', 'aac']
          await ffmpegMgr.ffmpeg.exec([...baseCmd, ...encArgs, outputName])
        }

        try {
          const data = await ffmpegMgr.ffmpeg.readFile(outputName)
          downloadBlob(data, safeName + outExt)
          await ffmpegMgr.ffmpeg.deleteFile(outputName)
          completedCount++
        } catch (readErr) {
          addLog(`  ❌ 读取输出文件失败: ${readErr.message}`)
          failedClips.push({ name: safeName, error: readErr.message })
          await ffmpegMgr.ffmpeg.deleteFile('concat.ts')
          continue
        }

        await ffmpegMgr.ffmpeg.deleteFile('concat.ts')

        if (!(await ffmpegMgr.isAlive())) {
          addLog('♻️ FFmpeg 实例已终止，正在重建...')
          await ffmpegMgr.restart()
        }

        progress.value = Math.round(((i + 1) / clipList.value.length) * 100)
      } catch (e) {
        addLog(`  ❌ 跳过该片段: ${e.message}`)
        failedClips.push({ name: clip.name || `clip_${i}`, error: e.message })
        try { await ffmpegMgr.ffmpeg.deleteFile('concat.ts') } catch {}
      }
    }

    if (failedClips.length > 0) {
      addLog(`⚠️ ${failedClips.length} 个片段失败: ${failedClips.map(c => c.name).join(', ')}`)
    }

    if (completedCount === 0) {
      addLog('❌ 没有成功处理的片段')
      ElMessage.error('所有片段处理失败')
    } else {
      downloadBlob(new Blob([recordContent], { type: 'text/plain;charset=utf-8' }), `_clip_record_${props.member}_${new Date().toISOString().slice(0, 10)}.txt`)
      const summary = `🎉 完成！成功 ${completedCount}/${clipList.value.length}`
      addLog(summary)
      ElMessage.success(summary)
    }
  } catch (err) {
    console.error(err)
    addLog(`❌ 错误: ${err.message}`)
    ElMessage.error('处理出错，报错请看下方日志')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.p48-clip-panel {
  overflow-y: auto;
}
.info-row {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  align-items: baseline;
}
.info-label {
  color: #888;
  font-size: 12px;
  flex-shrink: 0;
  min-width: 60px;
}
.info-value {
  color: #ccc;
  font-size: 13px;
  word-break: break-word;
}
.m3u8-text {
  font-size: 11px;
  word-break: break-all;
  color: #888;
}
.clip-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}
.clip-item {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0;
}
.clip-input {
  background: transparent;
  border: 1px solid #444;
  border-radius: 4px;
  color: #ccc;
  font-size: 13px;
  padding: 4px 8px;
  outline: none;
}
.clip-input:focus {
  border-color: #409eff;
}
.clip-input.name {
  flex: 1;
  min-width: 0;
}
.clip-input.time {
  width: 70px;
}
.clip-del {
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 16px;
  cursor: pointer;
  padding: 2px 6px;
  line-height: 1;
}
.clip-del:hover {
  color: #ff4444;
}
.settings-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.label {
  font-size: 12px;
  color: #888;
}
.log-box {
  margin-top: 12px;
  background: rgba(0,0,0,0.3);
  color: #0f0;
  font-family: 'Consolas', 'Courier New', monospace;
  padding: 10px;
  border-radius: 6px;
  height: 160px;
  overflow-y: auto;
  font-size: 11px;
  line-height: 1.5;
}
.log-line {
  margin-bottom: 1px;
  word-break: break-all;
}
:deep(.el-radio.is-bordered) {
  color: #ccc;
  border-color: #444;
  background: transparent;
}
:deep(.el-select) { --el-select-bg-color: transparent; }
:deep(.el-input-number) { --el-input-bg-color: transparent; }
</style>
