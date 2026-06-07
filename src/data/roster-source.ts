import type { Player } from '../types';

/**
 * A source of roster data. The app talks to roster data only through this
 * contract, so the backing store can change without touching the UI.
 *
 * Today the only runtime implementation is {@link bundledJsonSource}, which
 * reads the JSON bundled into the build. As the project grows, new stores slot
 * in behind this same interface — for example an HTTP source backed by a
 * SQLite or NoSQL database — without changing any consumer.
 */
export interface RosterSource {
  /** Stable identifier, useful for logging / debugging which source is active. */
  readonly id: string;
  /** Resolve the full roster. */
  getRoster(): Promise<Player[]>;
}
