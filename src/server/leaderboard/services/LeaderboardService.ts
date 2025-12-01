import { ILeaderboardRepository } from '../repositories/interfaces/ILeaderboardRepository';

/**
 * SOLID Principles Applied:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles leaderboard business logic (calculating ranks)
 *    - Does NOT fetch data directly from database
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on ILeaderboardRepository interface, not concrete implementation
 *    - Can be tested with MockLeaderboardRepository
 *    - Can use CachedLeaderboardRepository without changing this code
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Open for extension: Can add new repository implementations
 *    - Closed for modification: This service doesn't change when adding caching/logging
 */
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
