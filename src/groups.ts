import type { Player } from './types';

/**
 * A personnel grouping that filters the roster by player position.
 * `positions` is null for the "all players" option; otherwise it is the set
 * of position codes that belong to the group.
 */
export interface PersonnelGroup {
  id: string;
  label: string;
  positions: ReadonlySet<string> | null;
}

// Position-code building blocks (the codes actually present in the data are:
// DB, OL, LB, WR, DL, TE, RB, QB, PK, SN, P). The roster has no CB/S split,
// so Corners and Safeties both map to all defensive backs (DB).
const OFFENSE_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL'];
const DEFENSE_POSITIONS = ['DL', 'LB', 'DB'];
const SKILL_POSITIONS = ['RB', 'WR', 'TE'];
const SPECIAL_TEAMS_POSITIONS = ['PK', 'P', 'SN'];

export const ALL_PLAYERS_GROUP_ID = 'all';

export const PERSONNEL_GROUPS: PersonnelGroup[] = [
  { id: ALL_PLAYERS_GROUP_ID, label: 'All Players', positions: null },

  { id: 'offense', label: 'Offense', positions: new Set(OFFENSE_POSITIONS) },
  { id: 'offensive-line', label: 'Offensive Line', positions: new Set(['OL']) },
  { id: 'quarterbacks', label: 'Quarterbacks', positions: new Set(['QB']) },
  { id: 'running-backs', label: 'Running Backs', positions: new Set(['RB']) },
  { id: 'receivers', label: 'Receivers', positions: new Set(['WR']) },
  { id: 'tight-ends', label: 'Tight Ends', positions: new Set(['TE']) },
  { id: 'skills-group', label: 'Skills Group', positions: new Set(SKILL_POSITIONS) },

  { id: 'defense', label: 'Defense', positions: new Set(DEFENSE_POSITIONS) },
  { id: 'defensive-line', label: 'Defensive Line', positions: new Set(['DL']) },
  { id: 'linebackers', label: 'Linebackers', positions: new Set(['LB']) },
  { id: 'defensive-backs', label: 'Defensive Backs', positions: new Set(['DB']) },
  { id: 'corners', label: 'Corners', positions: new Set(['DB']) },
  { id: 'safeties', label: 'Safeties', positions: new Set(['DB']) },

  { id: 'special-teams', label: 'Special Teams', positions: new Set(SPECIAL_TEAMS_POSITIONS) },
];

const groupsById = new Map(PERSONNEL_GROUPS.map((group) => [group.id, group]));

/** Whether a player belongs to the personnel group with the given id. */
export function playerInGroup(player: Player, groupId: string): boolean {
  const group = groupsById.get(groupId);
  if (!group || group.positions === null) {
    return true;
  }
  return group.positions.has(player.position);
}
