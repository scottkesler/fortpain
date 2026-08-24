import { useRef, useState } from 'react';
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

/** Stable per-player identity for React keys and the open-panel tracking. */
function playerKey(player: Player): string {
  return `${player.jersey_number}-${player.name}`;
}

/** Fall back to an em dash so an unlisted value still reads as a value. */
function orDash(value: string): string {
  return value === '' ? '—' : value;
}

function RosterTable({ players, sortState, onSort }: RosterTableProps) {
  // Only one Additional Info panel is open at a time: each panel slides over
  // its own row, so overlapping panels would be more noise than help.
  const [openPlayerKey, setOpenPlayerKey] = useState<string | null>(null);
  // The activation button of the open row, so closing the panel can hand focus
  // back to the control that opened it.
  const openToggleButtonRef = useRef<HTMLButtonElement | null>(null);

  if (players.length === 0) {
    return (
      <p className="roster-empty" role="status">
        No players match your search.
      </p>
    );
  }

  function togglePlayerPanel(key: string) {
    setOpenPlayerKey((previousKey) => (previousKey === key ? null : key));
  }

  function closePlayerPanel() {
    openToggleButtonRef.current?.focus();
    setOpenPlayerKey(null);
  }

  return (
    <table
      className="roster-table"
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Escape' && openPlayerKey !== null) {
          closePlayerPanel();
        }
      }}
    >
      <thead>
        <tr>
          {ROSTER_COLUMNS.map((column) => {
            const isSorted = sortState.column === column.key;
            return (
              <th
                key={column.key}
                data-column={column.key}
                aria-sort={isSorted ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
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
          <th data-column="info">
            <span className="visually-hidden">Additional info</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {players.map((player) => {
          const key = playerKey(player);
          const isOpen = key === openPlayerKey;
          const panelId = `player-info-${key.replace(/\W+/g, '-')}`;

          return (
            <tr key={key}>
              <td data-label="Name">{player.name}</td>
              <td data-label="Jersey #">{player.jersey_number}</td>
              <td data-label="Position">{player.position}</td>
              <td data-label="Academic Year">{player.academic_year}</td>
              <td className="roster-table__info-cell">
                <button
                  type="button"
                  className="roster-table__info-button"
                  ref={isOpen ? openToggleButtonRef : null}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => togglePlayerPanel(key)}
                >
                  <span aria-hidden="true">ⓘ</span>
                  <span className="visually-hidden">
                    Additional info for {player.name}
                  </span>
                </button>

                {/* Parked off the right edge of the table (which clips it) and
                    slid left into view when opened. */}
                <div
                  id={panelId}
                  className={
                    isOpen
                      ? 'player-info-panel player-info-panel--open'
                      : 'player-info-panel'
                  }
                  aria-hidden={!isOpen}
                >
                  <dl className="player-info-panel__list">
                    <div className="player-info-panel__item">
                      <dt>Hometown</dt>
                      <dd>{orDash(player.hometown)}</dd>
                    </div>
                    <div className="player-info-panel__item">
                      <dt>Height</dt>
                      <dd>{orDash(player.height)}</dd>
                    </div>
                    <div className="player-info-panel__item">
                      <dt>Weight</dt>
                      <dd>{player.weight === '' ? '—' : `${player.weight} lb`}</dd>
                    </div>
                  </dl>

                  {/* The open panel covers the activation button, so it carries
                      its own close control in that button's place. */}
                  <button
                    type="button"
                    className="player-info-panel__close"
                    onClick={closePlayerPanel}
                  >
                    <span aria-hidden="true">✕</span>
                    <span className="visually-hidden">
                      Close additional info for {player.name}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default RosterTable;
