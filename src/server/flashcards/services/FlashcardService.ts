import { IFlashcardRepository } from '../repositories/interfaces/IFlashcardRepository';

/**
 * SOLID Principles Applied:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles flashcard business logic (resolving deck IDs, filtering)
 *    - Delegates database operations to FlashcardRepository
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on IFlashcardRepository interface, not concrete FlashcardRepository
 *    - Enables easy testing with mock repositories
 */
export class FlashcardService {
  constructor(private repository: IFlashcardRepository) {}

  async getFlashcards(userId: string, deckId?: string | string[], dueOnly: boolean = false) {
    let deckIds: string[] = [];

    if (deckId) {
      deckIds = Array.isArray(deckId) ? deckId : [String(deckId)];
    } else {
      // If no deck specified, get all decks for the user
      const decks = await this.repository.getDecksByUserId(userId);
      deckIds = decks.map(d => d.id);
    }

    if (deckIds.length === 0) {
      return [];
    }

    return this.repository.getFlashcardsByDeckIds(deckIds, dueOnly);
  }
}
