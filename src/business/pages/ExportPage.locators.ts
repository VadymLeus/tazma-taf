// Layer 2. Locators of the export page: selectors only, no actions.
import type { Page } from '@playwright/test'
import { UI } from '../ui-texts.ts'

export function exportLocators(page: Page) {
  const root = page.getByRole('region', { name: UI.regions.export })
  // A form control is found by the caption written next to it.
  const field = (caption: string) =>
    root.locator('label.field').filter({ has: page.getByText(caption, { exact: true }) }).locator('select, input')
  const heading = (name: string) => root.getByRole('heading', { name, exact: true })

  return {
    root,
    title: heading(UI.export.title),
    mainGroup: heading(UI.export.mainGroup),
    idleCard: heading(UI.export.idleCard),
    runningHeading: heading(UI.export.running),
    resultHeading: heading(UI.export.result),
    errorHeading: heading(UI.export.failed),
    summary: root.locator('.export-summary'),
    emptyNotice: root.getByText(UI.export.emptyNotice),
    toEditor: root.getByRole('button', { name: UI.export.toEditor }),
    container: field(UI.export.fields.container),
    mode: field(UI.export.fields.mode),
    videoCodec: field(UI.export.fields.videoCodec),
    quality: field(UI.export.fields.quality),
    size: field(UI.export.fields.size),
    gifFps: field(UI.export.fields.gifFps),
    segment: field(UI.export.fields.segment),
    resumable: root.getByRole('checkbox', { name: UI.export.resumable }),
    segmentError: root.locator('p.error', { hasText: UI.export.segmentErrorStart }),
    start: root.getByRole('button', { name: UI.export.start }),
    cancel: root.getByRole('button', { name: UI.export.cancel }),
    progress: root.locator('progress.export-progress'),
    status: root.locator('p.export-status'),
    failureText: root.locator('p.error[role="alert"]'),
  }
}
