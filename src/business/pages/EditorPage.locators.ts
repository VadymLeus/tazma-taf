// Layer 2. Locators of the editor page (media library and import field).
import type { Page } from '@playwright/test'
import { UI } from '../ui-texts.ts'

export function editorLocators(page: Page) {
  const root = page.getByRole('region', { name: UI.regions.editor })
  return {
    root,
    fileInput: root.locator('input[type="file"]').first(),
    libraryTitle: root.getByRole('heading', { name: UI.library.title, exact: true }),
    pending: root.getByText(UI.library.pending),
    errors: root.locator('p.error'),
    items: root.locator('li.file'),
    item: (fileName: string) => root.locator('li.file').filter({ has: page.locator('.file-title', { hasText: fileName }) }),
  }
}
