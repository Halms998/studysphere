import { MeetingRepository } from '../repositories/MeetingRepository';
import { IMeetingRepository } from '../repositories/interfaces/IMeetingRepository';

export class MeetingService {
  constructor(
        //  Type the dependency using the INTERFACE (DIP)
    private meetingRepo: IMeetingRepository = new MeetingRepository()
    // private readonly meetingRepo: IMeetingRepository = new MeetingRepository()
  ) {}

  async createMeeting(sessionId: string, meetingUrl: string) {
    return this.meetingRepo.createMeeting(sessionId, meetingUrl);
  }

  async getSessionMeetings(sessionId: string) {
    return this.meetingRepo.findBySessionId(sessionId);
  }

  async updateMeetingStatus(meetingId: string, status: 'pending' | 'active' | 'ended') {
    return this.meetingRepo.updateMeetingStatus(meetingId, status);
  }

  async startMeeting(meetingId: string) {
    return this.updateMeetingStatus(meetingId, 'active');
  }

  async endMeeting(meetingId: string) {
    return this.updateMeetingStatus(meetingId, 'ended');
  }

  async getMeeting(meetingId: string) {
    return this.meetingRepo.findById(meetingId);
  }
}