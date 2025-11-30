import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BaseRepository } from '../../study-sessions/repositories/base/BaseRepository';
import { Quiz, Topic } from '../types';
import { IQuizRepository } from './interfaces/IQuizRepository';

export class QuizRepository extends BaseRepository<Quiz> implements IQuizRepository {
  constructor() {
    super(supabaseAdmin, 'quizzes');
  }

  async getQuizzes(topicId?: string, subjectId?: string): Promise<Quiz[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('id,title,description,created_at,topic_id')
      .order('created_at', { ascending: false });

    if (topicId) {
      query = query.eq('topic_id', topicId);
    } else if (subjectId) {
      const topics = await this.getTopicsBySubjectId(subjectId);
      const topicIds = topics.map(t => t.id);
      
      if (topicIds.length > 0) {
        query = query.in('topic_id', topicIds);
      } else {
        return [];
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getTopicsBySubjectId(subjectId: string): Promise<Topic[]> {
    const { data, error } = await this.supabase
      .from('topics')
      .select('id, subject_id, name')
      .eq('subject_id', subjectId);

    if (error) throw error;
    return data || [];
  }
}
