/** A single player as stored in the roster JSON data file. */
export interface Player {
  name: string;
  jersey_number: string;
  position: string;
  academic_year: string;
  hometown: string;
  /** Feet-inches as rolltide.com lists it (e.g. "6-1"); empty if unlisted. */
  height: string;
  /** Pounds (e.g. "216"); empty if unlisted. */
  weight: string;
  /**
   * Defensive-back sub-position (cornerback vs safety). rolltide.com codes all
   * DBs as "DB", so this is filled in from a manual override at ingest time and
   * is absent for non-DBs and for DBs no depth chart classifies.
   */
  db_role?: 'CB' | 'S';
}

/**
 * Columns that the roster table can be sorted by (the displayed columns).
 * Hometown, height, and weight live in the per-player Additional Info panel
 * rather than the table, so they are not sortable.
 */
export type SortableColumn =
  | 'name'
  | 'jersey_number'
  | 'position'
  | 'academic_year';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: SortableColumn;
  direction: SortDirection;
}
