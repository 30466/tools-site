export const BEIJING_TIME_ZONE = 'Asia/Shanghai'
export const ARCHIVE_DAY_START_HOUR = 6

const beijingPartsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BEIJING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
})

function toValidDate(value) {
  if (value === null || value === undefined || value === '') return null
  let normalized = value
  if (typeof value === 'string') {
    if (/^\d+$/.test(value)) normalized = Number(value)
    else if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value.trim())) return null
  }
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(normalized)
  return Number.isFinite(date.getTime()) ? date : null
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function civilDate(parts) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

function previousCivilDate(parts) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - 1))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function getBeijingParts(value = Date.now()) {
  const date = toValidDate(value)
  if (!date) return null

  const values = {}
  for (const part of beijingPartsFormatter.formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value)
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second
  }
}

export function formatBeijingDate(value = Date.now()) {
  const parts = getBeijingParts(value)
  return parts ? civilDate(parts) : ''
}

export function formatBeijingTime(value, { seconds = false } = {}) {
  const parts = getBeijingParts(value)
  if (!parts) return ''
  const result = `${pad(parts.hour)}:${pad(parts.minute)}`
  return seconds ? `${result}:${pad(parts.second)}` : result
}

export function formatBeijingDateTime(value, { seconds = true } = {}) {
  const parts = getBeijingParts(value)
  if (!parts) return ''
  const time = `${pad(parts.hour)}:${pad(parts.minute)}${seconds ? `:${pad(parts.second)}` : ''}`
  return `${civilDate(parts)} ${time}`
}

export function getArchiveDate(value) {
  const parts = getBeijingParts(value)
  if (!parts) return null
  return parts.hour < ARCHIVE_DAY_START_HOUR ? previousCivilDate(parts) : civilDate(parts)
}
