const MAPPING_API = '/api/public/snh48/mapping'
const MEMBER_API = '/api/public/snh48/members'
const ROOM_MAP_API = '/api/public/snh48/room-map'
const POCKET48_API = '/pocketapi'

function deviceId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 18)
}

function pocketHeaders() {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    'User-Agent': 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)',
    'Accept-Language': 'zh-Hans-CN;q=1',
    'appInfo': JSON.stringify({
      vendor: 'apple',
      deviceId: deviceId(),
      appVersion: '7.0.4',
      appBuild: '23011601',
      osVersion: '16.3.1',
      osType: 'ios',
      deviceName: 'iPhone XR',
      os: 'ios'
    })
  }
}

export async function getMapping() {
  const res = await fetch(MAPPING_API)
  if (!res.ok) throw new Error(`获取成员映射失败 (HTTP ${res.status})`)
  return res.json()
}

export async function getMemberDetail(id) {
  const res = await fetch(`${MEMBER_API}/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function getRoomMap() {
  const res = await fetch(ROOM_MAP_API)
  if (!res.ok) throw new Error(`获取房间映射失败 (HTTP ${res.status})`)
  return res.json()
}

export async function getLiveList(userId, next = '0') {
  const res = await fetch(`${POCKET48_API}/getLiveList`, {
    method: 'POST',
    headers: pocketHeaders(),
    body: JSON.stringify({ userId, next, debug: true, record: true })
  })
  return res.json()
}

export async function getLiveOne(liveId) {
  const res = await fetch(`${POCKET48_API}/getLiveOne`, {
    method: 'POST',
    headers: pocketHeaders(),
    body: JSON.stringify({ liveId: String(liveId) })
  })
  return res.json()
}

export async function fetchM3U8(url) {
  const res = await fetch(url)
  return res.text()
}

export function parseM3U8(text, baseUrl) {
  const lines = text.trim().split('\n')
  const segments = []
  let duration = 0
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const dur = parseFloat(line.replace('#EXTINF:', '').split(',')[0])
      duration += dur
    } else if (!line.startsWith('#') && line.length > 0) {
      let url
      if (line.startsWith('http')) {
        url = line
      } else if (line.startsWith('/')) {
        // Absolute path from origin root
        const idx = baseUrl.indexOf('/', baseUrl.indexOf('//') + 2)
        url = baseUrl.substring(0, idx) + line
      } else {
        // Relative path: append to baseUrl directory
        url = baseUrl + line
      }
      segments.push({ url, duration })
      duration = 0
    }
  }
  return segments
}

export function buildBaseUrl(m3u8Url) {
  const lastSlash = m3u8Url.lastIndexOf('/')
  return m3u8Url.substring(0, lastSlash + 1)
}

export function timeToSeconds(t) {
  const parts = t.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

export function proxyCDN(url) {
  // 通过 /cdn 代理抓取 M3U8（Vite dev server 代理，够用）
  const idx = url.indexOf('/', url.indexOf('//') + 2)
  return '/cdn' + url.substring(idx)
}

export function proxySegment(url) {
  // 通过后端代理抓取 TS 分片（Node 端不校验 Content-Length，截断也能返回）
  return `/proxy/segment?url=${encodeURIComponent(url)}`
}

export function proxyAvatar(url) {
  return url
}
