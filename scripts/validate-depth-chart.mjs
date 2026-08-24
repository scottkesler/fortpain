#!/usr/bin/env node
// Checks the hand-maintained weekly depth chart against the scraped roster.
//
//   npm run validate:depth
//
// Run this after every weekly edit to src/data/depth-chart.json. Names there
// must match src/data/players.json exactly — a typo or a stale name silently
// leaves a player off the roster page's Depth column, so this fails loudly
// instead.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rosterPath = resolve(scriptDir, '../src/data/players.json');
const depthChartPath = resolve(scriptDir, '../src/data/depth-chart.json');

const players = JSON.parse(readFileSync(rosterPath, 'utf8'));
const depthChart = JSON.parse(readFileSync(depthChartPath, 'utf8'));

const rosterNames = new Set(players.map((player) => player.name));
const chartedNames = new Set();
const unknownNames = [];
let slotCount = 0;

for (const unit of depthChart.units) {
  for (const slot of unit.slots) {
    slotCount += 1;
    if (slot.players.length === 0) {
      unknownNames.push(`${unit.label} / ${slot.code}: no players listed`);
    }
    for (const name of slot.players) {
      chartedNames.add(name);
      if (!rosterNames.has(name)) {
        unknownNames.push(`${unit.label} / ${slot.code}: "${name}"`);
      }
    }
  }
}

console.log(
  `Depth chart: ${slotCount} positions, ${chartedNames.size} players (roster has ${players.length}).`,
);

const unlisted = players.filter((player) => !chartedNames.has(player.name));
console.log(`${unlisted.length} roster players are not on the chart (reserves).`);

if (unknownNames.length > 0) {
  console.error(`\n${unknownNames.length} problem(s) — these names are not on the roster:`);
  for (const problem of unknownNames) {
    console.error(`  ${problem}`);
  }
  console.error('\nFix the spelling in src/data/depth-chart.json to match players.json.');
  process.exitCode = 1;
} else {
  console.log('All depth chart names match the roster.');
}
