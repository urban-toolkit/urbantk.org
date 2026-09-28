import fs from 'node:fs'
import path from 'node:path'
import writeXlsxFile from 'write-excel-file/node'
import type { Impact } from './impact'

export const IMPACT_SHEET = '/impact/urbantk-impact.xlsx'

// The table of /impact/ as a one-sheet spreadsheet: a row per metric, with the per-project rows indented
// under their metric. Empty cells are the ones the page shows as "Not available".
export async function writeImpactSheet(outDir: string, impact: Impact): Promise<void> {
  const number = (value: number | null) => (value === null ? null : { value, format: '#,##0' })
  const rows: any[][] = [
    [{ value: 'The Urban Toolkit: impact by award year', fontWeight: 'bold' }],
    [{ value: `Last updated ${impact.updated}. https://urbantk.org/impact/` }],
    [],
    ['Category', 'Metric', ...impact.years.map((y) => `${y.label}: ${y.period}`)].map((value) => ({ value, fontWeight: 'bold' })),
  ]
  for (const group of impact.groups) {
    group.rows.forEach((row, i) => {
      rows.push([i === 0 ? { value: group.label, fontWeight: 'bold' } : null, { value: row.label }, ...row.values.map(number)])
      for (const project of row.projects) rows.push([null, { value: project.name, indent: 1 }, ...project.values.map(number)])
      row.captions?.forEach((caption, year) => {
        if (caption) rows.push([null, { value: caption, indent: 1 }, ...row.values.map((v, j) => (j === year ? number(v) : null))])
      })
    })
  }

  const file = path.join(outDir, IMPACT_SHEET)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  await writeXlsxFile(rows, {
    sheet: 'Impact',
    columns: [{ width: 24 }, { width: 52 }, ...impact.years.map(() => ({ width: 30 }))],
    stickyRowsCount: 4,
  }).toFile(file)
}
