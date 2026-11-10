// Layer 3 (Core / Adaptation). Runner configuration: environment, reporters,
// artefacts of a failure, parallelism, retries and the web server of the application.
import { defineConfig, devices } from '@playwright/test'
import type { ReporterDescription } from '@playwright/test'
import { resolveEnv } from './src/core/config/env.ts'
import { timeouts } from './src/core/waits/waits.ts'

const env = resolveEnv()
const t = timeouts()
const ci = !!process.env.CI

const REPORTERS: Record<string, ReporterDescription> = {
  list: ['list'],
  html: ['html', { outputFolder: 'reports/html', open: 'never' }],
  junit: ['junit', { outputFile: 'reports/junit.xml' }],
  json: ['json', { outputFile: 'reports/results.json' }],
  blob: ['blob'],
}
const reporter = (process.env.TAF_REPORTERS ?? 'list,html,junit,json')
  .split(',')
  .map((name) => REPORTERS[name.trim()])
  .filter((item): item is ReporterDescription => item !== undefined)

export default defineConfig({
  testDir: './tests',
  outputDir: 'reports/artifacts',
  timeout: t.test,
  expect: { timeout: t.ui },
  fullyParallel: true,
  forbidOnly: ci,
  // A retry is a safety net, not a cure: a test that passes only on the retry is reported as "flaky".
  retries: Number(process.env.TAF_RETRIES ?? (ci ? 1 : 0)),
  workers: process.env.TAF_WORKERS ? Number(process.env.TAF_WORKERS) : ci ? 2 : undefined,
  reporter,
  use: {
    baseURL: env.baseURL,
    acceptDownloads: true,
    locale: 'uk-UA',
    actionTimeout: t.action,
    navigationTimeout: t.navigation,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        // TAF_CHANNEL=chrome runs the installed Chrome, which can also encode H.264.
        channel: process.env.TAF_CHANNEL || undefined,
      },
    },
  ],
  webServer: env.server
    ? {
        command: env.server.command,
        cwd: env.appDir,
        url: env.baseURL,
        reuseExistingServer: !ci,
        timeout: env.server.timeoutMs,
        stdout: 'ignore',
        stderr: 'pipe',
      }
    : undefined,
})
