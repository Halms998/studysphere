import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { FlashcardRepository } from '../../../server/flashcards/repositories/FlashcardRepository';
import { FlashcardService } from '../../../server/flashcards/services/FlashcardService';

const repository = new FlashcardRepository();
const service = new FlashcardService(repository);

// GET /api/flashcards?deckId=...&due=true
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    const { deckId, due } = req.query;
    const dueOnly = String(due) === 'true';

    const flashcards = await service.getFlashcards(user.id, deckId as string | string[], dueOnly);

    return res.status(200).json({ flashcards });
  } catch (e) {
    console.error('Error in /api/flashcards GET:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
