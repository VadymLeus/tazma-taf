// Layer 2. The result card: facts about the finished export and the saved file.
import path from 'node:path'
import { expect } from '@playwright/test'
import { BasePage } from './BasePage.ts'
import { resultLocators } from './ResultPanel.locators.ts'
import { UI } from '../ui-texts.ts'

export interface SavedFile {
  suggestedName: string
  path: string
}

export class ResultPanel extends BasePage {
  private readonly ui = resultLocators(this.page)

  async expectVisible(): Promise<void> {
    await expect(this.ui.heading).toBeVisible()
  }

  async expectHidden(): Promise<void> {
    await expect(this.ui.heading).toHaveCount(0)
  }

  async expectFormat(text: string): Promise<void> {
    await expect(this.ui.rowValue(UI.export.rows.format)).toHaveText(text)
  }

  async expectFrame(text: string): Promise<void> {
    await expect(this.ui.rowValue(UI.export.rows.frame)).toHaveText(text)
  }

  async expectMedia(tag: 'video' | 'img'): Promise<void> {
    await expect(this.ui.media(tag)).toHaveCount(1)
  }

  // Clicks "Зберегти" and stores the downloaded file in a folder of the test.
  async save(folder: string): Promise<SavedFile> {
    return this.step('Зберегти результат у файл', async () => {
      const [download] = await Promise.all([this.page.waitForEvent('download'), this.ui.saveLink.click()])
      const target = path.join(folder, download.suggestedFilename())
      await download.saveAs(target)
      return { suggestedName: download.suggestedFilename(), path: target }
    })
  }

  async close(): Promise<void> {
    await this.step('Закрити результат', async () => {
      await this.ui.close.click()
      await expect(this.ui.heading).toHaveCount(0)
    })
  }
}
