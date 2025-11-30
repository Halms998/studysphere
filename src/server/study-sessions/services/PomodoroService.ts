import { PomodoroRepository } from '../repositories/PomodoroRepository';
import { IPomodoroRepository } from '../repositories/interfaces/IPomodoroRepository'; 
// Import the type definition for safety, assuming it's exported from the repo file
import { PomodoroSession } from '../repositories/PomodoroRepository';
export interface CreatePomodoroData {
  session_id: string;
  work_duration: number;
  break_duration: number;
}

export class PomodoroService {
  constructor(
        // Dependency injection: Type the dependency using the INTERFACE
    private pomodoroRepo: IPomodoroRepository = new PomodoroRepository()
  ) {}

  async createPomodoroSession(data: CreatePomodoroData) {
    const now = new Date().toISOString();
    
    return this.pomodoroRepo.create({
      ...data,
      current_phase: 'work',
      phase_start_time: now,
      is_active: true
    });
  }

  async getPomodoroByStudySession(sessionId: string) {
    return this.pomodoroRepo.findByStudySession(sessionId);
  }

  async switchPhase(pomodoroId: string, phase: 'work' | 'break') {
    const now = new Date().toISOString();
    return this.pomodoroRepo.updatePhase(pomodoroId, phase, now);
  }

  async activatePomodoro(pomodoroId: string) {
    return this.pomodoroRepo.activatePomodoro(pomodoroId);
  }

  async deactivatePomodoro(pomodoroId: string) {
    return this.pomodoroRepo.deactivatePomodoro(pomodoroId);
  }

  async calculatePhaseRemainingTime(pomodoroSession: any): Promise<number> {
    const phaseStart = new Date(pomodoroSession.phase_start_time);
    const now = new Date();
    const elapsedMs = now.getTime() - phaseStart.getTime();
    const phaseDuration = pomodoroSession.current_phase === 'work' 
      ? pomodoroSession.work_duration * 60 * 1000 
      : pomodoroSession.break_duration * 60 * 1000;
    
    return Math.max(0, phaseDuration - elapsedMs);
  }
}