
import { StudySession, StudySessionDetails } from '../../../../types/studySession'; 
// Define the exact type required for the create function
export type StudySessionCreationData = Pick<StudySession, 'title' | 'host_id' | 'start_time'> & 
    Partial<Omit<StudySession, 'id' | 'created_at' | 'title' | 'host_id' | 'start_time'>>;

export interface IStudySessionRepository {
    // FIX: Use the explicit type
    create(data: StudySessionCreationData): Promise<StudySession>; 
    update(id: string, data: Partial<StudySession>): Promise<StudySession | null>;
        // Custom methods based on StudySessionRepository.ts
    findByHostId(hostId: string): Promise<StudySession[]>;
    
    // Note: findWithDetails requires the StudySessionDetails type
    findWithDetails(sessionId: string): Promise<StudySessionDetails | null>;

    updateStatus(sessionId: string, status: StudySession['status']): Promise<StudySession | null>;
    getStudentsByIds(ids: string[]): Promise<{ id: string, name: string, email: string }[]>;
}