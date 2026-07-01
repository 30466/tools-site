<template>
  <div class="danmaku-timeline" ref="listRef" @scroll="onUserScroll">
    <div v-if="items.length === 0" class="empty-state">暂无弹幕数据</div>
    <div
      v-for="(dm, idx) in items"
      :key="idx"
      class="dm-item"
      :class="{ active: idx === activeIdx }"
      @click="$emit('seek', dm.time)"
    >
      <span class="dm-time">{{ formatTime(dm.time) }}</span>
      <span class="dm-user">{{ dm.user }}</span>
      <span class="dm-text" :style="{ color: dm.color }">{{ dm.text }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const emit = defineEmits(['seek'])
const props = defineProps({
  danmakuData: { type: Array, default: () => [] },
  currentTime: { type: Number, default: 0 }
})

const items = computed(() => props.danmakuData)
const activeIdx = ref(-1)
const prevActiveIdx = ref(-1)
const listRef = ref(null)
let rafId = null
let lastUserScrollTime = 0
const SCROLL_RESET_DELAY = 4000

function onUserScroll() {
  lastUserScrollTime = Date.now()
}

function updateActive() {
  const t = props.currentTime
  let idx = -1
  for (let i = items.value.length - 1; i >= 0; i--) {
    if (items.value[i].time <= t) {
      idx = i
      break
    }
  }
  prevActiveIdx.value = activeIdx.value
  activeIdx.value = idx

  if (idx >= 0 && idx !== prevActiveIdx.value && Date.now() - lastUserScrollTime > SCROLL_RESET_DELAY) {
    const el = listRef.value.children[idx]
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
    }
  }

  rafId = requestAnimationFrame(updateActive)
}

watch(() => items.value.length, (len) => {
  if (len > 0 && rafId === null) {
    rafId = requestAnimationFrame(updateActive)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped>
.danmaku-timeline {
  overflow-y: auto;
  background: transparent;
  padding: 8px 0;
}
.dm-item {
  display: flex;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 4px;
  transition: background 0.15s;
  cursor: pointer;
}
.dm-item:hover {
  background: rgba(255,255,255,0.08);
}
.dm-item.active {
  background: rgba(64, 158, 255, 0.2);
}
.dm-time {
  font-family: monospace;
  font-size: 12px;
  color: #888;
  flex-shrink: 0;
  width: 48px;
}
.dm-user {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dm-text {
  font-size: 13px;
  word-break: break-word;
  color: #ccc;
}
.empty-state {
  color: #888;
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
}
</style>
