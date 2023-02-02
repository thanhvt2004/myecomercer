export interface EntraceTestExam {
  id?: string;
  skill_id?: string;
  skill_name?: string;
  date?: Date;
  score?: number;
  note?: string;
  teacher_full_name?: string;
  teacher_id?: string;
}
export interface EntraceTest {
  id?: string;
  course_id?: string;
  date?: Date;
  total_score?: number;
  note?: string;
  course_name?: string;
  exams: EntraceTestExam[];
  sale_care_full_name?: string;
  expand: boolean;
}
export interface StudentClass{
  id?: string;
  name: string;
  syllabus_id?: string;
  module_id?: string;
  is_vip?: boolean;
  start_date: string;
  end_date: string;
  code?: string;
  status?: string;
  room_name?: string;
  progress?: string;
}
