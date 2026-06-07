import type { Player } from '../types';
import type { RosterSource } from './roster-source';
import { bundledJsonSource } from './sources/bundled-json-source';

/**
 * The roster data layer's single entry point. Components call `getRoster()`
 * and never import a source directly, so swapping or adding stores is a
 * one-line change here.
 *
 * To add a new store later (e.g. an HTTP API over SQLite/NoSQL), implement
 * {@link RosterSource} in `src/data/sources/` and assign it to `activeSource`
 * — no UI changes required.
 */
const activeSource: RosterSource = bundledJsonSource;

export function getRoster(): Promise<Player[]> {
  return activeSource.getRoster();
}
