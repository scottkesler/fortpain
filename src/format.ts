import type { Player } from './types';

/**
 * rolltide.com stores height as "feet-inches" ("6-1"). Render it the way it is
 * spoken and printed on a depth chart: 6'1".
 */
export function formatHeight(height: string): string {
  const match = height.match(/^(\d+)-(\d+)$/);
  if (!match) {
    return height;
  }
  return `${match[1]}'${match[2]}"`;
}

/** Height in total inches, for sorting. Unlisted heights sort as 0. */
export function heightInInches(height: string): number {
  const match = height.match(/^(\d+)-(\d+)$/);
  if (!match) {
    return 0;
  }
  return Number(match[1]) * 12 + Number(match[2]);
}

/** The combined Ht|Wt cell value, e.g. 6'1"|216. */
export function formatHeightWeight(player: Player): string {
  if (player.height === '' && player.weight === '') {
    return '—';
  }
  const height = player.height === '' ? '—' : formatHeight(player.height);
  const weight = player.weight === '' ? '—' : player.weight;
  return `${height}|${weight}`;
}

/**
 * A single sortable number for the combined column: height dominates and
 * weight breaks ties, which is how the two read together.
 */
export function heightWeightSortValue(player: Player): number {
  return heightInInches(player.height) * 1000 + Number(player.weight || 0);
}
