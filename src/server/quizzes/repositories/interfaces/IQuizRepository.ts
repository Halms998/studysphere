import { Quiz, Topic } from '../../types';

export interface IQuizRepository {
  getQuizzes(topicId?: string, subjectId?: string): Promise<Quiz[]>;
  getTopicsBySubjectId(subjectId: string): Promise<Topic[]>;
}
