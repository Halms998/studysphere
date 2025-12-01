import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BaseRepository } from '../../study-sessions/repositories/base/BaseRepository';
import { Flashcard, FlashcardDeck } from '../types';
import { IFlashcardRepository } from './interfaces/IFlashcardRepository';

/**
 * SOLID Principles Applied:
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles database operations for flashcards and decks
 *    - Does NOT handle spaced repetition logic or review scheduling
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Implements IFlashcardRepository interface
 *    - FlashcardService depends on the interface, not this concrete class
 */
export class FlashcardRepository extends BaseRepository<Flashcard> implements IFlashcardRepository {
  constructor() {
    super(supabaseAdmin, 'flashcards');
  }

  async getDecksByUserId(userId: string): Promise<FlashcardDeck[]> {
    const { data, error } = await this.supabase
      .from('flashcard_decks')
      .select('*')
      .eq('created_by', userId);

    if (error) throw error;
    return data || [];
  }

  async getFlashcardsByDeckIds(deckIds: string[], dueOnly: boolean = false): Promise<Flashcard[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .in('deck_id', deckIds);

    if (dueOnly) {
      query = query.lte('next_review_at', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }
}
