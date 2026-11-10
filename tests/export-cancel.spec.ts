// Layer 1 (Test Scripts). TC-CAN-01: cancelling a running export returns the page to its starting state.
import { expect, test } from '../src/business/fixtures.ts'
import { fixturePath } from '../src/testdata/MediaFactory.ts'
import { openExportPageWith } from '../src/business/steps/exportSteps.ts'

test('TC-CAN-01: скасування довгого експорту повертає форму в початковий стан', { tag: ['@export', '@regression'] }, async ({ app, log, diagnostics }) => {
  // Precondition: a 30-second 1080p source, so the export is still running when it is cancelled.
  await openExportPageWith(app, log, fixturePath('long.webm'))
  await app.exportPage.configure({ container: 'webm', mode: 'full', videoCodec: 'vp9', quality: 'high' })

  await app.exportPage.start()
  await app.exportPage.waitForProgress()
  await app.exportPage.cancel()

  // Postconditions: no result, no error, the form is usable, the tab shows no badge.
  await app.exportPage.expectIdleAgain()
  await app.pageBar.expectNoBadge()
  expect(diagnostics.pageErrors, 'uncaught page errors').toEqual([])
})
