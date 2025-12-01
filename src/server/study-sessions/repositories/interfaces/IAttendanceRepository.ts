// src/server/study-sessions/repositories/interfaces/IAttendanceRepository.ts

import { AttendanceRecord } from '../../../../types/studySession'; 

// Define the shape of the data required for upsert
// Note: Assuming AttendanceRecord type is correctly imported from your types folder
export type UpsertAttendanceDTO = Pick<AttendanceRecord, 'session_id' | 'student_id' | 'join_time' | 'leave_time' | 'duration'>;

export interface IAttendanceRepository {
    // Defines the contract for inserting/updating attendance
    upsertAttendance(data: UpsertAttendanceDTO): Promise<AttendanceRecord | null>;

    // Defines the contract for finding a specific record
    findBySessionAndStudent(sessionId: string, studentId: string): Promise<AttendanceRecord | null>;
    
    // Defines the contract for updating an existing record
    update(recordId: string, data: Partial<UpsertAttendanceDTO>): Promise<AttendanceRecord | null>;

    // Defines the contract for fetching all participants
    getSessionParticipants(sessionId: string): Promise<AttendanceRecord[]>;
}