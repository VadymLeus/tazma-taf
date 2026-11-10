import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Logger, formatLine, parseLevel } from '../src/core/logging/logger.ts'

test('a line has time, level and scope', () => {
  const line = formatLine(new Date('2026-01-02T03:04:05.678Z'), 'warn', 'TC-1', 'text')
  assert.equal(line, '[03:04:05.678] WARN  TC-1: text')
})

test('the logger keeps lines at or above its level, and only echoes warnings by default', () => {
  const written: string[] = []
  const original = process.stdout.write.bind(process.stdout)
  process.stdout.write = ((chunk: string) => {
    written.push(String(chunk))
    return true
  }) as typeof process.stdout.write
  try {
    const log = new Logger('t', 'info', 'warn')
    log.debug('hidden')
    log.info('kept')
    log.error('echoed')
    assert.equal(log.text().trim().split('\n').length, 2)
    assert.equal(written.length, 1)
  } finally {
    process.stdout.write = original
  }
})

test('an unknown level falls back', () => {
  assert.equal(parseLevel('loud'), 'info')
  assert.equal(parseLevel('debug'), 'debug')
  assert.equal(parseLevel(undefined, 'warn'), 'warn')
})
