import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DatasetError, casesOf, enabledSets, loadDataset, parseDataset } from '../src/testdata/provider.ts'
import type { SegmentCase } from '../src/testdata/types.ts'

test('the three real datasets load and every id is unique across files', () => {
  const ids: string[] = []
  for (const name of ['import-files', 'export-scenarios', 'segment-length']) {
    const dataset = loadDataset(name)
    for (const list of Object.values(dataset.sets)) for (const item of list) ids.push(item.id)
  }
  assert.equal(new Set(ids).size, ids.length)
})

test('segment-length has valid, boundary and invalid sets', () => {
  const dataset = loadDataset<SegmentCase>('segment-length')
  for (const set of ['valid', 'boundary', 'invalid'] as const) {
    assert.ok((dataset.sets[set] ?? []).length >= 3, `${set} has at least 3 cases`)
  }
})

test('boundary cases surround the limits 2 and 600', () => {
  const values = (loadDataset<SegmentCase>('segment-length').sets.boundary ?? []).map((c) => c.value)
  assert.deepEqual(values, ['1.99', '2', '600', '600.01'])
})

test('TAF_SETS limits the sets', () => {
  const dataset = loadDataset<SegmentCase>('segment-length')
  assert.deepEqual(enabledSets({ TAF_SETS: 'valid, invalid' }), ['valid', 'invalid'])
  assert.equal(casesOf(dataset, 'boundary', { TAF_SETS: 'valid' }).length, 0)
  assert.ok(casesOf(dataset, 'valid', { TAF_SETS: 'valid' }).length > 0)
})

test('a broken dataset is rejected with a clear message', () => {
  assert.throws(() => parseDataset('x', '{'), DatasetError)
  assert.throws(() => parseDataset('x', '{"sets":{"weird":[]}}'), /unknown set "weird"/)
  assert.throws(() => parseDataset('x', '{"sets":{"valid":[{"id":"A","title":"t"},{"id":"A","title":"u"}]}}'), /duplicate case id "A"/)
  assert.throws(() => parseDataset('x', '{"sets":{"valid":[{"id":"A"}]}}'), /no "title"/)
})
