// Automation Coverage and ROI of the TAF, computed from the repository itself.
//   Coverage = automated checks / checks in the manual regression checklist * 100 %
//   ROI      = (Savings - Cost) / Cost * 100 %, Savings and Cost in person-hours
import fs from 'node:fs'
import path from 'node:path'

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const checklist = read('docs/regression-checklist.json').checks
const a = read('docs/roi-assumptions.json')

// Every id named in automatedBy must exist in a dataset or in a test script.
const known = new Set()
for (const file of fs.readdirSync('src/testdata/datasets')) {
  const dataset = read(path.join('src/testdata/datasets', file))
  for (const list of Object.values(dataset.sets)) for (const item of list) known.add(item.id)
}
const files = []
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : /\.ts$/.test(e.name) && files.push(path.join(dir, e.name))))
for (const dir of ['src', 'tests', 'unit']) walk(dir)
for (const file of files.filter((f) => f.startsWith('tests'))) {
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/TC-[A-Z]+-\d+/g)) known.add(m[0])
}
const unknown = checklist.flatMap((c) => c.automatedBy).filter((id) => !known.has(id))
if (unknown.length > 0) {
  console.error('automatedBy names ids that do not exist:', unknown.join(', '))
  process.exit(1)
}
const ids = checklist.flatMap((c) => c.automatedBy)
if (new Set(ids).size !== ids.length) {
  console.error('an id is used by more than one check')
  process.exit(1)
}

// Coverage by area and in total.
const areas = {}
for (const c of checklist) {
  areas[c.area] ??= { total: 0, automated: 0 }
  areas[c.area].total += 1
  if (c.automatedBy.length > 0) areas[c.area].automated += 1
}
const total = checklist.length
const automated = checklist.filter((c) => c.automatedBy.length > 0).length

// Size of the framework: lines of code without blank lines and comments.
let loc = 0
for (const file of [...files, 'playwright.config.ts']) {
  loc += fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('//')).length
}

const savedPerRunH = (automated * a.manualMinutesPerCheck - a.humanMinutesPerAutomatedRun) / 60
const costH = loc / a.locPerHour + a.maintenanceHoursPerMonth * a.months
const roi = (runs) => ((runs * savedPerRunH - costH) / costH) * 100

const result = {
  checks: { total, automated, manual: total - automated, coveragePercent: +((automated / total) * 100).toFixed(1) },
  areas: Object.fromEntries(Object.entries(areas).map(([k, v]) => [k, { ...v, percent: +((v.automated / v.total) * 100).toFixed(1) }])),
  loc,
  savedPerRunHours: +savedPerRunH.toFixed(3),
  costHours: +costH.toFixed(2),
  breakEvenRuns: Math.ceil(costH / savedPerRunH),
  base: { runs: a.runs, savingsHours: +(a.runs * savedPerRunH).toFixed(2), roiPercent: +roi(a.runs).toFixed(1) },
  sensitivity: a.sensitivityRuns.map((r) => ({ runs: r, savingsHours: +(r * savedPerRunH).toFixed(2), roiPercent: +roi(r).toFixed(1) })),
}
fs.writeFileSync('docs/coverage-roi-result.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
