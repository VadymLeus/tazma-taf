// Layer 1 (Test Scripts). TC-IMP: importing files into the media library (data-driven).
import { casesOf, loadDataset } from '../src/testdata/provider.ts'
import type { ImportCase } from '../src/testdata/types.ts'
import { expect, test } from '../src/business/fixtures.ts'

const dataset = loadDataset<ImportCase>('import-files')

for (const set of ['valid', 'boundary', 'invalid'] as const) {
  for (const c of casesOf(dataset, set)) {
    test(`TC-IMP ${c.id} [${set}]: ${c.title}`, { tag: ['@ddt', '@import', ...(c.tags ?? [])] }, async ({ app, media, diagnostics }) => {
      // Precondition: the application is open and the library is empty.
      await app.open()
      await app.editor.expectLibrarySize(0)

      await app.editor.importFiles(c.files.map((file) => media.resolve(file)))

      // Postconditions: exactly the expected files in the library, exactly the expected errors.
      await app.editor.expectLibrarySize(c.expect.library.length)
      for (const item of c.expect.library) await app.editor.expectInLibrary(item.fileName, item.meta)
      for (const fileName of c.expect.errors) await app.editor.expectErrorFor(fileName)
      if (c.expect.errors.length === 0) await app.editor.expectNoErrors()
      expect(await app.editor.importErrors()).toHaveLength(c.expect.errors.length)
      expect(diagnostics.pageErrors, 'uncaught page errors').toEqual([])
    })
  }
}
