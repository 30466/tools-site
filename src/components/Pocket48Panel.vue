<template>
  <div class="p48-panel">
    <div class="section">
      <div class="step-label"><el-icon><User /></el-icon> Step 1: 选择成员</div>

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

    <div v-if="selectedMember" class="section">
      <div class="step-label"><el-icon><Calendar /></el-icon> Step 2: 选择日期</div>
      <el-alert type="info" :closable="false" show-icon style="margin-bottom: 10px">
        <template #title>
          日期归档规则：以次日 06:00 为界，凌晨 06:00 前的录播归档为前一天
        </template>
      </el-alert>

      <div class="date-jump">
        <el-input
          v-model="jumpDateStr"
          placeholder="YYYYMMDD"
          size="large"
          style="width: 160px"
          maxlength="8"
          @keyup.enter="onJumpDate"
        />
        <el-button size="large" @click="onJumpDate">跳转</el-button>
        <el-tag v-if="totalReplayCount > 0" type="info" effect="plain" size="large">
          共 {{ totalReplayCount }} 条录播
        </el-tag>
      </div>

      <div v-if="loadingReplays" class="loading-replays">
        <el-skeleton :rows="3" animated />
      </div>

      <div class="calendar-wrapper">
        <el-calendar v-model="calendarDate" style="max-width: 700px">
          <template #date-cell="{ data }">
            <div class="calendar-cell" @click="onDateClick(data.day)">
              <span v-if="hasReplay(data.day)" class="replay-badge">{{ data.day.split('-').pop() }}</span>
              <span v-else>{{ data.day.split('-').pop() }}</span>
            </div>
          </template>
        </el-calendar>
      </div>

      <div v-if="!loadingReplays && totalReplayCount === 0" class="no-replays">
        <el-empty description="该成员暂无录播记录" />
      </div>

      <div v-if="selectedDate && loadingReplays" class="loading-replay-list">
        <el-skeleton :rows="2" animated />
      </div>

      <div v-if="replaysForSelectedDate.length > 0" class="replay-list">
        <div class="replay-list-title">{{ selectedDate }} 的录播 ({{ replaysForSelectedDate.length }})</div>
        <div
          v-for="r in replaysForSelectedDate"
          :key="r.liveId"
          class="replay-item"
          :class="{ active: selectedReplay?.liveId === r.liveId }"
          @click="onReplaySelect(r)"
        >
          <div class="replay-info">
            <span class="replay-time">{{ formatReplayTime(r.ctime) }}</span>
            <el-tag :type="r.liveType === 1 ? 'primary' : r.liveType === 2 ? 'warning' : 'info'" size="small" effect="plain">
              {{ r.liveType === 1 ? '直播' : r.liveType === 2 ? '电台' : r.liveType === 5 ? '游戏' : 'AI' }}
            </el-tag>
            <span class="replay-title">{{ r.title || '(无标题)' }}</span>
            <span class="replay-duration" v-if="r.duration">{{ r.duration }}</span>
          </div>
          <el-icon v-if="selectedReplay?.liveId === r.liveId" class="check-icon"><CircleCheck /></el-icon>
        </div>
      </div>

      <div v-if="!loadingReplays && totalReplayCount > 0 && selectedDate && replaysForSelectedDate.length === 0" class="no-replays">
        <el-empty description="该日期无录播" />
      </div>
    </div>

    <div v-if="selectedReplay" class="section">
      <div class="step-label"><el-icon><Scissor /></el-icon> Step 3: 设置切片</div>

      <div class="source-info">
        <el-descriptions :column="2" size="small" border>
          <el-descriptions-item label="成员">{{ selectedMember.name }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ formatReplayTime(selectedReplay.ctime) }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ selectedReplay.title || '(无标题)' }}</el-descriptions-item>
          <el-descriptions-item label="时长">{{ selectedReplay.duration || '未知' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div style="margin-top: 12px; display: flex; gap: 10px">
        <el-button size="small" @click="triggerTxtUpload">📄 导入 TXT 切片本</el-button>
        <el-button size="small" @click="addEmptyRow">➕ 手动添加</el-button>
        <el-button size="small" type="danger" plain @click="clearList">🗑️ 清空</el-button>
        <input type="file" accept=".txt" @change="handleTxtSelect" style="display: none" ref="txtInputRef" />
      </div>

      <el-table :data="clipList" style="width: 100%; margin-top: 10px" border stripe max-height="300">
        <el-table-column label="片段名称" min-width="140">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="片段名" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="开始" width="100">
          <template #default="scope">
            <el-input v-model="scope.row.start" placeholder="00:00" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="结束" width="100">
          <template #default="scope">
            <el-input v-model="scope.row.end" placeholder="00:00" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center">
          <template #default="scope">
            <el-button type="danger" link @click="clipList.splice(scope.$index, 1)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="selectedReplay && clipList.length > 0" class="section">
      <div class="step-label"><el-icon><Cpu /></el-icon> Step 4: 执行剪切</div>

      <div class="settings-row">
        <div class="setting-item">
          <span class="label">类别:</span>
          <el-radio-group v-model="outputCategory">
            <el-radio label="video" border>🎬 视频</el-radio>
            <el-radio label="audio" border>🎵 音频</el-radio>
          </el-radio-group>
        </div>
        <div class="setting-item">
          <span class="label">格式:</span>
          <el-select v-model="targetFormat" style="width: 120px" size="large">
            <el-option v-if="outputCategory === 'video'" label="TS (默认)" value="ts" />
            <el-option v-if="outputCategory === 'video'" label="MP4" value="mp4" />
            <el-option v-if="outputCategory === 'video'" label="MKV" value="mkv" />
            <el-option v-if="outputCategory === 'video'" label="AVI" value="avi" />
            <el-option v-if="outputCategory === 'video'" label="MOV" value="mov" />
            <el-option v-if="outputCategory === 'video'" label="WEBM" value="webm" />
            <el-option v-if="outputCategory === 'video'" label="GIF" value="gif" />
            <el-option v-if="outputCategory === 'audio'" label="M4A (默认)" value="m4a" />
            <el-option v-if="outputCategory === 'audio'" label="MP3" value="mp3" />
            <el-option v-if="outputCategory === 'audio'" label="FLAC" value="flac" />
            <el-option v-if="outputCategory === 'audio'" label="WAV" value="wav" />
            <el-option v-if="outputCategory === 'audio'" label="AAC" value="aac" />
            <el-option v-if="outputCategory === 'audio'" label="OPUS" value="opus" />
            <el-option v-if="outputCategory === 'audio'" label="OGG" value="ogg" />
          </el-select>
        </div>
      </div>

      <div style="margin-top: 12px">
        <el-button
          type="primary"
          size="large"
          :loading="isProcessing"
          :disabled="!selectedReplay || clipList.length === 0"
          @click="startClip"
        >
          <el-icon><Scissor /></el-icon>
          {{ isProcessing ? `处理中 (${progress}%)` : '开始批量处理并下载' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Calendar, Scissor, Cpu, CircleCheck, Delete } from '@element-plus/icons-vue'
import * as p48 from '@/api/pocket48'

const emit = defineEmits(['start-clip'])
const props = defineProps({
  isProcessing: Boolean,
  progress: Number
})

// --- Member Search (client-side autocomplete) ---
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
      if (results.length >= 20) break
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

  selectedDate.value = ''
  selectedReplay.value = null
  replaysByDate.value = {}
  clipList.value = []
  jumpDateStr.value = formatToday()

  const detail = await p48.getMemberDetail(item.memberId).catch(() => null)
  if (detail) {
    selectedMember.value = { ...selectedMember.value, detail }
  }

  await loadReplays()
}

watch(memberQuery, (val) => {
  if (!val && selectedMember.value) {
    selectedMember.value = null
    selectedDate.value = ''
    selectedReplay.value = null
    replaysByDate.value = {}
    clipList.value = []
    jumpDateStr.value = formatToday()
  }
})

// --- Calendar ---
const calendarDate = ref(new Date())
const replaysByDate = ref({})
const selectedDate = ref('')
const selectedReplay = ref(null)
const loadingReplays = ref(false)
const totalReplayCount = ref(0)

function formatToday() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

const jumpDateStr = ref(formatToday())

const onJumpDate = () => {
  const val = jumpDateStr.value.trim()
  if (val.length !== 8 || !/^\d{8}$/.test(val)) {
    ElMessage.warning('请输入8位数字日期，格式: YYYYMMDD')
    return
  }
  const y = val.slice(0, 4)
  const m = val.slice(4, 6)
  const d = val.slice(6, 8)
  selectedDate.value = `${y}-${m}-${d}`
  selectedReplay.value = null
  calendarDate.value = new Date(`${y}/${m}/${d}`)
}

const loadReplays = async () => {
  if (!selectedMember.value) return
  const pocketId = selectedMember.value.pocketId
  if (!pocketId) return

  loadingReplays.value = true
  totalReplayCount.value = 0
  replaysByDate.value = {}

  try {
    let next = '0'
    while (next) {
      const data = await p48.getLiveList(Number(pocketId), next)
      if (data?.content?.liveList?.length) {
        for (const r of data.content.liveList) {
          const dateKey = getReplayDate(r.ctime)
          if (!replaysByDate.value[dateKey]) {
            replaysByDate.value[dateKey] = []
          }
          replaysByDate.value[dateKey].push(r)
          totalReplayCount.value++
        }
        next = data.content.next
      } else {
        break
      }
    }
  } catch (err) {
    ElMessage.warning('加载录播列表失败: ' + err.message)
  } finally {
    loadingReplays.value = false
  }
}

const getReplayDate = (ctimeMs) => {
  const d = new Date(Number(ctimeMs))
  d.setHours(d.getHours() - 6)
  return d.toISOString().slice(0, 10)
}

const hasReplay = (dayStr) => {
  return !!replaysByDate.value[dayStr]
}

const onDateClick = (dayStr) => {
  selectedDate.value = dayStr
  selectedReplay.value = null
}

watch(calendarDate, (newDate) => {
  if (!newDate) return
  const y = newDate.getFullYear()
  const m = String(newDate.getMonth() + 1).padStart(2, '0')
  const d = String(newDate.getDate()).padStart(2, '0')
  const dateStr = `${y}-${m}-${d}`
  if (dateStr !== selectedDate.value) {
    selectedDate.value = dateStr
    selectedReplay.value = null
  }
})

const replaysForSelectedDate = computed(() => {
  if (!selectedDate.value) return []
  return replaysByDate.value[selectedDate.value] || []
})

const onReplaySelect = async (r) => {
  selectedReplay.value = r
  try {
    const detail = await p48.getLiveOne(r.liveId)
    if (detail?.content?.playStreamPath) {
      selectedReplay.value = { ...r, m3u8Url: detail.content.playStreamPath }
    }
  } catch {}
}

const formatReplayTime = (ctimeMs) => {
  if (!ctimeMs) return ''
  const d = new Date(Number(ctimeMs))
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// --- Clip List ---
const clipList = ref([])
const txtInputRef = ref(null)

const triggerTxtUpload = () => txtInputRef.value?.click()

const handleTxtSelect = (event) => {
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

const addEmptyRow = () => clipList.value.push({ name: '', start: '', end: '' })
const clearList = () => clipList.value = []

// --- Settings ---
const outputCategory = ref('video')
const targetFormat = ref('ts')

watch(outputCategory, (cat) => {
  targetFormat.value = cat === 'video' ? 'ts' : 'm4a'
})

// --- Start ---
const startClip = () => {
  if (!selectedReplay.value?.m3u8Url || clipList.value.length === 0) return
  emit('start-clip', {
    m3u8Url: selectedReplay.value.m3u8Url,
    member: selectedMember.value.name,
    broadcastTime: formatReplayTime(selectedReplay.value.ctime).replace(/[-: ]/g, (c) => c === ' ' ? '~' : c === ':' ? '.' : '-'),
    clips: clipList.value.map(c => ({ ...c })),
    format: targetFormat.value,
  })
}
</script>

<style scoped>
.p48-panel {
  padding: 10px 0;
}
.section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.step-label {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #303133;
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
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f5f7fa;
  max-width: 380px;
}
.badge-name {
  font-weight: 600;
  font-size: 14px;
}
.badge-meta {
  font-size: 12px;
  color: #909399;
}
.date-jump {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.no-replays {
  margin-top: 12px;
}
.loading-replays {
  max-width: 700px;
}
.calendar-wrapper {
  display: flex;
  justify-content: center;
}
.calendar-cell {
  position: relative;
  padding: 4px;
  cursor: pointer;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.replay-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #409eff;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
}
:deep(td.is-selected) .calendar-cell {
  background: #ecf5ff;
  border-radius: 4px;
}
:deep(td.is-selected) .replay-badge {
  box-shadow: 0 0 0 2px #409eff;
}
.loading-replay-list {
  max-width: 700px;
  margin-top: 12px;
}
.replay-list {
  margin-top: 12px;
}
.replay-list-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
}
.replay-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.replay-item:hover {
  border-color: #409eff;
  background: #f0f7ff;
}
.replay-item.active {
  border-color: #67c23a;
  background: #f0f9eb;
}
.replay-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.replay-time {
  font-weight: bold;
  font-family: monospace;
}
.replay-title {
  color: #606266;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.replay-duration {
  color: #909399;
  font-size: 12px;
}
.source-info {
  margin-bottom: 12px;
}
.settings-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.label {
  font-weight: bold;
  font-size: 14px;
  color: #606266;
}
</style>
