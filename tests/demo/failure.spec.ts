// Layer 1 (Test Scripts). TC-DEMO-01: fails on purpose, to show what the framework keeps after a failure
// (screenshot, trace, video, logs, DOM snapshot). Runs only with DEMO_FAILURE=1.
import { test } from '../../src/business/fixtures.ts'
import { fixturePath } from '../../src/testdata/MediaFactory.ts'

test.describe('demo: artefacts of a failure', { tag: '@demo' }, () => {
  test.skip(!process.env.DEMO_FAILURE, 'Set DEMO_FAILURE=1 to produce an intentionally failing run.');

  test('TC-DEMO-01: очікування свідомо хибної тривалості файлу', async ({ app }) => {
    await app.open()
    await app.editor.importFiles([fixturePath('short.webm')])
    // The file lasts 2 s, so this expectation cannot hold.
    await app.editor.expectInLibrary('short.webm', '0:09.000 · 640×480')
  })
})
