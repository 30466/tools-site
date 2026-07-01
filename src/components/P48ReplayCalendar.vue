<template>
  <div class="replay-calendar">
    <div class="calendar-header">
      <h2>{{ memberName }} · 口袋48录播回放</h2>
      <div class="header-actions">
        <el-button size="large" :loading="loadingFull" @click="loadAllReplays" style="height: 40px">
          {{ loadingFull ? '加载中...' : '加载所有录播记录' }}
        </el-button>
        <el-tag v-if="totalCount > 0" type="info" effect="plain" size="large" style="height: 40px; line-height: 38px; font-size: 15px">
          {{ loadedAll ? '共 ' + totalCount + ' 条录播' : '已加载 ' + totalCount + ' 条' }}
        </el-tag>
      </div>
    </div>

    <el-alert type="info" :closable="false" show-icon style="margin-bottom: 12px">
      <template #title>
        日期归档规则：以次日 06:00 为界，凌晨 06:00 前的录播归档为前一天
      </template>
    </el-alert>

    <div class="calendar-wrapper">
      <el-calendar v-model="calendarDate" ref="calendarRef">
        <template #header>
          <div class="calendar-custom-header">
            <el-select v-model="selectedYear" placeholder="年份" style="width: 120px" @change="onYearMonthChange">
              <el-option v-for="year in yearList" :key="year" :label="year + '年'" :value="year" />
            </el-select>
            <el-select v-model="selectedMonth" placeholder="月份" style="width: 100px; margin-left: 10px" @change="onYearMonthChange">
              <el-option v-for="month in monthList" :key="month" :label="month + '月'" :value="month" />
            </el-select>
            <div class="month-nav">
              <el-button size="small" @click="prevMonth">◀ 上个月</el-button>
              <el-button size="small" @click="goOldest">最早</el-button>
              <el-button size="small" @click="goLatest">最新</el-button>
              <el-button size="small" @click="nextMonth">下个月 ▶</el-button>
            </div>
          </div>
        </template>

        <template #date-cell="{ data }">
          <div class="calendar-cell" :class="{ 'other-month': !isCurrentMonth(data.day) }" @click="onDateClick(data.day)">
            <span v-if="hasReplay(data.day)" class="replay-badge">{{ data.day.split('-').pop() }}</span>
            <span v-else>{{ data.day.split('-').pop() }}</span>
          </div>
        </template>
      </el-calendar>
    </div>

    <div v-if="!loading && totalCount === 0 && loaded" class="empty-state">
      <el-empty description="该成员暂无录播记录"><div class="empty-text">暂无录播记录</div></el-empty>
    </div>

    <div v-if="totalCount > 0 && !loading && loaded && !selectedDate" class="date-hint">
      点击日历中蓝色高亮的日期查看录播
    </div>

    <div v-if="replaysForSelectedDate.length > 0" class="replay-list-section">
      <div class="replay-list-title">
        {{ selectedDate }} 的录播 ({{ replaysForSelectedDate.length }})
      </div>
      <div
        v-for="r in replaysForSelectedDate"
        :key="r.liveId"
        class="replay-item"
        :class="{ active: selectedReplay?.liveId === r.liveId }"
        @click="onReplaySelect(r)"
      >
        <div class="replay-info">
          <span class="replay-time">{{ formatTime(r.ctime) }}</span>
          <el-tag
            :type="r.liveType === 1 ? 'primary' : r.liveType === 2 ? 'warning' : 'info'"
            size="small"
            effect="plain"
          >
            {{ r.liveType === 1 ? '直播' : r.liveType === 2 ? '电台' : r.liveType === 5 ? '游戏' : 'AI' }}
          </el-tag>
          <span class="replay-title">{{ r.title || '(无标题)' }}</span>
          <span class="replay-duration" v-if="r.duration">{{ r.duration }}</span>
        </div>
        <el-icon v-if="selectedReplay?.liveId === r.liveId" color="#67c23a"><CircleCheck /></el-icon>
      </div>
    </div>

    <div v-if="!loading && totalCount > 0 && selectedDate && replaysForSelectedDate.length === 0 && loaded" class="empty-state">
      <el-empty description="该日期无录播" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import { useP48ReplayData } from '@/composables/useP48ReplayData'

