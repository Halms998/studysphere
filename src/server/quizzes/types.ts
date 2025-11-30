export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  topic_id: string | null;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
}
