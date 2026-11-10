// Layer 4 (Test Data). Entity factory for input files: stored fixtures are
// referenced by name, broken files are generated on the fly into a work folder.
import fs from 'node:fs'
import path from 'node:path'
import type { FileSpec } from './types.ts'

export function fixturePath(name: string, root: string = process.cwd()): string {
  const file = path.join(root, 'src', 'testdata', 'media', name)
  if (!fs.existsSync(file)) throw new Error(`Media fixture "${name}" is missing: ${file}`)
  return file
}

export class MediaFactory {
  private readonly workDir: string

  constructor(workDir: string) {
    this.workDir = workDir
  }

  resolve(spec: FileSpec): string {
    if (spec.kind === 'fixture') return fixturePath(spec.name)
    fs.mkdirSync(this.workDir, { recursive: true })
    const file = path.join(this.workDir, spec.fileName)
    if (spec.generator === 'empty') fs.writeFileSync(file, '')
    else fs.writeFileSync(file, 'This is plain text, not a video.\n'.repeat(50))
    return file
  }
}
