import type { ScheduleGame } from '../types';

interface ScheduleTableProps {
  games: ScheduleGame[];
}

/** "2026-09-05" → "Sat, Sep 5". Parsed as local time, not UTC. */
function formatGameDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function ScheduleTable({ games }: ScheduleTableProps) {
  return (
    <div className="schedule-table__scroller">
      <table className="schedule-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Opponent</th>
            <th scope="col">Location</th>
            <th scope="col">Time</th>
            <th scope="col">TV</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.date}>
              <td data-label="Date">{formatGameDate(game.date)}</td>
              <td data-label="Opponent" className="schedule-table__opponent">
                {game.location === 'away' ? '@ ' : 'vs '}
                {game.opponent}
              </td>
              <td data-label="Location">
                {game.location === 'home' ? 'Home' : 'Away'}
              </td>
              <td data-label="Time">{game.time ?? 'TBD'}</td>
              <td data-label="TV">{game.tv ?? 'TBA'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleTable;
