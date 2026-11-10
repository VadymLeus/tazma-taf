// Layer 3 (Core). Listens to the browser while a test runs: HTTP requests and
// responses, console output and uncaught page errors.
import type { Page, Request } from '@playwright/test'
import type { Logger } from '../logging/logger.ts'

export interface HttpRecord {
  method: string
  url: string
  resourceType: string
  status: number | null
  durationMs: number | null
  failure: string | null
}

export interface ConsoleRecord {
  type: string
  text: string
}

export class PageDiagnostics {
  readonly http: HttpRecord[] = []
  readonly console: ConsoleRecord[] = []
  readonly pageErrors: string[] = []
  private readonly page: Page
  private readonly log: Logger
  private readonly byRequest = new Map<Request, { record: HttpRecord; startedAt: number }>()

  constructor(page: Page, log: Logger) {
    this.page = page
    this.log = log
  }

  attach(): void {
    this.page.on('request', (request) => {
      const record: HttpRecord = {
        method: request.method(),
        url: request.url(),
        resourceType: request.resourceType(),
        status: null,
        durationMs: null,
        failure: null,
      }
      this.http.push(record)
      this.byRequest.set(request, { record, startedAt: Date.now() })
    })
    this.page.on('response', (response) => {
      const entry = this.byRequest.get(response.request())
      if (!entry) return
      entry.record.status = response.status()
      entry.record.durationMs = Date.now() - entry.startedAt
      this.log.debug(`HTTP ${entry.record.method} ${response.status()} ${entry.record.url}`)
    })
    this.page.on('requestfailed', (request) => {
      const entry = this.byRequest.get(request)
      if (entry) entry.record.failure = request.failure()?.errorText ?? 'failed'
    })
    this.page.on('console', (message) => {
      this.console.push({ type: message.type(), text: message.text() })
    })
    this.page.on('pageerror', (error) => {
      this.pageErrors.push(error.message)
      this.log.error(`pageerror: ${error.message}`)
    })
  }

  // Requests to an origin other than the application's own (blob: and data: stay in the browser).
  foreignRequests(baseURL: string): HttpRecord[] {
    const own = new URL(baseURL).origin
    return this.http.filter((record) => {
      if (!/^https?:/i.test(record.url)) return false
      return new URL(record.url).origin !== own
    })
  }

  httpLog(): string {
    const lines = this.http.map((r) => {
      const status = r.failure ? `FAILED(${r.failure})` : (r.status ?? '...')
      const time = r.durationMs === null ? '' : ` ${r.durationMs}ms`
      return `${r.method} ${status} ${r.url} [${r.resourceType}]${time}`
    })
    return lines.join('\n') + '\n'
  }

  consoleLog(): string {
    const lines = this.console.map((m) => `[${m.type}] ${m.text}`)
    for (const error of this.pageErrors) lines.push(`[pageerror] ${error}`)
    return lines.join('\n') + '\n'
  }
}
