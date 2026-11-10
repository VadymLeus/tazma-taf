// Layer 2 (Business Logic). Base of all page objects: every public action is run
// as a named, logged report step.
import type { Page } from '@playwright/test'
import { step } from '../../core/actions/step.ts'
import type { Logger } from '../../core/logging/logger.ts'

export abstract class BasePage {
  protected readonly page: Page
  protected readonly log: Logger

  constructor(page: Page, log: Logger) {
    this.page = page
    this.log = log
  }

  protected step<T>(title: string, body: () => Promise<T>): Promise<T> {
    return step(this.log, title, body)
  }
}
