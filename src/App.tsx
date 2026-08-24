import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { ROSTER_COLUMNS } from './columns';
import { ALL_PLAYERS_GROUP_ID, playerInGroup } from './groups';
import { joinRosterToDepthChart } from './depth-chart';
import { getRoster } from './data/roster-service';
import { getDepthChart } from './data/depth-chart-service';
import type { RosterRow, SortableColumn, SortState } from './types';
import SearchBar from './components/SearchBar';
import GroupFilter from './components/GroupFilter';
import RosterTable from './components/RosterTable';
import './App.css';

type LoadStatus = 'loading' | 'ready' | 'error';

const columnsByKey = new Map(
  ROSTER_COLUMNS.map((column) => [column.key, column]),
);

/** Compare two rows on the active sort column, using that column's accessor. */
function compareRows(
  firstRow: RosterRow,
  secondRow: RosterRow,
  sortState: SortState,
): number {
  const { column, direction } = sortState;
  const definition = columnsByKey.get(column);
  if (!definition) {
    return 0;
  }

  const firstValue = definition.sortValue(firstRow);
  const secondValue = definition.sortValue(secondRow);

  const comparison = definition.numeric
    ? Number(firstValue) - Number(secondValue)
    : String(firstValue).localeCompare(String(secondValue));

  return direction === 'asc' ? comparison : -comparison;
}

function App() {
  const [rosterRows, setRosterRows] = useState<RosterRow[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(ALL_PLAYERS_GROUP_ID);
  const [sortState, setSortState] = useState<SortState>({
    column: 'jersey_number',
    direction: 'asc',
  });

  useEffect(() => {
    let isActive = true;
    Promise.all([getRoster(), getDepthChart()])
      .then(([loadedPlayers, depthChart]) => {
        if (isActive) {
          setRosterRows(joinRosterToDepthChart(loadedPlayers, depthChart));
          setLoadStatus('ready');
        }
      })
      .catch(() => {
        if (isActive) {
          setLoadStatus('error');
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  // Fuzzy search across name, jersey number, and position only. Rebuilt when
  // the roster loads; `ignoreLocation` lets a match occur anywhere in a field,
  // and the threshold allows for thumb-typed typos on mobile.
  const playerSearchIndex = useMemo(
    () =>
      new Fuse(rosterRows, {
        keys: ['name', 'jersey_number', 'position'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [rosterRows],
  );

  const visibleRows = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    const searchedRows =
      trimmedQuery === ''
        ? rosterRows
        : playerSearchIndex.search(trimmedQuery).map((result) => result.item);
    const matchingRows = searchedRows.filter((row) =>
      playerInGroup(row, selectedGroupId),
    );
    return [...matchingRows].sort((firstRow, secondRow) =>
      compareRows(firstRow, secondRow, sortState),
    );
  }, [rosterRows, playerSearchIndex, searchQuery, selectedGroupId, sortState]);

  function handleSort(column: SortableColumn) {
    setSortState((previousSortState) => {
      if (previousSortState.column === column) {
        return {
          column,
          direction: previousSortState.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { column, direction: 'asc' };
    });
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Alabama Roster</h1>
        <p className="app__count">
          {loadStatus === 'ready'
            ? `${visibleRows.length} of ${rosterRows.length} players`
            : ' '}
        </p>
      </header>

      <nav className="app__nav">
        <a className="app__nav-link" href="/alabama/depth-chart/">
          AL Depth Chart
        </a>
        <a className="app__nav-link" href="/alabama/schedule/">
          AL Schedule
        </a>
        <a className="app__nav-link" href="/alabama/sec-schedule/">
          Full SEC Schedule
        </a>
      </nav>

      {loadStatus === 'loading' ? (
        <p className="roster-empty" role="status">
          Loading roster…
        </p>
      ) : loadStatus === 'error' ? (
        <p className="roster-empty" role="alert">
          Couldn’t load the roster. Please try again later.
        </p>
      ) : (
        <>
          <div className="app__controls">
            <GroupFilter value={selectedGroupId} onChange={setSelectedGroupId} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <RosterTable
            rows={visibleRows}
            sortState={sortState}
            onSort={handleSort}
          />
        </>
      )}
    </div>
  );
}

export default App;
