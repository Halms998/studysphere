import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// 1. Import the modular service
import { SubjectService } from '@/server/study-sessions/services/SubjectService'; 
// Assuming the path to your service is correct

// Use a separate client for server-side operations that require elevated privileges (like auth)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) return res.status(401).json({ error: 'No token provided' });

  // Authentication: Verify the user's token using the admin client
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  // Instantiate the service (No dependencies are passed in, as the repository handles its own client)
  const subjectService = new SubjectService();

  try {
    if (req.method === 'GET') {
      
      // 🏆 FIX: Delegate the entire business logic (fetching subjects and mapping topics) to the Service Layer
      const subjectsWithTopics = await subjectService.getSubjectsWithTopics();
      
      return res.status(200).json(subjectsWithTopics);
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    console.error('Subjects API error:', e);
    // If the service throws a ServiceError, use its message
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
}