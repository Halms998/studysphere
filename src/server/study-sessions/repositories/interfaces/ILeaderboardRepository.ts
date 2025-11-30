import { LeaderboardEntry } from '../../types/leaderboard';

export interface ILeaderboardRepository {
  fetchTopEntries(limit?: number): Promise<LeaderboardEntry[]>;
}
