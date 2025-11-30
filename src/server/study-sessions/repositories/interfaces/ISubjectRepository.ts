// src/server/study-sessions/repositories/interfaces/ISubjectRepository.ts

// Assuming Subject and Topic types are imported or defined here
// For this step, assume they are defined or imported from the repository file.

// Defining them here for completeness (adjust paths if necessary)
export interface Subject {
    id: string;
    name: string;
    description: string;
    created_at: string;
}

export interface Topic {
    id: string;
    name: string;
    description: string;
    subject_id: string;
}

export interface ISubjectRepository {
    // Retrieval methods from the concrete class:
    fetchAllSubjects(): Promise<Subject[]>;
    fetchTopicsBySubjectIds(subjectIds: string[]): Promise<Topic[]>;
    findById(subjectId: string): Promise<Subject | null>;

    // Update methods:
    updateDescription(subjectId: string, description: string): Promise<Subject | null>;
    
    // Inherited CRUD method (for Service layer completeness):
    update(id: string, data: Partial<Subject>): Promise<Subject | null>;
}