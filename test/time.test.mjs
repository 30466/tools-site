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

test('06:00 归档边界不依赖运行环境时区', () => {
  assert.equal(getArchiveDate(Date.parse('2026-08-27T21:59:59Z')), '2026-08-27')
  assert.equal(getArchiveDate(Date.parse('2026-08-27T22:00:00Z')), '2026-08-28')
  assert.equal(getArchiveDate(Date.parse('2026-08-28T05:56:00Z')), '2026-08-28')
})

test('跨月跨年归档和无效值', () => {
  assert.equal(getArchiveDate(Date.parse('2025-12-31T17:00:00Z')), '2025-12-31')
  assert.equal(getArchiveDate(Date.parse('2026-02-28T17:00:00Z')), '2026-02-28')
  assert.equal(getArchiveDate(''), null)
  assert.equal(getArchiveDate('not-a-time'), null)
  assert.equal(getArchiveDate('2026-08-28 13:56:00'), null)
})
