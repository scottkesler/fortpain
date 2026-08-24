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

/** One position on the depth chart, with its players ordered starter-first. */
export interface DepthSlot {
  /** Short code shown in the Pos column (e.g. "WR-X", "MLB"). */
  code: string;
  /** Spelled-out position (e.g. "Middle Linebacker"). */
  label: string;
  /** Player names, in depth order. Must match roster names exactly. */
  players: string[];
}

/** A side of the ball: one section of the depth chart page. */
export interface DepthUnit {
  id: string;
  label: string;
  /** Scheme shown beside the unit heading (e.g. "4-2-5"); null for none. */
  scheme: string | null;
  slots: DepthSlot[];
}

/** The weekly depth chart as stored in depth-chart.json. */
export interface DepthChart {
  /** Upcoming opponent, or null before one is set for the week. */
  opponent: string | null;
  /** ISO date the chart was last revised. */
  updated: string;
  units: DepthUnit[];
}

/** Where a player sits on the depth chart, resolved for the roster table. */
export interface DepthAssignment {
  unitId: string;
  slotCode: string;
  slotLabel: string;
  /** 1 = starter, 2 = second string, and so on. */
  rank: number;
}

/**
 * A roster player joined to their spot on the current depth chart. This is the
 * row shape the roster table renders; `depth` is null for players who are not
 * on the chart this week.
 */
export interface RosterRow extends Player {
  depth: DepthAssignment | null;
}

/**
 * Columns the roster table can be sorted by. `ht_wt` and `depth` are derived
 * rather than raw player fields, so columns carry their own sort accessor
 * (see columns.ts). Hometown lives in the Additional Info panel.
 */
export type SortableColumn =
  | 'name'
  | 'jersey_number'
  | 'position'
  | 'academic_year'
  | 'ht_wt'
  | 'depth';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: SortableColumn;
  direction: SortDirection;
}

/** One game on the schedule, as stored in schedule.json. */
export interface ScheduleGame {
  /** ISO date, e.g. "2026-09-05". */
  date: string;
  opponent: string;
  location: 'home' | 'away';
  /** Kickoff time, e.g. "12:00 PM ET"; null while TBD. */
  time: string | null;
  /** Broadcast network, e.g. "ABC"; null until the SEC/ESPN assign one. */
  tv: string | null;
}

/** A season's full schedule as stored in schedule.json. */
export interface Schedule {
  season: number;
  games: ScheduleGame[];
}
