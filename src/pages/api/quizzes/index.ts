import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { QuizRepository } from '../../../server/quizzes/repositories/QuizRepository';
import { QuizService } from '../../../server/quizzes/services/QuizService';

const repository = new QuizRepository();
const service = new QuizService(repository);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { subject_id, topic_id } = req.query;

      const quizzes = await service.getQuizzes(
        topic_id as string | undefined,
        subject_id as string | undefined
      );

      return res.status(200).json(quizzes);
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    console.error('Quizzes API error:', e);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
