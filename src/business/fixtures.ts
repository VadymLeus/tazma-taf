// Layer 2. The fixtures the test scripts import: the core ones plus the application
// facade and the media factory.
import { expect } from '@playwright/test'
import { test as core } from '../core/fixtures/base.ts'
import { MediaFactory } from '../testdata/MediaFactory.ts'
import { VideoEditorApp } from './VideoEditorApp.ts'

interface BusinessFixtures {
  app: VideoEditorApp
  media: MediaFactory
}

export const test = core.extend<BusinessFixtures>({
  app: async ({ page, log }, use) => {
    await use(new VideoEditorApp(page, log))
  },
  media: async ({}, use, testInfo) => {
    await use(new MediaFactory(testInfo.outputPath('generated-media')))
  },
})

export { expect }
