import { IDiscussionRepository } from '../repositories/interfaces/IDiscussionRepository';
import { IGamificationRepository } from '../../gamification/repositories/interfaces/IGamificationRepository';
import { CreateDiscussionDTO, CreateAnswerDTO } from '../types';

/**
 * SOLID Principles Applied:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - Only handles business logic for discussions
 *    - Delegates database operations to DiscussionRepository
 *    - Delegates point awarding to GamificationRepository
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on IDiscussionRepository interface, not concrete DiscussionRepository
 *    - Depends on IGamificationRepository interface, not concrete GamificationRepository
 *    - This allows easy testing with mock repositories
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Can extend functionality by creating new repository implementations
 *    - Service code doesn't need to change when adding caching, logging, etc.
 */
export class DiscussionService {
  constructor(
    private repository: IDiscussionRepository,
    private gamificationRepo: IGamificationRepository
  ) {}

  async getAllDiscussions() {
    return this.repository.getAllDiscussions();
  }

  async getDiscussionById(id: string) {
    return this.repository.getDiscussionById(id);
  }

  async createDiscussion(data: CreateDiscussionDTO) {
    const discussion = await this.repository.createDiscussion(data);
    // Award 10 points for creating a discussion
    await this.gamificationRepo.awardPoints(data.author_id, 10);
    return discussion;
  }

  async deleteDiscussion(id: string, userId: string) {
    const discussion = await this.repository.getDiscussionById(id);
    if (!discussion) {
      throw new Error('Discussion not found');
    }
    if (discussion.author_id !== userId) {
      throw new Error('Forbidden');
    }
    return this.repository.deleteDiscussion(id);
  }

  async getAnswers(discussionId: string) {
    return this.repository.getAnswersByDiscussionId(discussionId);
  }

  async createAnswer(data: CreateAnswerDTO) {
    const answer = await this.repository.createAnswer(data);
    // Award 5 points for answering
    await this.gamificationRepo.awardPoints(data.author_id, 5);
    return answer;
  }

  async deleteAnswer(id: string, userId: string) {
    const answer = await this.repository.getAnswerById(id);
    if (!answer) {
      throw new Error('Answer not found');
    }
    if (answer.author_id !== userId) {
      throw new Error('Forbidden');
    }
    return this.repository.deleteAnswer(id);
  }
}
