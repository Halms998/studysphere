import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DiscussionRepository } from '@/server/discussions/repositories/DiscussionRepository';
import { GamificationRepository } from '@/server/gamification/repositories/GamificationRepository';
import { DiscussionService } from '@/server/discussions/services/DiscussionService';

const repository = new DiscussionRepository();
const gamificationRepo = new GamificationRepository();
const service = new DiscussionService(repository, gamificationRepo);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const discussion_id = String(req.query.discussion_id || '');
      if (!discussion_id) return res.status(400).json({ error: 'discussion_id required' });

      const data = await service.getAnswers(discussion_id);
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { discussion_id, body } = req.body;
      if (!discussion_id) return res.status(400).json({ error: 'discussion_id required' });
      if (!body || !body.trim()) return res.status(400).json({ error: 'Answer body is required' });

      const data = await service.createAnswer({
        discussion_id,
        author_id: user.id,
        body: body.trim()
      });

      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      // delete an answer by id passed as query param or in body
      const answerId = String(req.query.id || req.body.id || '');
      if (!answerId) return res.status(400).json({ error: 'id required' });

      try {
        await service.deleteAnswer(answerId, user.id);
        return res.status(204).end();
      } catch (e: any) {
        if (e.message === 'Answer not found') return res.status(404).json({ error: e.message });
        if (e.message === 'Forbidden') return res.status(403).json({ error: e.message });
        throw e;
      }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    console.error('Discussion answers API error:', e);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
