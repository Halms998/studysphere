import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BaseRepository } from './base/BaseRepository';
import { LeaderboardEntry } from '../types/leaderboard';
import { ILeaderboardRepository } from './interfaces/ILeaderboardRepository';

export class LeaderboardRepository extends BaseRepository<LeaderboardEntry> implements ILeaderboardRepository {
  constructor() {
    super(supabaseAdmin, 'students');
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
