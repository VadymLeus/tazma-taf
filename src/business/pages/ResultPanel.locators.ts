// Layer 2. Locators of the result card of the export page.
import type { Page } from '@playwright/test'
import { UI } from '../ui-texts.ts'

export function resultLocators(page: Page) {
  const root = page.getByRole('region', { name: UI.regions.export })
  const rows = root.locator('dl.export-result')
  return {
    heading: root.getByRole('heading', { name: UI.export.result, exact: true }),
    media: (tag: 'video' | 'img') => root.locator(`${tag}.export-video`),
    rows,
    rowValue: (label: string) =>
      rows.locator('dt', { hasText: new RegExp(`^${label}$`) }).locator('xpath=following-sibling::dd[1]'),
    saveLink: root.getByRole('link', { name: UI.export.save }),
    close: root.getByRole('button', { name: UI.export.closeResult }),
  }
}
