import { useEffect, useState } from 'react';
import { getSchedule } from './data/schedule-service';
import ScheduleTable from './components/ScheduleTable';
import type { Schedule } from './types';
import './Schedule.css';

type LoadStatus = 'loading' | 'ready' | 'error';

function ScheduleApp() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let isActive = true;
    getSchedule()
      .then((loadedSchedule) => {
        if (isActive) {
          setSchedule(loadedSchedule);
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

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Alabama Schedule</h1>
        {schedule ? (
          <p className="app__count">{schedule.season} season</p>
        ) : null}
      </header>

      <nav className="app__nav">
        <a className="app__nav-link" href="/alabama/">
          <span aria-hidden="true">&larr;</span> Roster
        </a>
        <a className="app__nav-link" href="/alabama/depth-chart/">
          Depth chart <span aria-hidden="true">&rarr;</span>
        </a>
      </nav>

      {loadStatus === 'loading' ? (
        <p className="roster-empty" role="status">
          Loading schedule…
        </p>
      ) : loadStatus === 'error' || !schedule ? (
        <p className="roster-empty" role="alert">
          Couldn’t load the schedule. Please try again later.
        </p>
      ) : (
        <ScheduleTable games={schedule.games} />
      )}
    </div>
  );
}

export default ScheduleApp;
