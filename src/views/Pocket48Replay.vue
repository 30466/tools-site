<template>
  <div class="replay-page" :class="{ 'split-mode': currentReplay }">
    <!-- Member Selection (always visible when no replay selected) -->
    <template v-if="!currentReplay">
      <div class="member-section">
        <div class="step-label"><el-icon><User /></el-icon> 选择成员</div>
        <div v-if="loadingCache" style="max-width: 350px">
          <el-skeleton :rows="1" animated />
        </div>
        <div v-else class="member-select">
          <el-autocomplete
            v-model="memberQuery"
            :fetch-suggestions="querySearch"
            placeholder="输入成员姓名模糊搜索"
            :trigger-on-focus="false"
            clearable
            size="large"
            style="width: 350px"
            @select="handleSelect"
          >
            <template #default="{ item }">
              <div class="suggestion-item">{{ item.value }}</div>
            </template>
          </el-autocomplete>
          <transition name="el-fade-in">
            <div v-if="selectedMember" class="selected-member-badge">
              <el-avatar :size="32" :src="p48.proxyAvatar(selectedMember.detail?.avatar_url)">
                {{ selectedMember.name[0] }}
              </el-avatar>
              <div>
                <div class="badge-name">{{ selectedMember.name }}</div>
                <div v-if="selectedMember.detail" class="badge-meta">
                  {{ selectedMember.detail.group_name }} / {{ selectedMember.detail.team }}
                </div>
              </div>
              <el-tag size="small" type="success" effect="plain">已选择</el-tag>
            </div>
          </transition>
        </div>
      </div>

      <!-- State A: Calendar -->
      <template v-if="selectedMember">
        <P48ReplayCalendar
          ref="calendarRef"
          :key="selectedMember.name"
          :member-name="selectedMember.name"
          :room-map-cache="roomMapCache"
          @select-replay="onSelectReplay"
        />
      </template>
    </template>

    <!-- State B: Split layout -->
    <template v-else>
      <div class="split-container">
        <div class="player-area" :class="{ 'player-full': !showPanel }">
          <P48ReplayPlayer
            :key="currentReplay?.liveId"
            ref="playerRef"
            :m3u8-url="replayDetail?.proxiedM3U8 || ''"
            :raw-m3u8-url="replayDetail?.m3u8Url || ''"
            :danmaku-url="replayDetail?.danmakuUrl || ''"
            :cover-url="replayDetail?.coverUrl || ''"
            @ready="onPlayerReady"
            @duration="onPlayerDuration"
            @danmaku-error="onDanmakuError"
          />
          <div class="player-overlay-top">
            <el-button @click="backToCalendar" size="small" plain>
              <el-icon><ArrowLeft /></el-icon> 返回日历
            </el-button>
            <span class="overlay-title">
              {{ selectedMember?.name || '' }} · {{ fmtDate(currentReplay.ctime) }} · {{ liveTypeLabel }} · {{ measuredDuration || currentReplay.duration || '--' }}
            </span>
          </div>
          <div class="player-expand-btn" @click="showPanel = !showPanel">
            {{ showPanel ? '收起右边分页 ▶' : '展开右边分页 ◀' }}
          </div>
        </div>

        <div class="panel-area" v-show="panelVisible">
          <div class="panel-header">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="录播信息" name="info" />
              <el-tab-pane label="批量剪切" name="clip" />
              <el-tab-pane v-if="!isMobile" label="弹幕跟随" name="danmaku" />
            </el-tabs>
          </div>
          <div class="panel-body">
            <P48ReplayInfo v-show="activeTab==='info'" :info="replayDetail?.info" :cover-url="replayDetail?.coverUrl||''" :danmaku-url="replayDetail?.danmakuUrl||''" :m3u8-url="replayDetail?.m3u8Url||''" :cover-source-url="replayDetail?.coverSourceUrl||''" :danmaku-source-url="replayDetail?.danmakuSourceUrl||''" :player-duration="measuredDuration" />
            <P48ClipPanel v-show="activeTab==='clip'" :m3u8-url="replayDetail?.m3u8Url||''" :member="selectedMember?.name||''" :broadcast-time="formattedBroadcastTime" />
            <P48DanmakuTimeline v-show="activeTab==='danmaku'" :danmaku-data="playerDanmaku" :current-time="playerTime" @seek="onDanmakuSeek" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User } from '@element-plus/icons-vue'
import P48ReplayCalendar from '@/components/P48ReplayCalendar.vue'
import P48ReplayPlayer from '@/components/P48ReplayPlayer.vue'
import P48ReplayInfo from '@/components/P48ReplayInfo.vue'
import P48ClipPanel from '@/components/P48ClipPanel.vue'
import P48DanmakuTimeline from '@/components/P48DanmakuTimeline.vue'
import * as p48 from '@/api/pocket48'

