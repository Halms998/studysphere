import { IDiscussionRepository } from '../repositories/interfaces/IDiscussionRepository';
import { IGamificationRepository } from '../../gamification/repositories/interfaces/IGamificationRepository';
import { CreateDiscussionDTO, CreateAnswerDTO } from '../types';

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
