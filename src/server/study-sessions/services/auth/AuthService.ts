import { NextApiRequest } from 'next';
import { supabase } from '@/lib/supabaseClient';

export class AuthService {
  // ===== EXISTING METHODS - DO NOT CHANGE =====
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

  // ===== NEW METHODS FOR useLogin & useRegister =====
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error || !data.session || !data.user) {
        return {
          session: null,
          error: error?.message || 'Login failed',
        };
      }

      return {
        session: {
          user: {
            id: data.user.id,
            email: data.user.email!,
          },
          accessToken: data.session.access_token,
        },
        error: null,
      };
    } catch (err) {
      return {
        session: null,
        error: 'An unexpected error occurred',
      };
    }
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (error || !data.session || !data.user) {
        return {
          session: null,
          error: error?.message || 'Registration failed',
        };
      }

      return {
        session: {
          user: {
            id: data.user.id,
            email: data.user.email!,
          },
          accessToken: data.session.access_token,
        },
        error: null,
      };
    } catch (err) {
      return {
        session: null,
        error: 'An unexpected error occurred',
      };
    }
  }

  static async getSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      return {
        user: {
          id: session.user.id,
          email: session.user.email!,
        },
        accessToken: session.access_token,
      };
    } catch (err) {
      return null;
    }
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

