import { ROSTER_COLUMNS } from '../columns';
import type { Player, SortableColumn, SortState } from '../types';

interface RosterTableProps {
  players: Player[];
  sortState: SortState;
  onSort: (column: SortableColumn) => void;
}

function sortIndicator(
  columnKey: SortableColumn,
  sortState: SortState,
): string {
  if (sortState.column !== columnKey) {
    return '';
  }
  return sortState.direction === 'asc' ? ' ▲' : ' ▼';
}

function RosterTable({ players, sortState, onSort }: RosterTableProps) {
  if (players.length === 0) {
    return (
      <p className="roster-empty" role="status">
        No players match your search.
      </p>
    );
  }

  return (
    <table className="roster-table">
      <thead>
        <tr>
          {ROSTER_COLUMNS.map((column) => {
            const isSorted = sortState.column === column.key;
            return (
              <th key={column.key} aria-sort={isSorted ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  type="button"
                  className="roster-table__sort-button"
                  onClick={() => onSort(column.key)}
                >
                  {column.label}
                  {sortIndicator(column.key, sortState)}
                </button>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {players.map((player) => (
          <tr key={`${player.jersey_number}-${player.name}`}>
            <td>{player.name}</td>
            <td>{player.jersey_number}</td>
            <td>{player.position}</td>
            <td>{player.academic_year}</td>
            <td>{player.hometown}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RosterTable;
