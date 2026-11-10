// Layer 3 (Core). Playwright fixtures that need nothing from the application:
// a per-test logger and the browser diagnostics, attached to the report.
import { test as base } from '@playwright/test'
import { PageDiagnostics } from '../diagnostics/collectors.ts'
import { Logger } from '../logging/logger.ts'

export interface CoreFixtures {
  log: Logger
  diagnostics: PageDiagnostics
}

export const test = base.extend<CoreFixtures>({
  log: async ({}, use, testInfo) => {
    const log = new Logger(testInfo.titlePath.slice(1).join(' > '))
    log.info(`START ${testInfo.title}`)
    await use(log)
    log.info(`END ${testInfo.status ?? 'unknown'} in ${testInfo.duration} ms`)
    await testInfo.attach('test.log', { body: log.text(), contentType: 'text/plain' })
  },

  // auto: it runs for every test, so the logs exist even when the test never asks for them.
  diagnostics: [
    async ({ page, log }, use, testInfo) => {
      const diagnostics = new PageDiagnostics(page, log)
      diagnostics.attach()
      await use(diagnostics)
      await testInfo.attach('http.log', { body: diagnostics.httpLog(), contentType: 'text/plain' })
      await testInfo.attach('console.log', { body: diagnostics.consoleLog(), contentType: 'text/plain' })
      if (testInfo.status !== testInfo.expectedStatus) {
        try {
          await testInfo.attach('dom-snapshot.html', { body: await page.content(), contentType: 'text/html' })
        } catch (error) {
          log.warn(`DOM snapshot not taken: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    },
    { auto: true },
  ],
})
