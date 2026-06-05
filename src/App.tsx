import { useMemo, useState } from 'react';
import rosterData from './data/players.json';
import { ROSTER_COLUMNS } from './columns';
import type { Player, SortableColumn, SortState } from './types';
import SearchBar from './components/SearchBar';
import RosterTable from './components/RosterTable';
import './App.css';

const allPlayers = rosterData as Player[];

const numericColumns = new Set<SortableColumn>(
  ROSTER_COLUMNS.filter((column) => column.numeric).map((column) => column.key),
);

/** Case-insensitive substring match across every field of a player. */
function playerMatchesQuery(player: Player, normalizedQuery: string): boolean {
  if (normalizedQuery === '') {
    return true;
  }
  return Object.values(player).some((fieldValue) =>
    fieldValue.toLowerCase().includes(normalizedQuery),
  );
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({
    column: 'jersey_number',
    direction: 'asc',
  });

  const visiblePlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchingPlayers = allPlayers.filter((player) =>
      playerMatchesQuery(player, normalizedQuery),
    );
    return [...matchingPlayers].sort((firstPlayer, secondPlayer) =>
      comparePlayers(firstPlayer, secondPlayer, sortState),
    );
  }, [searchQuery, sortState]);

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
          {visiblePlayers.length} of {allPlayers.length} players
        </p>
      </header>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <RosterTable
        players={visiblePlayers}
        sortState={sortState}
        onSort={handleSort}
      />
    </div>
  );
}

export default App;
