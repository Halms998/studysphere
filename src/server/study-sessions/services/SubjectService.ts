
// services/SubjectService.ts
import { SubjectRepository, Subject, Topic } from '../repositories/SubjectRepository';
import { ISubjectRepository } from '../repositories/interfaces/ISubjectRepository';

export class SubjectService {
  //Dependency Injection using INTERFACE
  constructor(private repository:ISubjectRepository=new SubjectRepository) {}

  async getSubjectsWithTopics(): Promise<Subject[]> {
    try {
      const subjects = await this.repository.fetchAllSubjects();
      const subjectIds = subjects.map((s) => s.id);

      const topics = await this.repository.fetchTopicsBySubjectIds(subjectIds);

      return this.mapTopicsToSubjects(subjects, topics);
    } catch (error) {
      throw new ServiceError('Failed to fetch subjects with topics', error);
    }
  }

  private mapTopicsToSubjects(subjects: Subject[], topics: Topic[]): Subject[] {
    return subjects.map((subject) => ({
      ...subject,
      topics: topics.filter((topic) => topic.subject_id === subject.id),
    }));
  }
}

class ServiceError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = 'ServiceError';
  }
}