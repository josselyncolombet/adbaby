export interface Student {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}

export interface Completion {
  student_id: string;
  exercise_id: string;
  completed_at: string;
  attempts_count: number;
}
