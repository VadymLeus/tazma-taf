// Layer 1 (Test Scripts). TC-EMP-01: the export page of an empty project offers nothing to export.
import { test } from '../src/business/fixtures.ts'

test('TC-EMP-01: порожній проєкт не можна експортувати, є вихід до редактора', { tag: ['@smoke', '@export'] }, async ({ app }) => {
  await app.open()
  await app.pageBar.open('export')

  await app.exportPage.expectEmptyProject()
  await app.exportPage.goBackToEditor()

  await app.pageBar.expectCurrent('editor')
  await app.editor.expectVisible()
})
