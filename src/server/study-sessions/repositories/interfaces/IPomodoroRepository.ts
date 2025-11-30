// src/server/study-sessions/repositories/interfaces/IPomodoroRepository.ts
import { PomodoroSession } from '../PomodoroRepository'; // Adjust path as necessary

export interface IPomodoroRepository {
    // Methods inherited from BaseRepository, if needed by the service
    create(data: Omit<PomodoroSession, 'id' | 'created_at'>): Promise<PomodoroSession>;
    update(id: string, data: Partial<PomodoroSession>): Promise<PomodoroSession | null>;
    findById(id: string): Promise<PomodoroSession | null>;

    // Custom methods based on PomodoroRepository.ts
    findByStudySession(sessionId: string): Promise<PomodoroSession | null>;

    updatePhase(
        pomodoroId: string, 
        phase: 'work' | 'break', 
        startTime: string
    ): Promise<PomodoroSession | null>; // Assuming update can return null on failure

    activatePomodoro(pomodoroId: string): Promise<PomodoroSession | null>;
    deactivatePomodoro(pomodoroId: string): Promise<PomodoroSession | null>;
}