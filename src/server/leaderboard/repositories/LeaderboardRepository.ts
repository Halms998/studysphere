import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BaseRepository } from '../../study-sessions/repositories/base/BaseRepository';
import { LeaderboardEntry } from '../types';
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
}
