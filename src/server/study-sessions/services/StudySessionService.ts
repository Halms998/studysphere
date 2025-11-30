import { StudySessionRepository } from '../repositories/StudySessionRepository';
import { AttendanceRepository } from '../repositories/AttendanceRepository';
import { StudySession, StudySessionDetails } from '../types';
import { IStudySessionRepository } from '../repositories/interfaces/IStudySessionRepository';
import { IAttendanceRepository } from '../repositories/interfaces/IAttendanceRepository';
import { StudySessionCreationData } from '../repositories/interfaces/IStudySessionRepository';
export class StudySessionService {
    constructor(
        private studySessionRepo: IStudySessionRepository = new StudySessionRepository(),
        private AttendanceRepo: IAttendanceRepository = new AttendanceRepository()
    ) {}

    async getSessionWithDetails(sessionId: string): Promise<StudySessionDetails> {
        const session = await this.studySessionRepo.findWithDetails(sessionId);
        
        if (!session) {
            throw new Error('Study session not found');
        }

        // Ensure nested fields exist
        session.video_conferences = session.video_conferences || [];
        session.attendance_records = session.attendance_records || [];

        // Resolve participant names in batch
        await this.resolveParticipantNames(session);

        // Ensure host name exists
        await this.resolveHostName(session);

        return session;
    }

    private async resolveParticipantNames(session: StudySessionDetails): Promise<void> {
        try {
            const studentIds = Array.from(new Set(
                session.attendance_records
                    .map((r: any) => r.student_id)
                    .filter(Boolean)
            ));

            if (studentIds.length > 0) {
                // 🏆 FIX 1: Use the IStudySessionRepository method to fetch student data
                // This keeps the service ignorant of Supabase/SQL details.
                const students = await this.studySessionRepo.getStudentsByIds(studentIds);

                if (students) {
                    const lookup: Record<string, any> = {};
                    students.forEach((s: any) => { 
                        lookup[s.id] = { name: s.name, email: s.email };
                    });
                    
                    session.attendance_records = session.attendance_records.map((r: any) => ({
                        ...r,
                        student: lookup[r.student_id] || { name: null, email: null }
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to resolve participant names:', error);
        }
    }

    private async resolveHostName(session: StudySessionDetails): Promise<void> {
        try {
            if ((!session.host || !session.host.name) && session.session.host_id) {
                // 🏆 FIX 2: Use the IStudySessionRepository method to fetch the host's name
                const students = await this.studySessionRepo.getStudentsByIds([session.session.host_id]);
                const hostData = students[0];

                if (hostData?.name) {
                    session.host = { name: hostData.name };
                }
            }
        } catch (error) {
            console.error('Failed to resolve host name:', error);
        }
    }

    async updateSession(sessionId: string, updates: Partial<StudySession>): Promise<StudySession> {
    const updated = await this.studySessionRepo.update(sessionId, updates);

    // FIX: Must check for null and throw if not found/updated
    if (!updated) {
        throw new Error('Update failed: Study session not found.');
    }
    return updated;
}

    async createSession(sessionData: Partial<StudySession>): Promise<StudySession> {
    // Perform necessary checks/validation here...

    // FIX: Structure the data to match the repository contract
    const creationData: StudySessionCreationData = {
        title: sessionData.title!, // Assumes validation passed
        host_id: sessionData.host_id!,
        start_time: sessionData.start_time!,
        ...sessionData as any 
    };

    return this.studySessionRepo.create(creationData);
}
    async getSessionsByHost(hostId: string): Promise<StudySession[]> {
        return this.studySessionRepo.findByHostId(hostId);
    }
}