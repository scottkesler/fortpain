import type { DepthAssignment, DepthChart, Player, RosterRow } from './types';

/**
 * Which depth-chart unit each roster position code belongs to. A player is
 * ranked within their own unit first, so a starting receiver who is also the
 * backup kick returner shows their receiver depth rather than their return
 * depth.
 */
const UNIT_BY_POSITION: Record<string, string> = {
  QB: 'offense',
  RB: 'offense',
  WR: 'offense',
  TE: 'offense',
  OL: 'offense',
  DL: 'defense',
  LB: 'defense',
  DB: 'defense',
  PK: 'special-teams',
  P: 'special-teams',
  SN: 'special-teams',
};

/**
 * Every depth-chart appearance, keyed by player name. A player can appear in
 * more than one slot (a corner who also returns punts, a punter who holds).
 */
export function indexAssignmentsByPlayer(
  chart: DepthChart,
): Map<string, DepthAssignment[]> {
  const assignmentsByPlayer = new Map<string, DepthAssignment[]>();

  for (const unit of chart.units) {
    for (const slot of unit.slots) {
      slot.players.forEach((playerName, slotIndex) => {
        const assignment: DepthAssignment = {
          unitId: unit.id,
          slotCode: slot.code,
          slotLabel: slot.label,
          rank: slotIndex + 1,
        };
        const existing = assignmentsByPlayer.get(playerName);
        if (existing) {
          existing.push(assignment);
        } else {
          assignmentsByPlayer.set(playerName, [assignment]);
        }
      });
    }
  }

  return assignmentsByPlayer;
}

/** The appearance that best represents a player's depth, or null if unlisted. */
function primaryAssignment(
  player: Player,
  assignments: DepthAssignment[] | undefined,
): DepthAssignment | null {
  if (!assignments || assignments.length === 0) {
    return null;
  }

  const ownUnitId = UNIT_BY_POSITION[player.position];
  const ownUnitAssignments = assignments.filter(
    (assignment) => assignment.unitId === ownUnitId,
  );
  const candidates =
    ownUnitAssignments.length > 0 ? ownUnitAssignments : assignments;

  // Highest on the chart wins; ties keep the order slots are declared in.
  return candidates.reduce((best, candidate) =>
    candidate.rank < best.rank ? candidate : best,
  );
}

/** Attach each player's depth-chart standing to their roster record. */
export function joinRosterToDepthChart(
  players: Player[],
  chart: DepthChart,
): RosterRow[] {
  const assignmentsByPlayer = indexAssignmentsByPlayer(chart);
  return players.map((player) => ({
    ...player,
    depth: primaryAssignment(player, assignmentsByPlayer.get(player.name)),
  }));
}

/** "1st", "2nd", "3rd", "4th"… for describing a depth rank in prose. */
export function ordinal(rank: number): string {
  const lastTwoDigits = rank % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${rank}th`;
  }
  const suffixes = ['th', 'st', 'nd', 'rd'];
  return `${rank}${suffixes[rank % 10] ?? 'th'}`;
}
