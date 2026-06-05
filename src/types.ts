/** A single player as stored in the roster JSON data file. */
export interface Player {
  name: string;
  jersey_number: string;
  position: string;
  academic_year: string;
  hometown: string;
}

/** Columns that the roster table can be sorted by. */
export type SortableColumn = keyof Player;

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: SortableColumn;
  direction: SortDirection;
}
