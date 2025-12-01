// src/server/study-sessions/repositories/interfaces/IMeetingRepository.ts

import { VideoConference } from '../../../../types/studySession'; // Adjust path if needed

export interface IMeetingRepository {
    // 1. Retrieval (Returns an array, as per your concrete implementation)
    findBySessionId(sessionId: string): Promise<VideoConference[]>;

    // 2. Creation (Must match the createMeeting method signature)
    createMeeting(sessionId: string, meetingUrl: string): Promise<VideoConference>;

    // 3. Update Status (Must match the updateMeetingStatus method signature)
    updateMeetingStatus(meetingId: string, status: VideoConference['status']): Promise<VideoConference | null>;

    // Optional: General update, if needed by the service
    update(id: string, data: Partial<VideoConference>): Promise<VideoConference | null>;
    findById(id: string): Promise<VideoConference | null>;
}