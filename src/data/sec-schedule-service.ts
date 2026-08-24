import secScheduleData from './sec-schedule.json';
import type { SecSchedule } from '../types';

/**
 * The SEC-wide schedule grid's single entry point, mirroring `schedule-service`.
 * Sourced from the SEC's published schedule grid; edit `sec-schedule.json`
 * directly when the conference issues a revision.
 */
export function getSecSchedule(): Promise<SecSchedule> {
  return Promise.resolve(secScheduleData as SecSchedule);
}
