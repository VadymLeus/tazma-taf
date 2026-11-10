// Layer 1 (Test Scripts). TC-SEG: validation of the part length of a resumable export (data-driven,
// equivalence classes and boundary values).
import { casesOf, loadDataset } from '../src/testdata/provider.ts'
import type { SegmentCase } from '../src/testdata/types.ts'
import { test } from '../src/business/fixtures.ts'
import { fixturePath } from '../src/testdata/MediaFactory.ts'
import { openExportPageWith } from '../src/business/steps/exportSteps.ts'

const dataset = loadDataset<SegmentCase>('segment-length')

for (const set of ['valid', 'boundary', 'invalid'] as const) {
  for (const c of casesOf(dataset, set)) {
    test(`TC-SEG ${c.id} [${set}]: ${c.title} ("${c.value}")`, { tag: ['@ddt', '@validation', ...(c.tags ?? [])] }, async ({ app, log }) => {
      await openExportPageWith(app, log, fixturePath('short.webm'))
      const support = await app.exportPage.supports({ container: 'webm' })
      test.skip(!support.ok, support.reason ?? 'not supported by this browser')

      // The field exists only for a resumable export.
      await app.exportPage.configure({ container: 'webm', resumable: true })
      await app.exportPage.setSegmentLength(c.value)

      await app.exportPage.expectSegmentAccepted(c.accepted)
    })
  }
}
