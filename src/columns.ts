import { heightWeightSortValue } from './format';
import type { RosterRow, SortableColumn } from './types';

export interface ColumnDefinition {
  key: SortableColumn;
  label: string;
  /**
   * Abbreviated heading used on phones. Full headings are what set the table's
   * minimum width, and spelled out they push it past a phone screen.
   */
  shortLabel: string;
  /** Numeric columns sort by number rather than string comparison. */
  numeric: boolean;
  /**
   * The value this column sorts on. Most columns read a player field straight
   * off the row, but Ht|Wt and Depth are derived and compute theirs.
   */
  sortValue: (row: RosterRow) => string | number;
}

/** Players off the depth chart sort below every ranked player. */
const UNRANKED_SORT_VALUE = Number.MAX_SAFE_INTEGER;

export const ROSTER_COLUMNS: ColumnDefinition[] = [
  {
    key: 'name',
    label: 'Name',
    shortLabel: 'Name',
    numeric: false,
    sortValue: (row) => row.name,
  },
  {
    key: 'jersey_number',
    label: 'Jersey #',
    shortLabel: '#',
    numeric: true,
    sortValue: (row) => Number(row.jersey_number),
  },
  {
    key: 'position',
    label: 'Position',
    shortLabel: 'Pos',
    numeric: false,
    sortValue: (row) => row.position,
  },
  {
    key: 'depth',
    label: 'Depth',
    shortLabel: 'Dep',
    numeric: true,
    sortValue: (row) => row.depth?.rank ?? UNRANKED_SORT_VALUE,
  },
  {
    key: 'academic_year',
    label: 'Year',
    shortLabel: 'Yr',
    numeric: false,
    sortValue: (row) => row.academic_year,
  },
  {
    key: 'ht_wt',
    label: 'Ht|Wt',
    shortLabel: 'Ht|Wt',
    numeric: true,
    sortValue: heightWeightSortValue,
  },
];
