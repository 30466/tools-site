import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatBeijingDate,
  formatBeijingDateTime,
  getArchiveDate,
  getBeijingParts,
} from '../src/utils/time.js'
import { formatBeijingDate as formatServerBeijingDate } from '../server/time.js'

test('口袋48毫秒时间戳固定显示为北京时间', () => {
  const replayTime = Date.parse('2026-08-28T05:56:00Z')
  assert.equal(formatBeijingDateTime(replayTime), '2026-08-28 13:56:00')
  assert.equal(formatBeijingDate(replayTime), '2026-08-28')
  assert.equal(formatServerBeijingDate(replayTime), '2026-08-28')
  assert.deepEqual(getBeijingParts(replayTime), {
    year: 2026,
    month: 8,
    day: 28,
    hour: 13,
    minute: 56,
    second: 0
  })
})

test('北京时间自然日边界不依赖运行环境时区', () => {
  assert.equal(getArchiveDate(Date.parse('2026-08-28T15:59:59Z')), '2026-08-28')
  assert.equal(getArchiveDate(Date.parse('2026-08-28T16:00:00Z')), '2026-08-29')
  assert.equal(getArchiveDate(Date.parse('2026-08-28T05:56:00Z')), '2026-08-28')
})

test('跨月跨年自然日和无效值', () => {
  assert.equal(getArchiveDate(Date.parse('2025-12-31T16:00:00Z')), '2026-01-01')
  assert.equal(getArchiveDate(Date.parse('2026-02-28T16:00:00Z')), '2026-03-01')
  assert.equal(getArchiveDate(''), null)
  assert.equal(getArchiveDate('not-a-time'), null)
  assert.equal(getArchiveDate('2026-08-28 13:56:00'), null)
})
