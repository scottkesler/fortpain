#!/usr/bin/env node
// Offline ingestion: pull the latest Alabama roster from rolltide.com and write
// it to src/data/players.json (the file the app bundles at build time).
//
//   npm run ingest:alabama
//
// After running, rebuild and redeploy to publish the updated roster.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fetchRollTideRoster } from './sources/rolltide-source.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDir, '../src/data/players.json');
const dbOverridesPath = resolve(scriptDir, 'overrides/alabama-db-positions.json');

// Merge the manual cornerback/safety designations onto scraped DBs (rolltide
// only codes "DB"). Returns how many were classified, for the run summary.
function applyDbRoleOverrides(players) {
  const { roles } = JSON.parse(readFileSync(dbOverridesPath, 'utf8'));
  let classified = 0;
  for (const player of players) {
    if (player.position === 'DB' && roles[player.name]) {
      player.db_role = roles[player.name];
      classified += 1;
    }
  }
  const totalDbs = players.filter((player) => player.position === 'DB').length;
  return { classified, totalDbs };
}

try {
  const previousCount = existsSync(outputPath)
    ? JSON.parse(readFileSync(outputPath, 'utf8')).length
    : 0;

  const players = await fetchRollTideRoster();
  const { classified, totalDbs } = applyDbRoleOverrides(players);
  writeFileSync(outputPath, `${JSON.stringify(players, null, 2)}\n`);

  console.log(
    `Wrote ${players.length} players to src/data/players.json (was ${previousCount}).`,
  );
  console.log(
    `Classified ${classified} of ${totalDbs} DBs as CB/S (rest remain generic DB).`,
  );
} catch (error) {
  console.error(`Roster ingestion failed: ${error.message}`);
  console.error('Existing players.json was left unchanged.');
  process.exitCode = 1;
}
