export interface IGamificationRepository {
  awardPoints(userId: string, points: number): Promise<void>;
}
