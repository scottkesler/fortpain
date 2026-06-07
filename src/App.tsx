import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { ROSTER_COLUMNS } from './columns';
import { ALL_PLAYERS_GROUP_ID, playerInGroup } from './groups';
import { getRoster } from './data/roster-service';
import type { Player, SortableColumn, SortState } from './types';
import SearchBar from './components/SearchBar';
import GroupFilter from './components/GroupFilter';
import RosterTable from './components/RosterTable';
import './App.css';

type LoadStatus = 'loading' | 'ready' | 'error';

const numericColumns = new Set<SortableColumn>(
  ROSTER_COLUMNS.filter((column) => column.numeric).map((column) => column.key),
);

/** Compare two players on the active sort column, respecting numeric columns. */
function comparePlayers(
  firstPlayer: Player,
  secondPlayer: Player,
  sortState: SortState,
): number {
  const { column, direction } = sortState;
  const firstValue = firstPlayer[column];
  const secondValue = secondPlayer[column];

  let comparison: number;
  if (numericColumns.has(column)) {
    comparison = Number(firstValue) - Number(secondValue);
  } else {
    comparison = firstValue.localeCompare(secondValue);
  }

  return direction === 'asc' ? comparison : -comparison;
}

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(ALL_PLAYERS_GROUP_ID);
  const [sortState, setSortState] = useState<SortState>({
    column: 'jersey_number',
    direction: 'asc',
  });

  useEffect(() => {
    let isActive = true;
    getRoster()
      .then((loadedPlayers) => {
        if (isActive) {
          setPlayers(loadedPlayers);
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
      new Fuse(players, {
        keys: ['name', 'jersey_number', 'position'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [players],
  );

  const visiblePlayers = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    const searchedPlayers =
      trimmedQuery === ''
        ? players
        : playerSearchIndex.search(trimmedQuery).map((result) => result.item);
    const matchingPlayers = searchedPlayers.filter((player) =>
      playerInGroup(player, selectedGroupId),
    );
    return [...matchingPlayers].sort((firstPlayer, secondPlayer) =>
      comparePlayers(firstPlayer, secondPlayer, sortState),
    );
  }, [players, playerSearchIndex, searchQuery, selectedGroupId, sortState]);

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
            ? `${visiblePlayers.length} of ${players.length} players`
            : ' '}
        </p>
      </header>

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
            players={visiblePlayers}
            sortState={sortState}
            onSort={handleSort}
          />
        </>
      )}
    </div>
  );
}

export default App;
