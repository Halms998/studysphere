import type { NextApiRequest, NextApiResponse } from 'next';
import { LeaderboardService } from '../../server/leaderboard/services/LeaderboardService';
import { LeaderboardRepository } from '../../server/leaderboard/repositories/LeaderboardRepository';

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
