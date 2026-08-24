import { useEffect, useState } from 'react';
import { getSecSchedule } from './data/sec-schedule-service';
import SecScheduleGrid from './components/SecScheduleGrid';
import type { SecSchedule } from './types';
import './SecSchedule.css';

type LoadStatus = 'loading' | 'ready' | 'error';

/** "2026-07-03" → "July 3, 2026". Parsed as local time, not UTC. */
function formatUpdatedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function SecScheduleApp() {
  const [schedule, setSchedule] = useState<SecSchedule | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let isActive = true;
    getSecSchedule()
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
        <h1 className="app__title">SEC Schedule</h1>
        {schedule ? (
          <p className="app__count">As of {formatUpdatedDate(schedule.updated)}</p>
        ) : null}
      </header>

      <nav className="app__nav">
        <a className="app__nav-link" href="/alabama/">
          <span aria-hidden="true">&larr;</span> Roster
        </a>
        <a className="app__nav-link" href="/alabama/depth-chart/">
          AL Depth Chart <span aria-hidden="true">&rarr;</span>
        </a>
        <a className="app__nav-link" href="/alabama/schedule/">
          AL Schedule <span aria-hidden="true">&rarr;</span>
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
        <SecScheduleGrid schedule={schedule} />
      )}
    </div>
  );
}

export default SecScheduleApp;
