import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { resolveEnv } from '../src/core/config/env.ts'

function fakeApp(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'app-'))
  fs.writeFileSync(path.join(dir, 'package.json'), '{}')
  return dir
}

test('dev is the default and starts the dev server', () => {
  const env = resolveEnv({ APP_DIR: fakeApp() })
  assert.equal(env.name, 'dev')
  assert.equal(env.baseURL, 'http://localhost:5173')
  assert.match(env.server?.command ?? '', /npm run dev/)
})

test('staging serves the production build', () => {
  const env = resolveEnv({ TAF_ENV: 'staging', APP_DIR: fakeApp() })
  assert.equal(env.baseURL, 'http://localhost:4173')
  assert.match(env.server?.command ?? '', /npm run build && npm run preview/)
})

test('prod needs its URL and starts nothing', () => {
  assert.throws(() => resolveEnv({ TAF_ENV: 'prod' }), /APP_PROD_URL/)
  const env = resolveEnv({ TAF_ENV: 'prod', APP_PROD_URL: 'https://example.org/' })
  assert.equal(env.baseURL, 'https://example.org/')
  assert.equal(env.server, null)
})

test('an explicit URL means the application is already running', () => {
  const env = resolveEnv({ TAF_ENV: 'staging', APP_BASE_URL: 'http://localhost:9999' })
  assert.equal(env.baseURL, 'http://localhost:9999')
  assert.equal(env.server, null)
})

test('an unknown environment and a missing application folder are explained', () => {
  assert.throws(() => resolveEnv({ TAF_ENV: 'qa' }), /unknown/)
  assert.throws(() => resolveEnv({ APP_DIR: path.join(os.tmpdir(), 'no-such-app') }), /Application sources not found/)
})
