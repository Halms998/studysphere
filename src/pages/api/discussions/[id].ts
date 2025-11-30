import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DiscussionRepository } from '@/server/discussions/repositories/DiscussionRepository';
import { GamificationRepository } from '@/server/gamification/repositories/GamificationRepository';
import { DiscussionService } from '@/server/discussions/services/DiscussionService';

const repository = new DiscussionRepository();
const gamificationRepo = new GamificationRepository();
const service = new DiscussionService(repository, gamificationRepo);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req;
  const id = String(query.id || '');

  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const data = await service.getDiscussionById(id);
      if (!data) return res.status(404).json({ error: 'Discussion not found' });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      try {
        await service.deleteDiscussion(id, user.id);
        return res.status(204).end();
      } catch (e: any) {
        if (e.message === 'Discussion not found') return res.status(404).json({ error: e.message });
        if (e.message === 'Forbidden') return res.status(403).json({ error: e.message });
        throw e;
      }
    }

    // POST for answers moved to /api/discussion-answers
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    console.error('Discussion [id] API error:', e);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
