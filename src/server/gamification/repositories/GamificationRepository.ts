import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { IGamificationRepository } from './interfaces/IGamificationRepository';

/**
 * SOLID Principles Applied:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles awarding points to students
 *    - Separated from DiscussionRepository (which handles discussion data)
 *    - This is a key example of SRP: gamification logic is independent
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Implements IGamificationRepository interface
 *    - Services depend on the interface, not this concrete class
 * 
 * Why this matters:
 *    - If you add badges, levels, or change how points work,
 *      you only modify this file, not DiscussionRepository
 */
export class GamificationRepository implements IGamificationRepository {
  constructor(private supabase = supabaseAdmin) {}

  async awardPoints(userId: string, points: number): Promise<void> {
    try {
      // Try to use the RPC function first if it exists (it's safer for concurrency)
      const { error: rpcError } = await this.supabase.rpc('increment_student_points', { 
        student_uuid: userId, 
        delta: points 
      });

      if (!rpcError) return;

      // Fallback to read-modify-write if RPC fails or doesn't exist
      const { data: studentData, error: studentErr } = await this.supabase
        .from('students')
        .select('points')
        .eq('id', userId)
        .single();

      if (!studentErr && studentData) {
        const current = Number(studentData.points || 0);
        const newPoints = current + points;
        await this.supabase.from('students').update({ points: newPoints }).eq('id', userId);
      }
    } catch (e) {
      console.error('Failed to award points:', e);
    }
  }
}
