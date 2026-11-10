// Layer 2. The export page: settings, running, cancelling and waiting for the outcome.
import { expect } from '@playwright/test'
import { TIMEOUTS, pollUntil } from '../../core/waits/waits.ts'
import type { ExportSettingsInput } from '../../testdata/types.ts'
import { BasePage } from './BasePage.ts'
import { exportLocators } from './ExportPage.locators.ts'
import { ResultPanel } from './ResultPanel.ts'

export type Outcome = 'done' | 'error'

export interface Support {
  ok: boolean
  reason?: string
}

export class ExportPage extends BasePage {
  private readonly ui = exportLocators(this.page)
  readonly result = new ResultPanel(this.page, this.log)

  // The form appears after the browser has been asked which codecs it can encode.
  async waitUntilReady(): Promise<void> {
    await this.step('Дочекатися форми експорту', async () => {
      await expect(this.ui.mainGroup).toBeVisible({ timeout: TIMEOUTS.navigation })
      await expect(this.ui.start).toBeEnabled({ timeout: TIMEOUTS.navigation })
    })
  }

  async summary(): Promise<string> {
    return this.ui.summary.innerText()
  }

  async expectEmptyProject(): Promise<void> {
    await this.step('Перевірити повідомлення про порожній таймлайн', async () => {
      await expect(this.ui.emptyNotice).toBeVisible()
      await expect(this.ui.start).toHaveCount(0)
    })
  }

  async goBackToEditor(): Promise<void> {
    await this.step('Повернутися до редактора', async () => {
      await this.ui.toEditor.click()
    })
  }

  // Whether this browser offers the container and codec of the settings.
  async supports(settings: ExportSettingsInput): Promise<Support> {
    if (settings.container) {
      const containers = await this.ui.container.locator('option').evaluateAll((o) => o.map((x) => (x as HTMLOptionElement).value))
      if (!containers.includes(settings.container)) return { ok: false, reason: `container ${settings.container} is not offered` }
      await this.ui.container.selectOption(settings.container)
    }
    if (settings.videoCodec && settings.container !== 'gif') {
      const codecs = await this.ui.videoCodec.locator('option').evaluateAll((o) => o.map((x) => (x as HTMLOptionElement).value))
      if (!codecs.includes(settings.videoCodec)) {
        return { ok: false, reason: `codec ${settings.videoCodec} is not offered for ${settings.container ?? 'this container'}` }
      }
    }
    return { ok: true }
  }

  async configure(settings: ExportSettingsInput): Promise<void> {
    await this.step(`Налаштувати експорт: ${JSON.stringify(settings)}`, async () => {
      // The container goes first: changing it resets the other choices.
      if (settings.container) await this.choose(this.ui.container, settings.container)
      if (settings.container === 'gif') {
        if (settings.gifFps !== undefined) await this.choose(this.ui.gifFps, String(settings.gifFps))
      } else {
        if (settings.mode) await this.choose(this.ui.mode, settings.mode)
        if (settings.videoCodec) await this.choose(this.ui.videoCodec, settings.videoCodec)
        if (settings.quality) await this.choose(this.ui.quality, settings.quality)
      }
      if (settings.height !== undefined) await this.choose(this.ui.size, settings.height === null ? '' : String(settings.height))
      if (settings.resumable !== undefined) await this.ui.resumable.setChecked(settings.resumable)
    })
  }

  // Selects an option and checks that the page kept it (it silently
  // replaces choices the browser cannot make).
  private async choose(select: ReturnType<typeof exportLocators>['container'], value: string): Promise<void> {
    await select.selectOption(value)
    await expect(select).toHaveValue(value)
  }

  async setSegmentLength(text: string): Promise<void> {
    await this.step(`Ввести довжину частини: "${text}"`, async () => {
      await this.ui.segment.fill(text)
    })
  }

  async expectSegmentAccepted(accepted: boolean): Promise<void> {
    await this.step(`Перевірити, що довжина частини ${accepted ? 'прийнята' : 'відхилена'}`, async () => {
      if (accepted) {
        await expect(this.ui.segmentError).toHaveCount(0)
        await expect(this.ui.start).toBeEnabled()
      } else {
        await expect(this.ui.segmentError).toBeVisible()
        await expect(this.ui.start).toBeDisabled()
      }
    })
  }

  async start(): Promise<void> {
    await this.step('Запустити експорт', async () => {
      await this.ui.start.click()
    })
  }

  async cancel(): Promise<void> {
    await this.step('Скасувати експорт', async () => {
      await this.ui.cancel.click()
    })
  }

  // Waits until the encoder has really started: the progress bar moved off zero.
  async waitForProgress(): Promise<void> {
    await this.step('Дочекатися початку кодування', async () => {
      await expect(this.ui.runningHeading).toBeVisible()
      await pollUntil(
        async () => Number(await this.ui.progress.getAttribute('value')),
        (value) => value > 0,
        { timeout: TIMEOUTS.navigation, message: 'the export progress never left zero' },
      )
    })
  }

  async expectIdleAgain(): Promise<void> {
    await this.step('Перевірити, що експорт скасовано і форма знову доступна', async () => {
      await expect(this.ui.idleCard).toBeVisible()
      await expect(this.ui.start).toBeEnabled()
      await expect(this.ui.runningHeading).toHaveCount(0)
      await expect(this.ui.resultHeading).toHaveCount(0)
      await expect(this.ui.errorHeading).toHaveCount(0)
    })
  }

  async waitForOutcome(): Promise<Outcome> {
    return this.step('Дочекатися завершення експорту', async () => {
      await expect(this.ui.resultHeading.or(this.ui.errorHeading)).toBeVisible({ timeout: TIMEOUTS.export })
      return (await this.ui.resultHeading.isVisible()) ? 'done' : 'error'
    })
  }

  async failureText(): Promise<string> {
    return this.ui.failureText.innerText()
  }
}
