// Policy check: the framework waits for conditions, never for a fixed time.
import fs from 'node:fs'
import path from 'node:path'

const FORBIDDEN = [/waitForTimeout\s*\(/, /\bsetTimeout\s*\(/, /\bsleep\s*\(/, /page\.pause\s*\(/]
const roots = ['src', 'tests']
const offences = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.ts$/.test(entry.name)) check(full)
  }
}

function check(file) {
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      if (line.trim().startsWith('//')) return
      for (const pattern of FORBIDDEN) {
        if (pattern.test(line)) offences.push(`${file}:${index + 1}: ${line.trim()}`)
      }
    })
}

for (const root of roots) if (fs.existsSync(root)) walk(root)
if (offences.length > 0) {
  console.error('Fixed sleeps are forbidden. Wait for a condition instead:\n' + offences.join('\n'))
  process.exit(1)
}
console.log('OK: no fixed sleeps in src/ and tests/')
