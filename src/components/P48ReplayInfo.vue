<template>
  <div class="replay-info-panel">
    <div class="cover-section">
      <div class="cover-toggle">
        <el-switch v-model="showCover" active-text="显示封面" />
      </div>
      <transition name="el-fade-in">
        <div v-if="showCover && coverUrl" class="cover-image-wrapper">
          <img :src="coverUrl" class="cover-image" />
        </div>
      </transition>
      <div class="download-buttons">
        <el-button size="small" :disabled="!coverUrl" @click="downloadCover">
          <el-icon><Download /></el-icon> 下载封面
        </el-button>
        <el-button size="small" :disabled="!danmakuUrl" @click="downloadDanmaku">
          <el-icon><Download /></el-icon> 下载弹幕
        </el-button>
      </div>
    </div>

    <div class="info-list">
      <div class="info-row"><span class="info-label">Live ID</span><span class="info-value">{{ info?.liveId || '-' }}</span></div>
      <div class="info-row"><span class="info-label">类型</span><span class="info-value">{{ typeLabel }}</span></div>
      <div class="info-row"><span class="info-label">时间</span><span class="info-value">{{ formattedTime }}</span></div>
      <div class="info-row"><span class="info-label">时长</span><span class="info-value">{{ playerDuration || preciseDuration || info?.duration || '-' }}</span></div>
      <div class="info-row"><span class="info-label">标题</span><span class="info-value">{{ info?.title || '(无标题)' }}</span></div>
      <div class="info-row" v-if="info?.announcement"><span class="info-label">公告</span><span class="info-value announcement-text">{{ info.announcement }}</span></div>
      <div class="info-row"><span class="info-label">成员</span><span class="info-value">{{ memberInfo }}</span></div>
      <div class="info-row" v-if="info?.userInfo?.starName"><span class="info-label">真实姓名</span><span class="info-value">{{ info.userInfo.starName }}</span></div>
      <div class="info-row" v-if="info?.userInfo?.level"><span class="info-label">等级</span><span class="info-value">{{ info.userInfo.level }}</span></div>
      <div class="info-row" v-if="roleLabel"><span class="info-label">身份</span><span class="info-value">{{ roleLabel }}</span></div>
      <div class="info-row" v-if="info?.onlineNum !== undefined"><span class="info-label">观看人数</span><span class="info-value">{{ formatNum(info.onlineNum) }}</span></div>
      <div class="info-row" v-if="info?.playNum !== undefined"><span class="info-label">播放次数</span><span class="info-value">{{ formatNum(info.playNum) }}</span></div>
      <div class="info-row" v-if="coverSize"><span class="info-label">封面尺寸</span><span class="info-value">{{ coverSize }}</span></div>
      <div class="info-row" v-if="info?.inMicrophoneConnection !== undefined"><span class="info-label">连麦中</span><span class="info-value">{{ info.inMicrophoneConnection ? '是' : '否' }}</span></div>
      <div class="info-row" v-if="info?.inMicrophonePkConnection !== undefined"><span class="info-label">PK连麦</span><span class="info-value">{{ info.inMicrophonePkConnection ? '是' : '否' }}</span></div>
      <div class="info-row" v-if="m3u8Url"><span class="info-label">M3U8</span><span class="info-value m3u8-text">{{ m3u8Url }}</span></div>
      <div class="info-row" v-if="danmakuSourceUrl"><span class="info-label">弹幕地址</span><span class="info-value m3u8-text">{{ danmakuSourceUrl }}</span></div>
      <div class="info-row" v-if="coverSourceUrl"><span class="info-label">封面地址</span><span class="info-value m3u8-text">{{ coverSourceUrl }}</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download } from '@element-plus/icons-vue'

const props = defineProps({
  info: { type: Object, default: null },
  coverUrl: { type: String, default: '' },
  danmakuUrl: { type: String, default: '' },
  m3u8Url: { type: String, default: '' },
  preciseDuration: { type: String, default: '' },
  coverSourceUrl: { type: String, default: '' },
  danmakuSourceUrl: { type: String, default: '' },
  playerDuration: { type: String, default: '' }
})

const showCover = ref(false)

const typeLabel = computed(() => {
  const t = props.info?.liveType
  return t === 1 ? '直播' : t === 2 ? '电台' : t === 5 ? '游戏' : t === 6 ? 'AI' : '未知'
})

const typeTag = computed(() => {
  const t = props.info?.liveType
  return t === 1 ? 'primary' : t === 2 ? 'warning' : 'info'
})

const formattedTime = computed(() => {
  if (!props.info?.ctime) return '-'
  const d = new Date(Number(props.info.ctime))
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

const memberInfo = computed(() => {
  const ui = props.info?.userInfo
  if (!ui) return '谭思慧'
  return `${ui.nickname || '谭思慧'}`
})

const roleLabel = computed(() => {
  const role = props.info?.userInfo?.userRole
  return role === 3 ? '偶像' : role !== undefined ? String(role) : ''
})

const coverSize = computed(() => {
  const w = props.info?.coverWidth
  const h = props.info?.coverHeight
  return w && h ? `${w}×${h}` : ''
})

function formatNum(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

function downloadCover() {
  if (!props.coverUrl) return
  const a = document.createElement('a')
  a.href = props.coverUrl
  a.download = `cover_${props.info?.liveId || 'replay'}.jpg`
  a.target = '_blank'
  a.click()
}

async function downloadDanmaku() {
  if (!props.danmakuUrl) return
  try {
    const resp = await fetch(props.danmakuUrl)
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `danmaku_${props.info?.liveId || 'replay'}.lrc`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    // fallback: direct open
    window.open(props.danmakuUrl, '_blank')
  }
}
</script>

<style scoped>
.replay-info-panel {
  color: #e0e0e0;
}
.cover-section {
  margin-bottom: 12px;
}
.cover-toggle {
  margin-bottom: 10px;
}
.cover-image-wrapper {
  margin-bottom: 10px;
}
.cover-image {
  width: 100%;
  max-width: 320px;
  border-radius: 8px;
  border: 1px solid #333;
}
.download-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.announcement-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  color: #ccc;
  max-height: 120px;
  overflow-y: auto;
  display: block;
}
.m3u8-text {
  font-size: 11px;
  word-break: break-all;
  color: #888;
}
:deep(.el-switch__label) {
  color: #888 !important;
}
.info-list {
  display: flex;
  flex-direction: column;
}
.info-row {
  display: flex;
  gap: 10px;
  padding: 5px 0;
  align-items: baseline;
}
.info-label {
  color: #888;
  font-size: 12px;
  flex-shrink: 0;
  min-width: 80px;
}
.info-value {
  color: #ccc;
  font-size: 13px;
  word-break: break-word;
}
</style>
