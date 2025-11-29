// // services/SubjectService.ts
// import { SubjectRepository } from '../repositories/SubjectRepository';

// export class SubjectService {
//   constructor(private repository: SubjectRepository) {}

//   async getSubjectsWithTopics() {
//     const { data: subjects, error } = await this.repository.fetchSubjects();
//     if (error) throw new Error('Failed to fetch subjects');

//     const subjectIds = (subjects || []).map((s: any) => s.id);
//     const { data: topics } = await this.repository.fetchTopics(subjectIds);

//     return (subjects || []).map((s: any) => ({
//       ...s,
//       topics: (topics || []).filter((t) => t.subject_id === s.id),
//     }));
//   }
// }

// services/SubjectService.ts
import { SubjectRepository, Subject, Topic } from '../repositories/SubjectRepository';

export class SubjectService {
  constructor(private repository: SubjectRepository) {}

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