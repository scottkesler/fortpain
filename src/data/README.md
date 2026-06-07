# Roster data layer

The app reads roster data only through `getRoster()` in `roster-service.ts`,
which delegates to a single configured `RosterSource`. The UI never imports a
data store directly, so stores can be swapped or added without touching
components.

```
roster-service.ts        getRoster() — the only entry point components use
roster-source.ts         RosterSource interface (the contract)
sources/
  bundled-json-source.ts  reads players.json bundled into the build (active)
players.json             the roster data (refreshed by ingestion, see below)
```

## Current design (YAGNI)

This is a static site (GitHub Pages, no server), so the only runtime source is
`bundled-json-source` — it reads `players.json` that ships in the build.

## Updating the data: rolltide.com ingestion

`players.json` is refreshed offline by an ingestion script that scrapes the
official roster. This runs in Node (not the browser — the page is large and
cross-origin):

```sh
npm run ingest:alabama   # fetch rolltide.com → rewrite src/data/players.json
```

Then rebuild and redeploy. The parser lives in `scripts/sources/rolltide-source.mjs`.

## Adding a new store later

To back the roster with, say, an HTTP API over SQLite or a NoSQL store:

1. Implement `RosterSource` in `sources/` (e.g. `http-source.ts` whose
   `getRoster()` does `fetch('/api/roster')`).
2. Point `activeSource` in `roster-service.ts` at it.

No component changes are required — they already consume the async contract,
including loading/error states.
