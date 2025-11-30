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
      const data = await service.getAllDiscussions();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { title, body } = req.body;
      if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

      const data = await service.createDiscussion({
        title: title.trim(),
        body: body || null,
        author_id: user.id
      });

      return res.status(201).json(data);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    console.error('Discussions API error:', e);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
