// Layer 2. Facade over the page objects: one entry point for the test scripts.
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { step } from '../core/actions/step.ts'
import type { Logger } from '../core/logging/logger.ts'
import { TIMEOUTS } from '../core/waits/waits.ts'
import { EditorPage } from './pages/EditorPage.ts'
import { ExportPage } from './pages/ExportPage.ts'
import { PageBar } from './pages/PageBar.ts'
import { pageBarLocators } from './pages/PageBar.locators.ts'

export class VideoEditorApp {
  readonly pageBar: PageBar
  readonly editor: EditorPage
  readonly exportPage: ExportPage
  private readonly page: Page
  private readonly log: Logger

  constructor(page: Page, log: Logger) {
    this.page = page
    this.log = log
    this.pageBar = new PageBar(page, log)
    this.editor = new EditorPage(page, log)
    this.exportPage = new ExportPage(page, log)
  }

  async open(): Promise<void> {
    await step(this.log, 'Відкрити застосунок', async () => {
      await this.page.goto('/')
      await expect(pageBarLocators(this.page).nav).toBeVisible({ timeout: TIMEOUTS.navigation })
      await this.editor.expectVisible()
    })
  }
}
