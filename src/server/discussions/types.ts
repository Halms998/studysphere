export interface Discussion {
  id: string;
  author_id: string;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  author?: { name: string };
  discussion_answers?: DiscussionAnswer[];
}

export interface DiscussionAnswer {
  id: string;
  discussion_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: { name: string };
}

export interface CreateDiscussionDTO {
  title: string;
  body?: string;
  author_id: string;
}

export interface CreateAnswerDTO {
  discussion_id: string;
  body: string;
  author_id: string;
}