const props = defineProps({
  memberName: { type: String, default: '谭思慧' },
  roomMapCache: { type: Object, default: null }
})

const emit = defineEmits(['select-replay'])

const {
  loading, loadingFull, loaded, loadedAll, totalCount, replaysByDate,
  setMember, quickLoad, loadAll
} = useP48ReplayData()

const calendarDate = ref(new Date())
const selectedDate = ref('')
const selectedReplay = ref(null)

const currentYearNum = new Date().getFullYear()
const selectedYear = ref(currentYearNum)
const selectedMonth = ref(new Date().getMonth() + 1)

const replaysForSelectedDate = computed(() => {
  if (!selectedDate.value) return []
  return replaysByDate.value[selectedDate.value] || []
})

const earliestYear = computed(() => {
  const dates = Object.keys(replaysByDate.value).filter(Boolean)
  if (dates.length === 0) return currentYearNum
  return parseInt(dates.sort()[0].split('-')[0])
})
const earliestMonth = computed(() => {
  const dates = Object.keys(replaysByDate.value).filter(d => d.startsWith(String(earliestYear.value)))
  if (dates.length === 0) return 1
  return parseInt(dates.sort()[0].split('-')[1])
})

const latestYear = computed(() => {
  const dates = Object.keys(replaysByDate.value).filter(Boolean)
  if (dates.length === 0) return currentYearNum
  return Math.max(...dates.map(d => parseInt(d.split('-')[0])))
})
const latestMonth = computed(() => {
  const dates = Object.keys(replaysByDate.value)
    .filter(d => d.startsWith(String(latestYear.value)))
  if (dates.length === 0) return new Date().getMonth() + 1
  return Math.max(...dates.map(d => parseInt(d.split('-')[1])))
})

const yearList = computed(() => {
  const years = []
  for (let y = earliestYear.value; y <= currentYearNum; y++) years.push(y)
  return years
})
const monthList = computed(() => {
  let start = 1, end = 12
  if (selectedYear.value === earliestYear.value) start = earliestMonth.value
  if (selectedYear.value === latestYear.value) end = latestMonth.value
  const months = []
  for (let m = start; m <= end; m++) months.push(m)
  return months
})

function isCurrentMonth(dayStr) {
  const parts = dayStr.split('-')
  return parseInt(parts[1]) === selectedMonth.value && parseInt(parts[0]) === selectedYear.value
}

function hasReplay(dayStr) {
  return !!replaysByDate.value[dayStr]
}

function onDateClick(dayStr) {
  selectedDate.value = dayStr
  selectedReplay.value = null
}

