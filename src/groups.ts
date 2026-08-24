import type { Player } from './types';

/**
 * The side of the ball a group belongs to. The filter renders one row of
 * buttons per unit, in this order.
 */
export type PersonnelUnit = 'offense' | 'defense' | 'other';

export const PERSONNEL_UNIT_ORDER: PersonnelUnit[] = [
  'offense',
  'defense',
  'other',
];

/**
 * A personnel grouping that filters the roster. Each group decides membership
 * with a predicate, so most groups match on position code while Corners and
 * Safeties match on the defensive-back sub-position (`db_role`).
 */
export interface PersonnelGroup {
  id: string;
  label: string;
  unit: PersonnelUnit;
  matches: (player: Player) => boolean;
}

// Position codes present in the data: DB, OL, LB, WR, DL, TE, RB, QB, PK, SN, P.
const inPositions =
  (...codes: string[]) =>
  (player: Player) =>
    codes.includes(player.position);

export const ALL_PLAYERS_GROUP_ID = 'all';

export const PERSONNEL_GROUPS: PersonnelGroup[] = [
  { id: 'offense', label: 'Offense', unit: 'offense', matches: inPositions('QB', 'RB', 'WR', 'TE', 'OL') },
  { id: 'offensive-line', label: 'Offensive Line', unit: 'offense', matches: inPositions('OL') },
  { id: 'quarterbacks', label: 'Quarterbacks', unit: 'offense', matches: inPositions('QB') },
  { id: 'running-backs', label: 'Running Backs', unit: 'offense', matches: inPositions('RB') },
  { id: 'receivers', label: 'Receivers', unit: 'offense', matches: inPositions('WR') },
  { id: 'tight-ends', label: 'Tight Ends', unit: 'offense', matches: inPositions('TE') },
  { id: 'skills-group', label: 'Skills Group', unit: 'offense', matches: inPositions('RB', 'WR', 'TE') },

  { id: 'defense', label: 'Defense', unit: 'defense', matches: inPositions('DL', 'LB', 'DB') },
  { id: 'defensive-line', label: 'Defensive Line', unit: 'defense', matches: inPositions('DL') },
  { id: 'linebackers', label: 'Linebackers', unit: 'defense', matches: inPositions('LB') },
  { id: 'defensive-backs', label: 'Defensive Backs', unit: 'defense', matches: inPositions('DB') },
  // Corners/Safeties rely on the manual db_role override; DBs without one
  // appear under Defensive Backs but in neither of these.
  { id: 'corners', label: 'Corners', unit: 'defense', matches: (player) => player.db_role === 'CB' },
  { id: 'safeties', label: 'Safeties', unit: 'defense', matches: (player) => player.db_role === 'S' },

  { id: ALL_PLAYERS_GROUP_ID, label: 'All Players', unit: 'other', matches: () => true },
  { id: 'special-teams', label: 'Special Teams', unit: 'other', matches: inPositions('PK', 'P', 'SN') },
];

/** The groups belonging to one unit, in declaration order (one button row). */
export function groupsInUnit(unit: PersonnelUnit): PersonnelGroup[] {
  return PERSONNEL_GROUPS.filter((group) => group.unit === unit);
}

const groupsById = new Map(PERSONNEL_GROUPS.map((group) => [group.id, group]));

/** Whether a player belongs to the personnel group with the given id. */
export function playerInGroup(player: Player, groupId: string): boolean {
  const group = groupsById.get(groupId);
  return group ? group.matches(player) : true;
}
