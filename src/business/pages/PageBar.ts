// Layer 2. The tab bar that switches between the pages of the application.
import { expect } from '@playwright/test'
import { TIMEOUTS } from '../../core/waits/waits.ts'
import { BasePage } from './BasePage.ts'
import { pageBarLocators } from './PageBar.locators.ts'
import type { PageId } from './PageBar.locators.ts'

export class PageBar extends BasePage {
  private readonly ui = pageBarLocators(this.page)

  async open(id: PageId): Promise<void> {
    await this.step(`Відкрити вкладку "${id}"`, async () => {
      await this.ui.tab(id).click()
      await expect(this.ui.tab(id)).toHaveAttribute('aria-current', 'page', { timeout: TIMEOUTS.ui })
    })
  }

  async expectCurrent(id: PageId): Promise<void> {
    await expect(this.ui.tab(id)).toHaveAttribute('aria-current', 'page')
  }

  async expectNoBadge(): Promise<void> {
    await expect(this.ui.badge).toHaveCount(0)
  }
}
