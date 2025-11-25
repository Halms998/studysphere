// api/subjects.ts

import { supabase } from '@/lib/supabaseClient';
import { BaseRepository } from './base/BaseRepository';

export interface Subject {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  subject_id: string;
}

export class SubjectRepository extends BaseRepository<Subject> {
  constructor() {
    super(supabase, 'subjects');
  }

  async fetchAllSubjects(): Promise<Subject[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id, name, description, created_at');

    if (error) throw error;
    return data || [];
  }

  async fetchTopicsBySubjectIds(subjectIds: string[]): Promise<Topic[]> {
    const { data, error } = await this.supabase
      .from('topics')
      .select('id, name, description, subject_id')
      .in('subject_id', subjectIds);

    if (error) throw error;
    return data || [];
  }

  async findById(subjectId: string): Promise<Subject | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id, name, description, created_at')
      .eq('id', subjectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async updateDescription(subjectId: string, description: string): Promise<Subject> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ description })
      .eq('id', subjectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}