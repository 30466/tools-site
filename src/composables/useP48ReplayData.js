import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as p48 from '@/api/pocket48'

const loading = ref(false)
const loadingFull = ref(false)
const loaded = ref(false)
const loadedAll = ref(false)
const totalCount = ref(0)
const replaysByDate = ref({})

let nextPage = '0'
let pocketIdCache = null
const seenIds = new Set()
let currentMemberName = ''
let currentRoomMap = null

function getReplayDate(ctimeMs) {
  const d = new Date(Number(ctimeMs))
  d.setHours(d.getHours() - 6)
  return d.toISOString().slice(0, 10)
}

function addReplays(liveList) {
  let added = 0
  for (const r of liveList) {
    if (seenIds.has(r.liveId)) continue
    seenIds.add(r.liveId)
    const dateKey = getReplayDate(r.ctime)
    if (!replaysByDate.value[dateKey]) {
      replaysByDate.value[dateKey] = []
    }
    replaysByDate.value[dateKey].push(r)
    added++
  }
  totalCount.value += added
  return added
}

function setMember(name, roomMap) {
  if (name === currentMemberName) return
  currentMemberName = name
  currentRoomMap = roomMap
  loaded.value = false
  loadedAll.value = false
  totalCount.value = 0
  replaysByDate.value = {}
  nextPage = '0'
  pocketIdCache = null
  seenIds.clear()
}

async function quickLoad() {
  if (loaded.value) return
  loading.value = true
  totalCount.value = 0
  replaysByDate.value = {}

  try {
    const pocketId = currentRoomMap?.[currentMemberName]
    if (!pocketId) {
      ElMessage.error(`未找到${currentMemberName}的口袋房间号`)
      loading.value = false
      return
    }
    pocketIdCache = pocketId

    const data = await p48.getLiveList(Number(pocketId), '0')
    if (data?.content?.liveList?.length) {
      addReplays(data.content.liveList)
      nextPage = data.content.next
    }

    loaded.value = true
  } catch (err) {
    ElMessage.error('加载录播列表失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

async function loadAll() {
  if (!pocketIdCache) return
  loadingFull.value = true

  try {
    if (loadedAll.value) {
      let next = '0'
      let newCount = 0
      while (next) {
        const data = await p48.getLiveList(Number(pocketIdCache), next)
        if (data?.content?.liveList?.length) {
          const added = addReplays(data.content.liveList)
          newCount += added
          next = data.content.next
        } else {
          break
        }
      }
      if (newCount > 0) {
        ElMessage.success(`新增 ${newCount} 条，共 ${totalCount.value} 条录播记录`)
      } else {
        ElMessage.info(`没有新的录播记录，共 ${totalCount.value} 条`)
      }
    } else {
      let next = nextPage
      while (next) {
        const data = await p48.getLiveList(Number(pocketIdCache), next)
        if (data?.content?.liveList?.length) {
          addReplays(data.content.liveList)
          next = data.content.next
        } else {
          break
        }
      }
      loadedAll.value = true
      ElMessage.success(`加载完成，共 ${totalCount.value} 条录播记录`)
    }
  } catch (err) {
    ElMessage.error('加载录播列表失败: ' + err.message)
  } finally {
    loadingFull.value = false
  }
}

export function useP48ReplayData() {
  return {
    loading,
    loadingFull,
    loaded,
    loadedAll,
    totalCount,
    replaysByDate,
    setMember,
    quickLoad,
    loadAll,
  }
}
