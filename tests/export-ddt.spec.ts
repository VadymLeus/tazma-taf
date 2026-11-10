// Layer 1 (Test Scripts). TC-EXP: a full export run for every record of the dataset (data-driven).
import { casesOf, loadDataset } from '../src/testdata/provider.ts'
import type { ExportCase } from '../src/testdata/types.ts'
import { detectContainer, readHead } from '../src/core/media/signature.ts'
import { expect, test } from '../src/business/fixtures.ts'
import { UI } from '../src/business/ui-texts.ts'
import { fixturePath } from '../src/testdata/MediaFactory.ts'
import { openExportPageWith, runExport } from '../src/business/steps/exportSteps.ts'

const dataset = loadDataset<ExportCase>('export-scenarios')

for (const set of ['valid', 'boundary'] as const) {
  for (const c of casesOf(dataset, set)) {
    test(`TC-EXP ${c.id} [${set}]: ${c.title}`, { tag: ['@ddt', '@export', ...(c.tags ?? [])] }, async ({ app, log, diagnostics }, testInfo) => {
      // Precondition: a source is on the timeline and the export page is open.
      await openExportPageWith(app, log, fixturePath(c.source))

      // The scenario is skipped (not failed) when this browser cannot encode the requested format.
      const support = await app.exportPage.supports(c.settings)
      test.skip(!support.ok, support.reason ?? 'not supported by this browser')

      const outcome = await runExport(app, log, c.settings)
      expect(outcome, outcome === 'error' ? await app.exportPage.failureText() : '').toBe('done')

      // The page tells the truth about the result...
      await app.exportPage.result.expectFormat(c.expect.format)
      await app.exportPage.result.expectFrame(c.expect.frame)
      await app.exportPage.result.expectMedia(c.expect.mediaTag)

      // ...and so does the file that the user downloads.
      const saved = await app.exportPage.result.save(testInfo.outputPath('downloads'))
      expect(saved.suggestedName).toBe(`${UI.export.savedFileBase}.${c.expect.fileExt}`)
      expect(detectContainer(readHead(saved.path))).toBe(c.expect.signature)

      // Postcondition: the form is back, nothing was thrown in the page.
      await app.exportPage.result.close()
      await app.exportPage.result.expectHidden()
      expect(diagnostics.pageErrors, 'uncaught page errors').toEqual([])
    })
  }
}
