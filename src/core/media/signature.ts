// Layer 3 (Core). Recognises a media container by its first bytes, so a test can
// check the downloaded file itself and not only what the page says about it.
import fs from 'node:fs'

export type ContainerKind = 'webm' | 'mp4' | 'gif' | 'unknown'

export function detectContainer(head: Uint8Array): ContainerKind {
  const ascii = (from: number, to: number) => String.fromCharCode(...head.slice(from, to))
  if (head.length >= 4 && head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) return 'webm'
  if (head.length >= 8 && ascii(4, 8) === 'ftyp') return 'mp4'
  if (head.length >= 6 && (ascii(0, 6) === 'GIF89a' || ascii(0, 6) === 'GIF87a')) return 'gif'
  return 'unknown'
}

export function readHead(file: string, length = 16): Uint8Array {
  const fd = fs.openSync(file, 'r')
  try {
    const buffer = new Uint8Array(length)
    const read = fs.readSync(fd, buffer, 0, length, 0)
    return buffer.slice(0, read)
  } finally {
    fs.closeSync(fd)
  }
}
