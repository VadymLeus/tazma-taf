// Layer 3 (Core). Structured logger. Every line is kept for the test report
// (test.log attachment); only warnings and errors are echoed to the terminal,
// so a console stays readable. TAF_LOG_STDOUT=info|debug echoes more.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

export function parseLevel(value: string | undefined, fallback: LogLevel = 'info'): LogLevel {
  return value === 'debug' || value === 'info' || value === 'warn' || value === 'error' ? value : fallback
}

export function formatLine(time: Date, level: LogLevel, scope: string, message: string): string {
  const stamp = time.toISOString().slice(11, 23)
  return `[${stamp}] ${level.toUpperCase().padEnd(5)} ${scope}: ${message}`
}

export class Logger {
  readonly scope: string
  private readonly min: number
  private readonly echo: number
  private readonly lines: string[] = []

  constructor(
    scope: string,
    level: LogLevel = parseLevel(process.env.TAF_LOG_LEVEL, 'info'),
    echo: LogLevel = parseLevel(process.env.TAF_LOG_STDOUT, 'warn'),
  ) {
    this.scope = scope
    this.min = ORDER[level]
    this.echo = ORDER[echo]
  }

  debug(message: string): void {
    this.write('debug', message)
  }
  info(message: string): void {
    this.write('info', message)
  }
  warn(message: string): void {
    this.write('warn', message)
  }
  error(message: string): void {
    this.write('error', message)
  }

  text(): string {
    return this.lines.join('\n') + '\n'
  }

  private write(level: LogLevel, message: string): void {
    if (ORDER[level] < this.min) return
    const line = formatLine(new Date(), level, this.scope, message)
    this.lines.push(line)
    if (ORDER[level] >= this.echo) process.stdout.write(line + '\n')
  }
}
