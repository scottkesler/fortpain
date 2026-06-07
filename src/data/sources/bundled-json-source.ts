import rosterData from '../players.json';
import type { Player } from '../../types';
import type { RosterSource } from '../roster-source';

/**
 * Reads the roster from the JSON bundled into the build. The file is refreshed
 * offline by the ingestion script (see scripts/ingest-roster.mjs), so at
 * runtime this is a fast, synchronous read wrapped in the async contract.
 */
export const bundledJsonSource: RosterSource = {
  id: 'bundled-json',
  getRoster: async () => rosterData as Player[],
};
