import { Discussion, DiscussionAnswer, CreateDiscussionDTO, CreateAnswerDTO } from '../../types';

export interface IDiscussionRepository {
  getAllDiscussions(): Promise<Discussion[]>;
  getDiscussionById(id: string): Promise<Discussion | null>;
  createDiscussion(data: CreateDiscussionDTO): Promise<Discussion>;
  deleteDiscussion(id: string): Promise<void>;
  
  getAnswersByDiscussionId(discussionId: string): Promise<DiscussionAnswer[]>;
  getAnswerById(id: string): Promise<DiscussionAnswer | null>;
  createAnswer(data: CreateAnswerDTO): Promise<DiscussionAnswer>;
  deleteAnswer(id: string): Promise<void>;
}
