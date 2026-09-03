export const BEIJING_TIME_ZONE = 'Asia/Shanghai'

const beijingDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BEIJING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

export function formatBeijingDate(value = Date.now()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  if (!Number.isFinite(date.getTime())) return ''

  const parts = {}
  for (const part of beijingDateFormatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value
  }
  return `${parts.year}-${parts.month}-${parts.day}`
}