const CACHE_KEY = 'replay_state'

const route = useRoute()
const router = useRouter()

const currentReplay = ref(null)
const replayDetail = ref(null)
const activeTab = ref('info')
const formattedBroadcastTime = ref('')
const isMobile = ref(window.innerWidth <= 768)
const showPanel = ref(true)
const panelVisible = computed(() => showPanel.value || isMobile.value)

const liveTypeLabel = computed(() => {
  const t = currentReplay.value?.liveType
  return t === 1 ? '直播' : t === 2 ? '电台' : t === 5 ? '游戏' : 'AI'
})

const playerRef = ref(null)
const calendarRef = ref(null)
const playerDanmaku = ref([])
const playerTime = ref(0)
const measuredDuration = ref('')

function onPlayerDuration(dur) { measuredDuration.value = dur }
let timeTimer = null

// --- Member Selection ---
const memberQuery = ref('')
const selectedMember = ref(null)
const mappingCache = ref(null)
const roomMapCache = ref(null)
const loadingCache = ref(true)

onMounted(async () => {
  try {
    mappingCache.value = await p48.getMapping()
  } catch (err) {
    ElMessage.error('mapping API 失败: ' + err.message)
    loadingCache.value = false
    return
  }
  try {
    roomMapCache.value = await p48.getRoomMap()
  } catch (err) {
    ElMessage.error('room-map API 失败: ' + err.message)
    loadingCache.value = false
    return
  }
  loadingCache.value = false

  if (route.query.live) autoLoadFromURL()
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', onResize)
})

const querySearch = (query, cb) => {
  if (!query || !mappingCache.value) {
    cb([])
    return
  }
  const q = query.trim()
  const results = []
  for (const [name, memberId] of Object.entries(mappingCache.value)) {
    if (name.includes(q)) {
      results.push({ value: name, memberId })
    }
  }
  cb(results)
}

const handleSelect = async (item) => {
  const pocketId = roomMapCache.value?.[item.value]
  if (!pocketId) {
    ElMessage.warning(`未找到 ${item.value} 的口袋48房间号`)
    return
  }

  selectedMember.value = {
    name: item.value,
    memberId: item.memberId,
    pocketId,
    detail: null
  }

  const detail = await p48.getMemberDetail(item.memberId).catch(() => null)
  if (detail) {
    selectedMember.value = { ...selectedMember.value, detail }
  }
}

watch(memberQuery, (val) => {
  if (!val && selectedMember.value) {
    selectedMember.value = null
  }
})

// --- Player state ---
function saveState() {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      currentReplay: currentReplay.value,
      replayDetail: replayDetail.value,
      formattedBroadcastTime: formattedBroadcastTime.value,
      showPanel: showPanel.value,
      activeTab: activeTab.value,
      selectedMember: selectedMember.value
    }))
  } catch {}
}

function clearState() {
  try { sessionStorage.removeItem(CACHE_KEY) } catch {}
}

function restoreState(liveId) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return false
    const saved = JSON.parse(raw)
    if (!saved.currentReplay || String(saved.currentReplay.liveId) !== String(liveId)) return false
    if (!saved.replayDetail?.m3u8Url) return false
    currentReplay.value = saved.currentReplay
    replayDetail.value = saved.replayDetail
    formattedBroadcastTime.value = saved.formattedBroadcastTime || ''
    showPanel.value = saved.showPanel !== false
    activeTab.value = saved.activeTab || 'info'
    if (saved.selectedMember) selectedMember.value = saved.selectedMember
    return true
  } catch { return false }
}

