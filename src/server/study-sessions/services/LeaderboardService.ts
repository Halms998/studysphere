// services/LeaderboardService.ts
import { LeaderboardRepository } from '../repositories/LeaderboardRepository';

export class LeaderboardService {
  constructor(private repository: LeaderboardRepository) {}

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

// repositories/LeaderboardRepository.ts
export class LeaderboardRepository {
  async fetchTopEntries() {
    return supabaseAdmin
      .from('students')
      .select('id, name, points')
      .order('points', { ascending: false })
      .limit(200);
  }
}

// api/leaderboard.ts
import { LeaderboardService } from '../../services/LeaderboardService';
import { LeaderboardRepository } from '../../repositories/LeaderboardRepository';

const repository = new LeaderboardRepository();
const service = new LeaderboardService(repository);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const leaderboard = await service.getLeaderboard();
    return res.status(200).json({ leaderboard });
  } catch (e) {
    console.error('Unexpected leaderboard error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}