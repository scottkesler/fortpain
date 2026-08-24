import { ordinal } from '../depth-chart';
import type { DepthUnit, Player } from '../types';

interface DepthChartTableProps {
  unit: DepthUnit;
  /** Roster records keyed by name, for jersey numbers and class years. */
  playersByName: Map<string, Player>;
}

/** How many depth columns this unit needs — its deepest position. */
function maxDepth(unit: DepthUnit): number {
  return unit.slots.reduce(
    (deepest, slot) => Math.max(deepest, slot.players.length),
    0,
  );
}

function DepthChartTable({ unit, playersByName }: DepthChartTableProps) {
  const depthColumns = Array.from({ length: maxDepth(unit) }, (_, index) => index);
  const headingId = `unit-${unit.id}`;

  return (
    <section className="depth-unit" aria-labelledby={headingId}>
      <h2 className="depth-unit__heading" id={headingId}>
        {unit.label}
        {unit.scheme ? (
          <span className="depth-unit__scheme">{unit.scheme}</span>
        ) : null}
      </h2>

      <div className="depth-unit__scroller">
        <table className="depth-table">
          <thead>
            <tr>
              <th scope="col" className="depth-table__pos-heading">
                Pos
              </th>
              {depthColumns.map((columnIndex) => (
                <th scope="col" key={columnIndex}>
                  {ordinal(columnIndex + 1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unit.slots.map((slot) => (
              <tr key={slot.code}>
                <th scope="row" className="depth-table__pos" title={slot.label}>
                  {slot.code}
                </th>
                {depthColumns.map((columnIndex) => {
                  const playerName = slot.players[columnIndex];
                  if (playerName === undefined) {
                    return (
                      <td
                        key={columnIndex}
                        className="depth-table__cell depth-table__cell--empty"
                      />
                    );
                  }

                  const player = playersByName.get(playerName);
                  const isStarter = columnIndex === 0;
                  return (
                    <td
                      key={columnIndex}
                      className={
                        isStarter
                          ? 'depth-table__cell depth-table__cell--starter'
                          : 'depth-table__cell'
                      }
                      data-label={ordinal(columnIndex + 1)}
                    >
                      <span className="depth-player__number">
                        {player ? player.jersey_number : '—'}
                      </span>
                      <span className="depth-player__name">{playerName}</span>
                      {player ? (
                        <span className="depth-player__year">
                          {player.academic_year}
                        </span>
                      ) : (
                        /* A name that no longer matches the roster — most
                           likely a typo or a player who has since left. */
                        <span className="depth-player__year depth-player__year--unknown">
                          not on roster
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DepthChartTable;
