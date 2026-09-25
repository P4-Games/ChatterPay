// ----------------------------------------------------------------------

/** Visual weight of a badge cell, mapped to a `Label` color in the table. */
export type FeeCellTone = 'success' | 'warning' | 'neutral' | 'info'

/**
 * A single table cell.
 * - `label`: the row name, translated from the block's rows key
 * - `text` / `badge`: translated from `fees.values.<value>`
 * - `amount`: printed verbatim (numbers are locale-agnostic here), with an optional
 *   qualifier under it, translated from `fees.values.<note>`
 */
export type FeeCell =
  | { kind: 'label' }
  | { kind: 'text'; value: string }
  | { kind: 'amount'; value: string; note?: string }
  | { kind: 'badge'; tone: FeeCellTone; value: string }

export type FeeRow = {
  id: string
  cells: FeeCell[]
}

/** A block that is one table: `fees.sections.<id>.rows.<rowId>` names its rows. */
export type FeeTableSection = {
  kind?: 'table'
  id: string
  /** Iconify name; ignored when `iconImage` is set. */
  icon?: string
  /** Public asset path, for brands that need their own mark instead of an icon. */
  iconImage?: string
  /** Translated from `fees.columns.<column>`; length must match every row's cells. */
  columns: string[]
  rows: FeeRow[]
  /** Translated from `fees.sections.<id>.notes.<note>`. */
  notes?: string[]
}

/**
 * One network inside the networks block, named by `fees.sections.networks.tabs.<id>.name`.
 * A network with no fees to publish yet carries no `rows`, and its panel shows the `status`
 * badge over `fees.sections.networks.tabs.<id>.empty` instead of an empty table.
 */
export type FeeNetworkTab = {
  id: string
  /** Network mark shown on the tab. Cardano is missing from LiFi, hence the local asset. */
  logo?: string
  /** Availability printed on the tab, translated from `fees.values.<value>`. */
  status: { tone: FeeCellTone; value: string }
  /** Translated from `fees.columns.<column>`; length must match every row's cells. */
  columns?: string[]
  rows?: FeeRow[]
  /** Translated from `fees.sections.networks.tabs.<id>.notes.<note>`. */
  notes?: string[]
}

/** The networks block: one tab per blockchain, the first one being the one that opens. */
export type FeeNetworksSection = {
  kind: 'networks'
  id: string
  icon?: string
  iconImage?: string
  tabs: FeeNetworkTab[]
}

export type FeeSection = FeeTableSection | FeeNetworksSection

export type FeesContent = {
  /** Local-time ISO date: a bare `YYYY-MM-DD` is parsed as UTC and shifts a day back west of Greenwich. */
  lastUpdated: string
  sections: FeeSection[]
  /** Translated from `fees.disclaimer.items.<item>`. */
  disclaimer: string[]
}
