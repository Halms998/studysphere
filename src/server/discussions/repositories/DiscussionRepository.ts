import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BaseRepository } from '../../study-sessions/repositories/base/BaseRepository';
import { Discussion, DiscussionAnswer, CreateDiscussionDTO, CreateAnswerDTO } from '../types';
import { IDiscussionRepository } from './interfaces/IDiscussionRepository';

/**
 * SOLID Principles Applied:
 * 
 * 1. Single Responsibility Principle (SRP): 
 *    - This repository ONLY handles database operations for discussions and answers
 *    - It does NOT handle gamification (points) - that's in GamificationRepository
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Implements IDiscussionRepository interface
 *    - Higher-level modules (Services) depend on the interface, not this concrete class
 */
export class DiscussionRepository extends BaseRepository<Discussion> implements IDiscussionRepository {
  constructor() {
    super(supabaseAdmin, 'discussions');
  }

  async getAllDiscussions(): Promise<Discussion[]> {
    const { data, error } = await this.supabase
      .from('discussions')
      .select('*, author:students(name), discussion_answers(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDiscussionById(id: string): Promise<Discussion | null> {
    const { data, error } = await this.supabase
      .from('discussions')
      .select('*, author:students(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createDiscussion(data: CreateDiscussionDTO): Promise<Discussion> {
    const { data: result, error } = await this.supabase
      .from('discussions')
      .insert({
        title: data.title,
        body: data.body || null,
        author_id: data.author_id
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async deleteDiscussion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('discussions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getAnswersByDiscussionId(discussionId: string): Promise<DiscussionAnswer[]> {
    const { data, error } = await this.supabase
      .from('discussion_answers')
      .select('*, author:students(name)')
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAnswerById(id: string): Promise<DiscussionAnswer | null> {
    const { data, error } = await this.supabase
      .from('discussion_answers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createAnswer(data: CreateAnswerDTO): Promise<DiscussionAnswer> {
    const { data: result, error } = await this.supabase
      .from('discussion_answers')
      .insert({
        discussion_id: data.discussion_id,
        author_id: data.author_id,
        body: data.body
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async deleteAnswer(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('discussion_answers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
