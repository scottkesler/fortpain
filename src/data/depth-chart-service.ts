import depthChartData from './depth-chart.json';
import type { DepthChart } from '../types';

/**
 * The weekly depth chart's single entry point, mirroring `roster-service`.
 *
 * Unlike the roster, this file is maintained by hand rather than scraped: edit
 * `depth-chart.json` each week and run `npm run validate:depth` to confirm
 * every name still matches a player on the roster. There is no `RosterSource`-
 * style indirection here because there is only ever one author — the repo.
 */
export function getDepthChart(): Promise<DepthChart> {
  return Promise.resolve(depthChartData as DepthChart);
}
