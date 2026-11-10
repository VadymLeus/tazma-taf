// Layer 2. The editor page: importing files into the media library.
import { expect } from '@playwright/test'
import { TIMEOUTS } from '../../core/waits/waits.ts'
import { BasePage } from './BasePage.ts'
import { editorLocators } from './EditorPage.locators.ts'

export class EditorPage extends BasePage {
  private readonly ui = editorLocators(this.page)

  async importFiles(paths: string[]): Promise<void> {
    await this.step(`Імпортувати файлів: ${paths.length}`, async () => {
      await this.ui.fileInput.setInputFiles(paths)
      // The import is over when no "reading" note is left.
      await expect(this.ui.pending).toHaveCount(0, { timeout: TIMEOUTS.navigation })
    })
  }

  async expectInLibrary(fileName: string, meta: string): Promise<void> {
    await this.step(`Перевірити файл у медіатеці: ${fileName}`, async () => {
      const item = this.ui.item(fileName)
      await expect(item).toHaveCount(1)
      await expect(item.locator('.file-meta')).toHaveText(meta)
    })
  }

  async expectLibrarySize(count: number): Promise<void> {
    await expect(this.ui.items).toHaveCount(count)
  }

  async importErrors(): Promise<string[]> {
    return this.ui.errors.allInnerTexts()
  }

  async expectErrorFor(fileName: string): Promise<void> {
    await this.step(`Перевірити помилку імпорту для ${fileName}`, async () => {
      await expect(this.ui.errors.filter({ hasText: `${fileName}: ` })).toHaveCount(1)
    })
  }

  async expectNoErrors(): Promise<void> {
    await expect(this.ui.errors).toHaveCount(0)
  }

  async expectVisible(): Promise<void> {
    await expect(this.ui.root).toBeVisible()
  }
}
