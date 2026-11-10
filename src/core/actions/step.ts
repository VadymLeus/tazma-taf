// Layer 3 (Core). Wraps one action in a named report step, logs its start and
// end, and intercepts an exception so the failure says which step it happened in.
import { test } from '@playwright/test'
import type { Logger } from '../logging/logger.ts'

export class TafStepError extends Error {
  readonly stepTitle: string

  constructor(stepTitle: string, cause: unknown) {
    const reason = cause instanceof Error ? cause.message : String(cause)
    super(`Step failed: ${stepTitle}\n${reason}`)
    this.name = 'TafStepError'
    this.stepTitle = stepTitle
    // Keep the place where the original error was raised, not this wrapper.
    if (cause instanceof Error && cause.stack) {
      this.stack = `${this.name}: ${this.message}\n${cause.stack.split('\n').filter((l) => l.trimStart().startsWith('at ')).join('\n')}`
    }
  }
}

export async function step<T>(log: Logger, title: string, body: () => Promise<T>): Promise<T> {
  return test.step(title, async () => {
    log.info(`> ${title}`)
    try {
      const value = await body()
      log.info(`< ${title}`)
      return value
    } catch (error) {
      // The innermost step already named the place of the failure.
      if (error instanceof TafStepError) {
        log.error(`  in outer step: ${title}`)
        throw error
      }
      log.error(`! ${title}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
      throw new TafStepError(title, error)
    }
  })
}
