// Layer 1 (Test Scripts). TC-NET-01: the video never leaves the browser. Every HTTP request of an
// import-and-export session goes to the application's own origin.
import { expect, test } from '../src/business/fixtures.ts'
import { fixturePath } from '../src/testdata/MediaFactory.ts'
import { openExportPageWith, runExport } from '../src/business/steps/exportSteps.ts'

test('TC-NET-01: під час імпорту й експорту немає запитів до сторонніх серверів', { tag: ['@smoke', '@security'] }, async ({ app, log, diagnostics, baseURL }) => {
  await openExportPageWith(app, log, fixturePath('short.webm'))
  expect(await runExport(app, log, { container: 'webm', mode: 'full', videoCodec: 'vp9' })).toBe('done')

  expect(diagnostics.http.length, 'the page loaded something').toBeGreaterThan(0)
  expect(diagnostics.foreignRequests(baseURL!), 'requests to foreign origins').toEqual([])
  expect(diagnostics.http.filter((r) => r.failure), 'failed requests').toEqual([])
})
