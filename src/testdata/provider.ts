// Layer 4 (Test Data). Data provider: loads a JSON dataset, validates its shape,
// and hands the cases of a set to the test script that generates one test per case.
import fs from 'node:fs'
import path from 'node:path'
import type { DataCase, Dataset, SetName } from './types.ts'

export const SET_NAMES: readonly SetName[] = ['valid', 'boundary', 'invalid']

export class DatasetError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatasetError'
  }
}

export function parseDataset<T extends DataCase>(name: string, text: string): Dataset<T> {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (error) {
    throw new DatasetError(`${name}: not valid JSON (${error instanceof Error ? error.message : String(error)})`)
  }
  if (typeof raw !== 'object' || raw === null || !('sets' in raw) || typeof raw.sets !== 'object' || raw.sets === null) {
    throw new DatasetError(`${name}: the root object needs a "sets" object`)
  }
  const seen = new Set<string>()
  for (const [setName, list] of Object.entries(raw.sets)) {
    if (!SET_NAMES.includes(setName as SetName)) {
      throw new DatasetError(`${name}: unknown set "${setName}" (use ${SET_NAMES.join(', ')})`)
    }
    if (!Array.isArray(list)) throw new DatasetError(`${name}.${setName}: must be an array`)
    for (const item of list) {
      if (typeof item?.id !== 'string' || item.id === '') throw new DatasetError(`${name}.${setName}: a case has no "id"`)
      if (typeof item.title !== 'string' || item.title === '') throw new DatasetError(`${name}.${item.id}: no "title"`)
      if (item.tags !== undefined && !(Array.isArray(item.tags) && item.tags.every((t: unknown) => typeof t === 'string'))) {
        throw new DatasetError(`${name}.${item.id}: "tags" must be an array of strings`)
      }
      if (seen.has(item.id)) throw new DatasetError(`${name}: duplicate case id "${item.id}"`)
      seen.add(item.id)
    }
  }
  return raw as Dataset<T>
}

export function loadDataset<T extends DataCase>(name: string, root: string = process.cwd()): Dataset<T> {
  const file = path.join(root, 'src', 'testdata', 'datasets', `${name}.json`)
  return parseDataset<T>(name, fs.readFileSync(file, 'utf8'))
}

// TAF_SETS=valid,boundary limits a run to some sets; nothing set means all of them.
export function enabledSets(vars: NodeJS.ProcessEnv = process.env): SetName[] {
  const wanted = (vars.TAF_SETS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (wanted.length === 0) return [...SET_NAMES]
  return SET_NAMES.filter((s) => wanted.includes(s))
}

export function casesOf<T extends DataCase>(
  dataset: Dataset<T>,
  set: SetName,
  vars: NodeJS.ProcessEnv = process.env,
): T[] {
  if (!enabledSets(vars).includes(set)) return []
  return dataset.sets[set] ?? []
}
