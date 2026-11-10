// Layer 2. Business steps: sequences of page-object calls that a user would call one action.
import { step } from '../../core/actions/step.ts'
import type { VideoEditorApp } from '../VideoEditorApp.ts'
import type { Logger } from '../../core/logging/logger.ts'
import type { ExportSettingsInput } from '../../testdata/types.ts'
import type { Outcome } from '../pages/ExportPage.ts'

// Precondition of most scenarios: a source is imported and the export page is ready.
export async function openExportPageWith(app: VideoEditorApp, log: Logger, sourcePath: string): Promise<void> {
  await step(log, 'Передумова: імпортувати відео й відкрити сторінку експорту', async () => {
    await app.open()
    await app.editor.importFiles([sourcePath])
    await app.pageBar.open('export')
    await app.exportPage.waitUntilReady()
  })
}

// The user's action "export with these settings".
export async function runExport(app: VideoEditorApp, log: Logger, settings: ExportSettingsInput): Promise<Outcome> {
  return step(log, 'Виконати експорт із заданими налаштуваннями', async () => {
    await app.exportPage.configure(settings)
    await app.exportPage.start()
    return app.exportPage.waitForOutcome()
  })
}
