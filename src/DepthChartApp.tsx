import { useEffect, useState } from 'react';
import { getRoster } from './data/roster-service';
import { getDepthChart } from './data/depth-chart-service';
import DepthChartTable from './components/DepthChartTable';
import type { DepthChart, Player } from './types';
import './DepthChart.css';

type LoadStatus = 'loading' | 'ready' | 'error';

/** "2026-08-24" → "August 24, 2026". Parsed as local time, not UTC. */
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

function DepthChartApp() {
  const [depthChart, setDepthChart] = useState<DepthChart | null>(null);
  const [playersByName, setPlayersByName] = useState<Map<string, Player>>(
    new Map(),
  );
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let isActive = true;
    Promise.all([getRoster(), getDepthChart()])
      .then(([players, chart]) => {
        if (isActive) {
          setPlayersByName(new Map(players.map((player) => [player.name, player])));
          setDepthChart(chart);
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
        <h1 className="app__title">Alabama Depth Chart</h1>
        {depthChart ? (
          <p className="app__count">
            {depthChart.opponent ? `${depthChart.opponent} · ` : ''}
            Updated {formatUpdatedDate(depthChart.updated)}
          </p>
        ) : null}
      </header>

      <nav className="app__nav">
        <a className="app__nav-link" href="/alabama/">
          Roster
        </a>
        <a className="app__nav-link" href="/alabama/schedule/">
          AL Schedule
        </a>
        <a className="app__nav-link" href="/alabama/sec-schedule/">
          Full SEC Schedule
        </a>
      </nav>

      {loadStatus === 'loading' ? (
        <p className="roster-empty" role="status">
          Loading depth chart…
        </p>
      ) : loadStatus === 'error' || !depthChart ? (
        <p className="roster-empty" role="alert">
          Couldn’t load the depth chart. Please try again later.
        </p>
      ) : (
        depthChart.units.map((unit) => (
          <DepthChartTable
            key={unit.id}
            unit={unit}
            playersByName={playersByName}
          />
        ))
      )}
    </div>
  );
}

export default DepthChartApp;
