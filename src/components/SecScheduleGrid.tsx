import type { SecSchedule } from '../types';

interface SecScheduleGridProps {
  schedule: SecSchedule;
}

/** Team and opponent names are stored shouting-caps, as the SEC's grid prints
    them; render them the way they're normally written. Multi-word exceptions
    (LSU, A&M, initialisms) keep their own casing. */
const CASING_EXCEPTIONS: Record<string, string> = {
  lsu: 'LSU',
  nc: 'NC',
  utsa: 'UTSA',
  utep: 'UTEP',
  'a&m': 'A&M',
};

function capitalizeWord(word: string): string {
  return word
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

function titleCaseTeam(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => CASING_EXCEPTIONS[word] ?? capitalizeWord(word))
    .join(' ');
}

/** "2026-09-05" → "Sep 5". Parsed as local time, not UTC. */
function formatWeekDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function SecScheduleGrid({ schedule }: SecScheduleGridProps) {
  return (
    <div className="sec-grid__scroller">
      <table className="sec-grid">
        <thead>
          <tr>
            <th scope="col" className="sec-grid__team-heading">
              Team
            </th>
            {schedule.weeks.map((week) => (
              <th scope="col" key={week}>
                {formatWeekDate(week)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.teams.map((row) => (
            <tr
              key={row.team}
              className={
                row.team === 'ALABAMA' ? 'sec-grid__row--highlight' : undefined
              }
            >
              <th scope="row" className="sec-grid__team">
                {titleCaseTeam(row.team)}
              </th>
              {row.games.map((game, weekIndex) => (
                <td
                  key={schedule.weeks[weekIndex]}
                  className={
                    game === null
                      ? 'sec-grid__cell sec-grid__cell--bye'
                      : 'sec-grid__cell'
                  }
                  data-label={formatWeekDate(schedule.weeks[weekIndex])}
                >
                  {game === null ? (
                    <span className="sec-grid__bye">BYE</span>
                  ) : (
                    <>
                      <span className="sec-grid__opponent">
                        {titleCaseTeam(game.opponent)}
                      </span>
                      <span className="sec-grid__site">
                        {game.site}
                        {game.note ? ` (${game.note})` : ''}
                      </span>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SecScheduleGrid;
