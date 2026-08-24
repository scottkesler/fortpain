import { useRef, useState } from 'react';
import { ROSTER_COLUMNS } from '../columns';
import { formatHeightWeight } from '../format';
import { ordinal } from '../depth-chart';
import type { RosterRow, SortableColumn, SortState } from '../types';

interface RosterTableProps {
  rows: RosterRow[];
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
function rowKey(row: RosterRow): string {
  return `${row.jersey_number}-${row.name}`;
}

/** Fall back to an em dash so an unlisted value still reads as a value. */
function orDash(value: string): string {
  return value === '' ? '—' : value;
}

/** "WR-H · 1st" — compact enough for the Additional Info panel's single line. */
function depthSummary(row: RosterRow): string {
  if (!row.depth) {
    return 'Not on chart';
  }
  return `${row.depth.slotCode} · ${ordinal(row.depth.rank)}`;
}

/** The spelled-out standing, for the rank cell's tooltip. */
function depthTitle(row: RosterRow): string {
  if (!row.depth) {
    return 'Not on this week’s depth chart';
  }
  return `${row.depth.slotLabel} (${row.depth.slotCode}), ${ordinal(row.depth.rank)} string`;
}

function RosterTable({ rows, sortState, onSort }: RosterTableProps) {
  // Only one Additional Info panel is open at a time: each panel slides over
  // its own row, so overlapping panels would be more noise than help.
  const [openRowKey, setOpenRowKey] = useState<string | null>(null);
  // The activation button of the open row, so closing the panel can hand focus
  // back to the control that opened it.
  const openToggleButtonRef = useRef<HTMLButtonElement | null>(null);

  if (rows.length === 0) {
    return (
      <p className="roster-empty" role="status">
        No players match your search.
      </p>
    );
  }

  function toggleRowPanel(key: string) {
    setOpenRowKey((previousKey) => (previousKey === key ? null : key));
  }

  function closeRowPanel() {
    openToggleButtonRef.current?.focus();
    setOpenRowKey(null);
  }

  return (
    <table
      className="roster-table"
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Escape' && openRowKey !== null) {
          closeRowPanel();
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
                  {/* The full heading is always the accessible name; phones
                      show the abbreviation in its place. */}
                  <span className="roster-table__label">{column.label}</span>
                  <span className="roster-table__label-short" aria-hidden="true">
                    {column.shortLabel}
                  </span>
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
        {rows.map((row) => {
          const key = rowKey(row);
          const isOpen = key === openRowKey;
          const panelId = `player-info-${key.replace(/\W+/g, '-')}`;

          return (
            <tr key={key}>
              <td data-label="Name">{row.name}</td>
              <td data-label="Jersey #">{row.jersey_number}</td>
              <td data-label="Position">{row.position}</td>
              <td data-label="Academic Year">{row.academic_year}</td>
              <td data-label="Ht|Wt">{formatHeightWeight(row)}</td>
              <td data-label="Depth" title={depthTitle(row)}>
                {row.depth ? row.depth.rank : '—'}
              </td>
              <td className="roster-table__info-cell">
                <button
                  type="button"
                  className="roster-table__info-button"
                  ref={isOpen ? openToggleButtonRef : null}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleRowPanel(key)}
                >
                  <span aria-hidden="true">ⓘ</span>
                  <span className="visually-hidden">
                    Additional info for {row.name}
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
                    {/* Shown only where the Academic Year column is dropped
                        for width (see App.css). */}
                    <div className="player-info-panel__item player-info-panel__item--year">
                      <dt>Year</dt>
                      <dd>{orDash(row.academic_year)}</dd>
                    </div>
                    <div className="player-info-panel__item">
                      <dt>Hometown</dt>
                      <dd>{orDash(row.hometown)}</dd>
                    </div>
                    <div className="player-info-panel__item">
                      <dt>Depth</dt>
                      <dd>{depthSummary(row)}</dd>
                    </div>
                  </dl>

                  {/* The open panel covers the activation button, so it carries
                      its own close control in that button's place. */}
                  <button
                    type="button"
                    className="player-info-panel__close"
                    onClick={closeRowPanel}
                  >
                    <span aria-hidden="true">✕</span>
                    <span className="visually-hidden">
                      Close additional info for {row.name}
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
