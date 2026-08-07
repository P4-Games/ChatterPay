// ----------------------------------------------------------------------

/** Visual weight of a badge cell, mapped to a `Label` color in the table. */
export type FeeCellTone = 'success' | 'warning' | 'neutral' | 'info'

/**
 * A single table cell.
 * - `label`: the row name, translated from `fees.sections.<sectionId>.rows.<rowId>`
 * - `text` / `badge`: translated from `fees.values.<value>`
 * - `amount`: printed verbatim (numbers are locale-agnostic here)
 */
export type FeeCell =
  | { kind: 'label' }
  | { kind: 'text'; value: string }
  | { kind: 'amount'; value: string }
  | { kind: 'badge'; tone: FeeCellTone; value: string }

export type FeeRow = {
  id: string
  /** Network mark shown next to the row label. Cardano is missing from LiFi, hence the absolute URLs. */
  logo?: string
  cells: FeeCell[]
}

export type FeeSection = {
  id: string
  /** Iconify name; ignored when `iconImage` is set. */
  icon?: string
  /** Public asset path, for brands that need their own mark instead of an icon. */
  iconImage?: string
  /** Translated from `fees.columns.<column>`; length must match every row's cells. */
  columns: string[]
  rows: FeeRow[]
  /** Translated from `fees.sections.<sectionId>.notes.<note>`. */
  notes?: string[]
}

export type FeesContent = {
  /** Local-time ISO date: a bare `YYYY-MM-DD` is parsed as UTC and shifts a day back west of Greenwich. */
  lastUpdated: string
  sections: FeeSection[]
  /** Translated from `fees.disclaimer.items.<item>`. */
  disclaimer: string[]
}
