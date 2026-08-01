<template>
  <div class="replay-player">
    <div ref="containerRef" class="artplayer-container" />
  </div>
</template>

<script setup>
import { ref, shallowRef, markRaw, onMounted, onBeforeUnmount, watch } from 'vue'
import ArtPlayer from 'artplayer'
import Hls from 'hls.js'
import danmukuPlugin from 'artplayer-plugin-danmuku'
import { parseLRC } from '@/utils/danmaku'

const props = defineProps({
  m3u8Url: { type: String, required: true },
  rawM3u8Url: { type: String, default: '' },
  danmakuUrl: { type: String, default: '' },
  coverUrl: { type: String, default: '' }
})

const emit = defineEmits(['ready', 'danmaku-error', 'duration'])
const playerDuration = ref('')

const containerRef = ref(null)
const art = shallowRef(null)
const danmakuData = ref([])
let playerReady = false
let danmukuPluginInstance = null

async function fetchDanmaku() {
  if (!props.danmakuUrl) {
    console.log('[Danmaku] no URL, skipping')
    emit('danmaku-error', '弹幕地址缺失（API未返回msgFilePath）')
    return
  }
  try {
    const text = await fetchWithRetry(props.danmakuUrl)
    console.log('[Danmaku] raw first 3 lines:', text.split('\n').slice(0, 3))
    danmakuData.value = parseLRC(text)
    console.log('[Danmaku] parsed', danmakuData.value.length, 'items, first:', danmakuData.value[0])
    if (danmakuData.value.length === 0) {
      emit('danmaku-error', '弹幕数据为空或解析失败')
    }
  } catch (e) {
    console.log('[Danmaku] error:', e.message)
    emit('danmaku-error', '弹幕加载失败: ' + e.message)
  }
}

function showOverlayDanmaku() {
  if (!playerReady || !danmukuPluginInstance || danmakuData.value.length === 0) return
  danmukuPluginInstance.load(danmakuData.value)
  danmukuPluginInstance.show()
}

function hideOverlayDanmaku() {
  danmukuPluginInstance?.hide(true)
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      return await resp.text()
    } catch (e) {
      if (i === retries - 1) throw e
      console.warn(`[HLS] M3U8 第${i + 1}次失败，${retries - i - 1}秒后重试...`)
      await new Promise(r => setTimeout(r, (i + 1) * 1000))
    }
  }
}

defineExpose({ danmakuData, art, playerDuration, showOverlayDanmaku, hideOverlayDanmaku })

onMounted(async () => {
  if (!containerRef.value) return

  art.value = markRaw(new ArtPlayer({
    container: containerRef.value,
    url: props.m3u8Url,
    type: 'm3u8',
    poster: props.coverUrl || '',
    customType: {
      m3u8: function (video, url, artInstance) {
        if (Hls.isSupported()) {
          fetchWithRetry(url).then(text => {
            const cdnOrigin = new URL(props.rawM3u8Url || 'https://idol-vod.48.cn').origin
            const cdnPath = new URL(props.rawM3u8Url || 'https://idol-vod.48.cn/').pathname
            const baseDir = cdnPath.substring(0, cdnPath.lastIndexOf('/') + 1)
            // Rewrite TS segment URLs to direct CDN. TS files have ACAO:*.
            const rewritten = text.replace(
              /^(?!#)([^\s]+\.ts[^\s]*)$/gm,
              (match) => {
                if (match.startsWith('http')) {
                  return cdnOrigin + new URL(match).pathname
                }
                if (match.startsWith('/')) {
                  return cdnOrigin + match
                }
                return cdnOrigin + baseDir + match
              }
            )
            const blobUrl = URL.createObjectURL(new Blob([rewritten], { type: 'application/vnd.apple.mpegurl' }))
            const hls = new Hls({
              enableWorker: true,
              maxBufferLength: 60,
              maxMaxBufferLength: 120,
              startFragPrefetch: false,
              testBandwidth: false,
              fragLoadingTimeOut: 10000,
              fragLoadingMaxRetry: 3,
              fragLoadingRetryDelay: 500
            })
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  hls.startLoad()
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                  hls.recoverMediaError()
                }
              }
            })
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
              const sec = data.levels?.[0]?.details?.totalduration || 0
              if (sec > 0) {
                const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60)
                playerDuration.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
                emit('duration', playerDuration.value)
              }
            })
            hls.loadSource(blobUrl)
            hls.attachMedia(video)
            artInstance.hls = hls
            artInstance.on('destroy', () => { hls.destroy(); URL.revokeObjectURL(blobUrl) })
          }).catch(e => console.error('[HLS] failed:', e))
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url
        }
      }
    },
    plugins: [
      danmukuPlugin({
        danmuku: [],
        speed: 144,
        opacity: 1,
        fontSize: window.innerWidth <= 768 ? 16 : 24,
        margin: [10, 30],
        heatmap: false,
        emitter: false
      })
    ],
    flip: false,
    playbackRate: true,
    aspectRatio: true,
    pip: true,
    screenshot: true,
    setting: true,
    hotkey: true,
    autoSize: true,
    autoMini: window.innerWidth > 768,
    loop: false,
    fullscreen: true,
    fullscreenWeb: true,
    subtitleOffset: false,
    miniProgressBar: true,
    mutex: true,
    theme: '#409eff',
    lang: 'zh-cn'
  }))

  for (const key of Object.getOwnPropertyNames(art.value.plugins)) {
    const p = art.value.plugins[key]
    if (p && typeof p.load === 'function') {
      danmukuPluginInstance = p
      break
    }
  }

  art.value.on('ready', () => {
    playerReady = true

    if (window.innerWidth <= 768) {
      ['fullscreenWeb', 'volume', 'setting', 'pip', 'screenshot', 'playbackRate', 'aspectRatio', 'airplay', 'flip'].forEach(name => {
        try { art.value.controls.remove(name) } catch {}
      })
    }

    showOverlayDanmaku()
    emit('ready')
  })

  await fetchDanmaku()
  showOverlayDanmaku()
})

onBeforeUnmount(() => {
  if (art.value) {
    art.value.destroy()
    art.value = null
  }
})
</script>

<style scoped>
/* Apd = ArtPlayer Danmuku */
.replay-player {
  width: 100%;
  flex: 1;
  height: 100%;
  min-height: 300px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
.artplayer-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
/* Hide danmaku send UI (keep toggle + settings + switch) */
.apd-input,
.apd-send,
.apd-info {
  display: none !important;
}
</style>