function formatTime(ctimeMs) {
  if (!ctimeMs) return ''
  const d = new Date(Number(ctimeMs))
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function onReplaySelect(r) {
  selectedReplay.value = r
  emit('select-replay', r)
}

function prevMonth() {
  if (selectedYear.value === earliestYear.value && selectedMonth.value <= earliestMonth.value) {
    ElMessage.warning('已是最久远的录播记录月')
    return
  }
  if (selectedMonth.value === 1) { selectedMonth.value = 12; selectedYear.value-- }
  else { selectedMonth.value-- }
  onYearMonthChange()
}

function nextMonth() {
  if (selectedYear.value === latestYear.value && selectedMonth.value >= latestMonth.value) {
    ElMessage.warning('暂无更新的录播')
    return
  }
  if (selectedMonth.value === 12) { selectedMonth.value = 1; selectedYear.value++ }
  else { selectedMonth.value++ }
  onYearMonthChange()
}

async function goLatest() {
  await loadAll()
  if (selectedYear.value === latestYear.value && selectedMonth.value === latestMonth.value) {
    ElMessage.warning('已是最新的录播记录月')
    return
  }
  selectedYear.value = latestYear.value
  selectedMonth.value = latestMonth.value
  onYearMonthChange()
}

async function goOldest() {
  await loadAll()
  if (selectedYear.value === earliestYear.value && selectedMonth.value === earliestMonth.value) {
    ElMessage.warning('已是最久远的录播记录月')
    return
  }
  selectedYear.value = earliestYear.value
  selectedMonth.value = earliestMonth.value
  onYearMonthChange()
}

function onYearMonthChange() {
  if (monthList.value.length > 0 && !monthList.value.includes(selectedMonth.value)) {
    selectedMonth.value = monthList.value[0]
  }
  calendarDate.value = new Date(selectedYear.value, selectedMonth.value - 1, 1)
}

watch(calendarDate, (d) => {
  selectedYear.value = d.getFullYear()
  selectedMonth.value = d.getMonth() + 1
})

function loadAllReplays() {
  loadAll()
}

onMounted(async () => {
  if (props.memberName && props.roomMapCache) {
    setMember(props.memberName, props.roomMapCache)
    await quickLoad()
    resetToLatest()
  }
})

watch(() => props.memberName, async (name) => {
  if (name && props.roomMapCache) {
    selectedDate.value = ''
    selectedReplay.value = null
    setMember(name, props.roomMapCache)
    await quickLoad()
    resetToLatest()
  }
})

function resetToLatest() {
  selectedYear.value = latestYear.value
  selectedMonth.value = latestMonth.value
  onYearMonthChange()
}

defineExpose({ resetToLatest })
</script>

<style scoped>
.replay-calendar {
  max-width: 700px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.calendar-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}
.calendar-header h2 {
  margin: 0;
  font-size: 20px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.calendar-custom-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}
.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
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
  font-size: 14px;
  color: #000;
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
.calendar-cell:hover {
  background: #ecf5ff;
  border-radius: 6px;
}
.replay-badge:hover {
  background: #337ecc;
}
.calendar-cell.other-month {
  color: #999;
}
.calendar-cell.other-month .replay-badge {
  color: #999;
}
.date-hint {
  text-align: center;
  color: #fff;
  margin-top: 12px;
  font-size: 14px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
}
.empty-state {
  margin-top: 16px;
  color: #fff;
}
.replay-list-section {
  margin-top: 20px;
}
.replay-list-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 15px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.replay-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.9);
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
  font-size: 14px;
  color: #303133;
}
.replay-title {
  color: #303133;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.replay-duration {
  color: #606266;
  font-size: 12px;
}

@media (max-width: 768px) {
  .replay-calendar {
    max-width: 100%;
    padding: 0 4px 40px;
  }

  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .calendar-header h2 {
    font-size: 16px;
  }

  .header-actions {
    margin-left: 0;
    width: 100%;
  }

  .header-actions .el-button {
    font-size: 13px;
  }

  .calendar-custom-header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .calendar-custom-header .el-select {
    flex: 1 1 45%;
    min-width: 90px;
    margin-left: 0 !important;
  }

  .month-nav {
    flex-basis: 100%;
    margin-left: 0;
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .month-nav .el-button {
    flex: 1;
    font-size: 12px;
    padding: 5px 6px;
    white-space: nowrap;
  }

  .calendar-cell {
    font-size: 12px;
    padding: 2px;
  }

  .replay-badge {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    font-size: 11px;
  }

  .replay-list-section {
    margin-top: 12px;
  }

  .replay-list-title {
    font-size: 13px;
  }

  .replay-item {
    padding: 8px 10px;
  }

  .replay-info {
    gap: 6px;
  }

  .replay-time {
    font-size: 12px;
  }

  .replay-title {
    max-width: 120px;
    font-size: 13px;
  }
}
</style>
