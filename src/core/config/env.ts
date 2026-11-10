// Layer 3 (Core). Resolves the target environment (dev / staging / prod) from
// environment variables and src/testdata/config/environments.json.
import fs from 'node:fs'
import path from 'node:path'

export type EnvName = 'dev' | 'staging' | 'prod'
export const ENV_NAMES: readonly EnvName[] = ['dev', 'staging', 'prod']

export interface ServerSpec {
  command: string
  port: number
  timeoutMs: number
}

export interface TafEnv {
  name: EnvName
  baseURL: string
  // How to start the application under test; null when it is already running.
  server: ServerSpec | null
  // Folder with the application sources the server command is run in.
  appDir: string
}

interface RawEnv {
  baseURL: string | null
  baseURLFrom?: string
  server: ServerSpec | null
}

export function resolveEnv(vars: NodeJS.ProcessEnv = process.env, root: string = process.cwd()): TafEnv {
  const name = (vars.TAF_ENV ?? 'dev') as EnvName
  if (!ENV_NAMES.includes(name)) {
    throw new Error(`TAF_ENV="${vars.TAF_ENV}" is unknown. Use one of: ${ENV_NAMES.join(', ')}.`)
  }
  const file = path.join(root, 'src', 'testdata', 'config', 'environments.json')
  const all = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<EnvName, RawEnv>
  const raw = all[name]
  const appDir = path.resolve(vars.APP_DIR ?? path.join(root, '..', 'app'))

  // An explicit URL means "the application is already running there".
  if (vars.APP_BASE_URL) return { name, baseURL: vars.APP_BASE_URL, server: null, appDir }

  const baseURL = raw.baseURL ?? (raw.baseURLFrom ? vars[raw.baseURLFrom] : undefined)
  if (!baseURL) {
    throw new Error(`Environment "${name}" needs the variable ${raw.baseURLFrom ?? 'APP_BASE_URL'} with the application URL.`)
  }
  if (raw.server && !fs.existsSync(path.join(appDir, 'package.json'))) {
    throw new Error(
      `Application sources not found in "${appDir}". Set APP_DIR to the folder with the application package.json, or set APP_BASE_URL to a running instance.`,
    )
  }
  return { name, baseURL, server: raw.server, appDir }
}
