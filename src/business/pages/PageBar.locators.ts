// Layer 2. Locators of the page bar: selectors only, no actions.
import type { Page } from '@playwright/test'
import { UI } from '../ui-texts.ts'

export type PageId = 'editor' | 'export' | 'stand'

export function pageBarLocators(page: Page) {
  const nav = page.getByRole('navigation', { name: UI.nav.label })
  return {
    nav,
    tab: (id: PageId) => nav.getByRole('button', { name: UI.nav[id] }),
    currentTab: nav.locator('[aria-current="page"]'),
    badge: nav.locator('.tab-badge'),
  }
}
