import { IQuizRepository } from '../repositories/interfaces/IQuizRepository';

/**
 * SOLID Principles Applied:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles quiz business logic
 *    - Delegates database operations to QuizRepository
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on IQuizRepository interface, not concrete QuizRepository
 *    - Enables easy testing and flexibility
 */
export class QuizService {
  constructor(private repository: IQuizRepository) {}

  async getQuizzes(topicId?: string, subjectId?: string) {
    return this.repository.getQuizzes(topicId, subjectId);
  }
}
