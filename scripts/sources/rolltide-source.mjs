// Ingestion source for the Alabama football roster.
//
// rolltide.com is a Nuxt site that embeds its page data as a devalue-encoded
// payload inside <script id="__NUXT_DATA__"> — a flat array where each object's
// field values are *indices* into that same array (string dedup). This module
// fetches the page, resolves the relevant player fields, and normalizes them to
// the roster Player shape:
// { name, jersey_number, position, academic_year, hometown, height, weight }.
//
// This runs in Node as an offline ingestion step (not in the browser), because
// the page is large and cross-origin. It conceptually implements the same
// RosterSource contract as the runtime sources in src/data/.

const ROSTER_URL = 'https://rolltide.com/sports/football/roster';

// A player object in the payload is identified by carrying all of these keys.
const REQUIRED_KEYS = ['firstName', 'lastName', 'jerseyNumber', 'positionShort'];

export async function fetchRollTideRoster() {
  const response = await fetch(ROSTER_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (fortpain roster ingester)' },
  });
  if (!response.ok) {
    throw new Error(`rolltide.com returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const payload = extractNuxtData(html);
  const players = parsePlayers(payload);

  if (players.length === 0) {
    throw new Error(
      'Parsed 0 players — the rolltide.com page structure has likely changed.',
    );
  }
  return players;
}

function extractNuxtData(html) {
  const match = html.match(
    /<script type="application\/json"[^>]*id="__NUXT_DATA__"[^>]*>(.*?)<\/script>/s,
  );
  if (!match) {
    throw new Error('Could not find the __NUXT_DATA__ payload in the page.');
  }
  return JSON.parse(match[1]);
}

function parsePlayers(payloadArray) {
  // Follow an index reference to its underlying value (one hop suffices for the
  // scalar fields we need; guarded against bad/cyclic refs).
  const resolve = (reference, depth = 0) => {
    if (
      typeof reference !== 'number' ||
      reference < 0 ||
      reference >= payloadArray.length ||
      depth > 8
    ) {
      return reference;
    }
    const value = payloadArray[reference];
    return typeof value === 'number' ? resolve(value, depth + 1) : value;
  };

  const resolveString = (reference) => {
    const value = resolve(reference);
    return value == null ? '' : String(value).trim();
  };

  // Numeric fields (height, weight) must resolve with exactly one hop: the
  // payload slot holds the number itself, and following it again would read it
  // as another index and return an unrelated entry.
  const resolveNumber = (reference) => {
    if (
      typeof reference !== 'number' ||
      reference < 0 ||
      reference >= payloadArray.length
    ) {
      return null;
    }
    const value = payloadArray[reference];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  };

  // rolltide stores height as separate feet/inches numbers; the site renders
  // them as feet-inches (6-1). Players with no listed height get an empty string.
  const resolveHeight = (entry) => {
    const feet = resolveNumber(entry.heightFeet);
    if (feet === null || feet <= 0) {
      return '';
    }
    const inches = resolveNumber(entry.heightInches) ?? 0;
    return `${feet}-${inches}`;
  };

  const players = [];
  for (const entry of payloadArray) {
    const isPlayer =
      entry &&
      typeof entry === 'object' &&
      !Array.isArray(entry) &&
      REQUIRED_KEYS.every((key) => key in entry);
    if (!isPlayer) {
      continue;
    }

    const firstName = resolveString(entry.firstName);
    const lastName = resolveString(entry.lastName);
    const name = `${firstName} ${lastName}`.trim();
    const position = resolveString(entry.positionShort);

    if (!name || !position) {
      continue;
    }

    const weight = resolveNumber(entry.weight);

    players.push({
      name,
      jersey_number: resolveString(entry.jerseyNumber),
      position,
      academic_year: resolveString(entry.academicYearShort),
      hometown: resolveString(entry.hometown),
      height: resolveHeight(entry),
      weight: weight === null || weight <= 0 ? '' : String(weight),
    });
  }

  // Deterministic ordering keeps the committed JSON diff-friendly.
  players.sort(
    (first, second) =>
      Number(first.jersey_number) - Number(second.jersey_number) ||
      first.name.localeCompare(second.name),
  );
  return players;
}
