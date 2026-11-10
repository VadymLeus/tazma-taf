// Layer 3 (Core). The only place that knows how long to wait. The framework never
// sleeps for a fixed time: it waits for a condition (web-first assertions and
// polling) with a timeout taken from here.
import { expect } from '@playwright/test'

export interface Timeouts {
  // One whole test.
  test: number
  // One web-first assertion.
  ui: number
  // One click / fill.
  action: number
  navigation: number
  // An export from the click to the result card.
  export: number
}

export function timeouts(vars: NodeJS.ProcessEnv = process.env): Timeouts {
  const exportMs = Number(vars.TAF_EXPORT_TIMEOUT_MS ?? 120_000)
  return { test: exportMs + 60_000, ui: 10_000, action: 10_000, navigation: 30_000, export: exportMs }
}

export const TIMEOUTS = timeouts()

// Polls a probe until the predicate holds; returns the last probed value.
export async function pollUntil<T>(
  probe: () => Promise<T>,
  predicate: (value: T) => boolean,
  options: { timeout: number; message: string },
): Promise<T> {
  let last: T | undefined
  await expect
    .poll(
      async () => {
        last = await probe()
        return predicate(last)
      },
      { timeout: options.timeout, message: options.message, intervals: [100, 250, 500, 1000] },
    )
    .toBe(true)
  return last as T
}
