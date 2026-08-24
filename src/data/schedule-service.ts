import scheduleData from './schedule.json';
import type { Schedule } from '../types';

/**
 * The schedule's single entry point, mirroring `depth-chart-service`. Edit
 * `schedule.json` directly — times marked TBD get filled in as the SEC
 * releases them throughout the season.
 */
export function getSchedule(): Promise<Schedule> {
  return Promise.resolve(scheduleData as Schedule);
}
