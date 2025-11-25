import { supabase } from '@/lib/supabaseClient';
import { BaseRepository } from './base/BaseRepository';

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
}

export class LeaderboardRepository extends BaseRepository<LeaderboardEntry> {
  constructor() {
    super(supabase, 'students');
  }

  async fetchTopEntries(limit: number = 200): Promise<LeaderboardEntry[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id, name, points')
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async findById(studentId: string): Promise<LeaderboardEntry | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id, name, points')
      .eq('id', studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async updatePoints(studentId: string, points: number): Promise<LeaderboardEntry> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ points })
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
