import { LeaderboardEntry } from '../../types';

export interface ILeaderboardRepository {
  fetchTopEntries(limit?: number): Promise<LeaderboardEntry[]>;
}
