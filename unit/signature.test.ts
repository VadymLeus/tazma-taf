import assert from 'node:assert/strict'
import { test } from 'node:test'
import { detectContainer } from '../src/core/media/signature.ts'

const bytes = (...values: number[]) => Uint8Array.from(values)
const ascii = (text: string) => Uint8Array.from(Buffer.from(text, 'latin1'))

test('WebM starts with the EBML header', () => {
  assert.equal(detectContainer(bytes(0x1a, 0x45, 0xdf, 0xa3, 0x01)), 'webm')
})

test('MP4 has "ftyp" at offset 4', () => {
  assert.equal(detectContainer(Uint8Array.from([0, 0, 0, 0x18, ...ascii('ftypisom')])), 'mp4')
})

test('GIF starts with GIF87a or GIF89a', () => {
  assert.equal(detectContainer(ascii('GIF89a....')), 'gif')
  assert.equal(detectContainer(ascii('GIF87a....')), 'gif')
})

test('anything else, and anything too short, is unknown', () => {
  assert.equal(detectContainer(ascii('hello world!')), 'unknown')
  assert.equal(detectContainer(bytes(0x1a)), 'unknown')
  assert.equal(detectContainer(bytes()), 'unknown')
})
