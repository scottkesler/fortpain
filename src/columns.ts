import type { SortableColumn } from './types';

export interface ColumnDefinition {
  key: SortableColumn;
  label: string;
  /** Numeric columns sort by parsed number rather than string comparison. */
  numeric: boolean;
}

export const ROSTER_COLUMNS: ColumnDefinition[] = [
  { key: 'name', label: 'Name', numeric: false },
  { key: 'jersey_number', label: 'Jersey #', numeric: true },
  { key: 'position', label: 'Position', numeric: false },
  { key: 'academic_year', label: 'Academic Year', numeric: false },
];
