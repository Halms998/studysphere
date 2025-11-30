import { IQuizRepository } from '../repositories/interfaces/IQuizRepository';

export class QuizService {
  constructor(private repository: IQuizRepository) {}

  async getQuizzes(topicId?: string, subjectId?: string) {
    return this.repository.getQuizzes(topicId, subjectId);
  }
}
