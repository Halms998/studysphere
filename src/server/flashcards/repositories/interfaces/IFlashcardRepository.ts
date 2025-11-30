import { Flashcard, FlashcardDeck } from '../../types';

export interface IFlashcardRepository {
  getDecksByUserId(userId: string): Promise<FlashcardDeck[]>;
  getFlashcardsByDeckIds(deckIds: string[], dueOnly?: boolean): Promise<Flashcard[]>;
}
