export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  created_at: string;
  last_reviewed: string | null;
  repetition_count: number;
  interval_days: number;
  ease: number;
  next_review_at: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
}
