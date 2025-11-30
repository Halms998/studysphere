import { ILeaderboardRepository } from '../repositories/interfaces/ILeaderboardRepository';

export class LeaderboardService {
  constructor(private repository: ILeaderboardRepository) {}

  async getLeaderboard() {
    try {
      const data = await this.repository.fetchTopEntries();
      return data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }
  }
}