function fmtTime(ms) {
  if (!ms) return ''
  const d = new Date(+ms), p = n => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

function fmtDate(ms) {
  if (!ms) return ''
  const d = new Date(+ms), p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

async function onSelectReplay(r, options = {}) {
  playerDanmaku.value = []
  playerTime.value = 0
  showPanel.value = true
  activeTab.value = 'info'

  try {
    let c = options.prefetchedContent
    if (!c) {
      const detail = await p48.getLiveOne(r.liveId)
      c = detail?.content || {}
    }

    const merged = { ...r, ...c }
    const raw = merged.playStreamPath || ''
    if (!raw) { ElMessage.error('该录播暂无播放流'); return }

    replayDetail.value = {
      info: merged,
      m3u8Url: raw,
      proxiedM3U8: p48.proxyCDN(raw),
      danmakuUrl: merged.msgFilePath
        ? merged.msgFilePath.replace('https://source.48.cn', '/source48')
        : '',
      danmakuSourceUrl: merged.msgFilePath || '',
      coverUrl: merged.coverPath ? `/source48${merged.coverPath}` : '',
      coverSourceUrl: merged.coverPath ? `https://source.48.cn${merged.coverPath}` : ''
    }

    currentReplay.value = merged
    formattedBroadcastTime.value = fmtDate(merged.ctime).replace(/[-: ]/g, c => c===' '?'~':c===':'?'.':'-')
    saveState()
    router.replace({ query: { live: merged.liveId } })
  } catch (e) {
    ElMessage.error('获取录播详情失败: ' + e.message)
  }
}

function backToCalendar() {
  currentReplay.value = null
  replayDetail.value = null
  clearState()
  router.replace({ query: {} })
  nextTick(() => {
    calendarRef.value?.resetToLatest()
  })
}

function onDanmakuSeek(time) {
  const p = playerRef.value
  if (p?.art) {
    p.art.currentTime = time
    p.art.play()
  }
}

function onDanmakuError(msg) {
  console.warn('[Replay] danmaku error:', msg)
  ElMessage.warning(msg)
}

async function onVisibilityChange() {
  if (document.visibilityState !== 'visible') return
  if (!currentReplay.value) return

  const hasData = currentReplay.value?.liveId && replayDetail.value?.m3u8Url
  if (!hasData) {
    const liveId = String(currentReplay.value?.liveId || route.query.live)
    if (!liveId) return
    try {
      const detail = await p48.getLiveOne(liveId)
      const c = detail?.content || {}
      if (!c.playStreamPath) { ElMessage.error('该录播无法播放'); return }
      await onSelectReplay({ liveId }, { prefetchedContent: c })
    } catch (e) {
      ElMessage.error('重新加载录播失败: ' + e.message)
    }
  }
}

function onPlayerReady() { pollPlayerState() }

function pollPlayerState() {
  clearInterval(timeTimer)
  timeTimer = setInterval(() => {
    const p = playerRef.value
    if (!p) return
    if (p.danmakuData?.length) playerDanmaku.value = [...p.danmakuData]
    if (p.art) {
      try { playerTime.value = p.art.currentTime || 0 } catch {}
    }
  }, 250)
}

async function autoLoadFromURL() {
  const liveId = route.query.live
  if (!liveId) return

  if (restoreState(liveId)) return

  try {
    const detail = await p48.getLiveOne(String(liveId))
    const c = detail?.content || {}
    if (!c.playStreamPath) {
      ElMessage.error('该录播无法播放'); return
    }
    await onSelectReplay({ liveId: String(liveId) }, { prefetchedContent: c })
  } catch (e) {
    ElMessage.error('加载录播失败: ' + e.message)
  }
}

onBeforeUnmount(() => {
  clearInterval(timeTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', onResize)
})

function onResize() {
  isMobile.value = window.innerWidth <= 768
}
</script>

<style scoped>
.replay-page { padding-bottom: 0; }

.split-mode { max-width: none; }

.split-mode .split-container {
  display: flex;
  height: calc(100vh - 56px);
  align-items: stretch;
}

.player-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #000;
}
.player-area.player-full { flex: 1; }

.panel-area {
  width: 400px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,0.35);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
  padding-left: 16px;
}

.panel-body {
  flex: 1;
  padding: 12px 16px 0;
  overflow-y: auto;
}

.player-overlay-top {
  position: absolute;
  top: 10px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}
.player-overlay-top > * { pointer-events: auto; }
.player-overlay-top .overlay-title {
  font-weight: 600; font-size: 14px; color: #fff;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}

.player-expand-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 12px 6px;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  font-size: 12px;
  z-index: 10;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
  user-select: none;
}
.player-expand-btn:hover {
  background: rgba(64,158,255,0.7);
}

:deep(.el-tabs__nav) { width: 100%; }
:deep(.el-tabs__item) { flex: 1; justify-content: center; color: #ccc; }
:deep(.el-tabs__item.is-active) { color: #409eff; }
:deep(.el-tabs__nav-wrap::after) { background: rgba(255,255,255,0.1); }

/* Member section */
.member-section {
  max-width: 700px;
  margin: 20px auto;
  padding: 0 16px;
}
.step-label {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
}
.member-select {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.suggestion-item {
  padding: 2px 0;
}
.selected-member-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  max-width: 380px;
}
.badge-name {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}
.badge-meta {
  font-size: 12px;
  color: #aaa;
}

@media (max-width: 768px) {
  .split-mode .split-container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .player-area {
    flex: none;
    width: 100%;
    height: 70vh;
    overflow: hidden;
  }

  .player-area .replay-player {
    min-height: 0 !important;
  }

  .panel-area {
    width: 100%;
    flex: 1;
  }

  .player-expand-btn {
    display: none;
  }

  .panel-header {
    padding-left: 8px;
  }

  .panel-body {
    padding: 8px 8px 0;
  }

  .player-overlay-top {
    top: 6px;
    left: 8px;
    gap: 6px;
  }

  .player-overlay-top .overlay-title {
    font-size: 12px;
  }

  .member-section {
    padding: 0 8px;
  }
}
</style>
