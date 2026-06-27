import { ref } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { ElMessage } from 'element-plus'

async function fetchToBlobURL(url, mime, signal) {
  const resp = await fetch(url, { signal })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  const blob = await resp.blob()
  return URL.createObjectURL(blob)
}

export class FFmpegManager {
  constructor(addLog) {
    this.addLog = addLog
    this.ffmpeg = new FFmpeg()
    this.isLoaded = ref(false)
    this.isLoading = ref(false)
    this._coreBlobURL = null
    this._wasmBlobURL = null
  }

  async load() {
    if (this.isLoaded.value || this.isLoading.value) return
    this.isLoading.value = true
    try {
      await this._doLoad()
      this.isLoaded.value = true
      this.addLog('✅ FFmpeg 组件加载完成！准备就绪。')
      ElMessage.success('FFmpeg 组件加载完成！准备就绪。')
    } catch (error) {
      console.error(error)
      this.addLog('❌ FFmpeg 加载致命错误！')
      ElMessage.error('FFmpeg 加载失败，报错请看下方日志')
      if (error.message) {
        this.addLog(`错误信息: ${error.message}`)
      } else {
        this.addLog(`错误对象: ${JSON.stringify(error)}`)
      }
      if (error.message && error.message.includes('failed to import')) {
        this.addLog('💡 推测原因: 找不到 ffmpeg-core.js 文件 (404) 或者文件内容损坏。')
        this.addLog('请检查 CDN 地址是否可访问。')
      }
      throw error
    } finally {
      this.isLoading.value = false
    }
  }

  async _doLoad() {
    const CDN_SOURCES = [
      { name: 'npmmirror (淘宝镜像)', url: 'https://registry.npmmirror.com/@ffmpeg/core/0.12.10/files/dist/esm/' },
      { name: 'jsdelivr', url: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/' },
      { name: '自有服务器', url: '/ffmpeg/' },
    ]

    this.ffmpeg.on('log', ({ message }) => {
      if (!message.startsWith('frame=')) {
        this.addLog(`[FFmpeg内核] ${message}`)
      }
    })
    this.ffmpeg.on('progress', () => {})

    let lastError = null
    for (const source of CDN_SOURCES) {
      try {
        this.addLog(`🔍 正在加载核心文件 (${source.name})...`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 20000)
        try {
          this._coreBlobURL = await fetchToBlobURL(`${source.url}ffmpeg-core.js`, 'text/javascript', controller.signal)
          this._wasmBlobURL = await fetchToBlobURL(`${source.url}ffmpeg-core.wasm`, 'application/wasm', controller.signal)
        } finally {
          clearTimeout(timeoutId)
        }
        this.addLog(`✅ ${source.name} 加载成功`)
        await this.ffmpeg.load({ coreURL: this._coreBlobURL, wasmURL: this._wasmBlobURL })
        return
      } catch (e) {
        lastError = e
        this.addLog(`  ⚠️ ${source.name} 加载失败: ${e.message}`)
      }
    }
    throw lastError || new Error('所有 CDN 源均加载失败')
  }

  async isAlive() {
    try {
      await this.ffmpeg.writeFile('_hc_.tmp', new Uint8Array(1))
      await this.ffmpeg.deleteFile('_hc_.tmp')
      return true
    } catch {
      return false
    }
  }

  async restart() {
    this.ffmpeg = new FFmpeg()
    this.ffmpeg.on('log', ({ message }) => {
      if (!message.startsWith('frame=')) {
        this.addLog(`[FFmpeg内核] ${message}`)
      }
    })
    this.ffmpeg.on('progress', () => {})
    if (this._coreBlobURL && this._wasmBlobURL) {
      await this.ffmpeg.load({ coreURL: this._coreBlobURL, wasmURL: this._wasmBlobURL })
      this.addLog('✅ FFmpeg 实例已重建')
    } else {
      await this.load()
    }
  }
}
