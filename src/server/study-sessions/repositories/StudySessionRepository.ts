import { supabase } from '@/lib/supabaseClient';
import { BaseRepository } from './base/BaseRepository';
import { StudySession, StudySessionDetails } from '../types';
import { StudySessionCreationData, IStudySessionRepository } from './interfaces/IStudySessionRepository';

export class StudySessionRepository extends BaseRepository<StudySession> implements IStudySessionRepository {
  constructor() {
    super(supabase, 'study_sessions');
  }
  async create(data: StudySessionCreationData): Promise<StudySession> {
        // Call the underlying BaseRepository's create method
        return super.create(data as any); 
        // Note: Using 'as any' is often necessary here because BaseRepository 
        // usually takes a generic type, but this is the correct signature match.
    }
  async findByHostId(hostId: string): Promise<StudySession[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findWithDetails(sessionId: string): Promise<StudySessionDetails> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        host:students(name),
        video_conferences(*),
        attendance_records(*, student:students(name))
      `)
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateStatus(sessionId: string, status: StudySession['status']): Promise<StudySession> {
    return this.update(sessionId, { status });
  }
  // src/server/study-sessions/repositories/StudySessionRepository.ts

// ... inside export class StudySessionRepository ...

async getStudentsByIds(ids: string[]): Promise<{ id: string, name: string, email: string }[]> {
    const { data, error } = await this.supabase
        .from('students')
        .select('id, name, email')
        .in('id', ids);

    if (error) throw error;
    return data || [];
}
}
