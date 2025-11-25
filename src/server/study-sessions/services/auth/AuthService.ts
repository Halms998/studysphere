import { NextApiRequest } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export class AuthService {
  static async authenticateRequest(req: NextApiRequest): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Unauthorized');
    }

    return user.id;
  }

  static async validateSessionOwnership(sessionId: string, userId: string): Promise<boolean> {
    const { data: session, error } = await supabase
      .from('study_sessions')
      .select('host_id')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      throw new Error('Study session not found');
    }

    return session.host_id === userId;
  }
}


// services/SubjectService.ts
export class SubjectService {
  async getSubjects() {
    return supabaseAdmin.from('subjects').select('id,name,description,created_at');
  }

  async getTopics(subjectIds: string[]) {
    return supabaseAdmin.from('topics').select('id,name,description,subject_id').in('subject_id', subjectIds);
  }
}

