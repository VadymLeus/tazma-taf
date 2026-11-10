// Layer 4 (Test Data). Shapes of the records in src/testdata/datasets/*.json.

export type SetName = 'valid' | 'boundary' | 'invalid'

export interface DataCase {
  id: string
  title: string
  tags?: string[]
}

export interface Dataset<T extends DataCase> {
  description: string
  sets: Partial<Record<SetName, T[]>>
}

export type FileSpec =
  | { kind: 'fixture'; name: string }
  | { kind: 'generated'; generator: 'text' | 'empty'; fileName: string }

export interface ImportCase extends DataCase {
  files: FileSpec[]
  expect: {
    library: { fileName: string; meta: string }[]
    // Each entry is the name of a file whose error line must be shown.
    errors: string[]
  }
}

export type ContainerName = 'mp4' | 'webm' | 'gif'

export interface ExportSettingsInput {
  container?: ContainerName
  mode?: 'selective' | 'full'
  videoCodec?: 'avc' | 'vp9' | 'av1'
  quality?: 'low' | 'medium' | 'high'
  // null keeps the project frame.
  height?: number | null
  gifFps?: number
  resumable?: boolean
}

export interface ExportCase extends DataCase {
  source: string
  settings: ExportSettingsInput
  expect: {
    format: string
    frame: string
    mediaTag: 'video' | 'img'
    fileExt: string
    signature: 'webm' | 'mp4' | 'gif'
  }
}

export interface SegmentCase extends DataCase {
  value: string
  accepted: boolean
}
