export interface Teacher {
  teacher_id?: string;
  teacher_name?: string;
  teaching_hours_display?: string;
  contract_type_value?: string;
  is_selected?: boolean;
  id: string;
  full_name: string;
  kpi_teaching_hours?: number;
  assigned_teaching_hours?: number;
}

export interface Room {
  id: string;
  name: string;
  max_attendees?: number;
}

export interface TeacherRank {
  id: string;
  name: string;
  code: string;
  order: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface Level {
  id: string;
  name: string;
}

export interface SessionType {
  id: string;
  name: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Module {
  id: string;
  name: string;
}

export interface Syllabus {
  id: string;
  name: string;
  level_id: string;
  module_id: string;
  skill_ids: string[];
  skills: string;
}

export interface GenerateSessionRequest {
  syllabus_id: string;
  start_date: string;
  weekly_sessions: WeeklySession;
}

export interface SyllabusDetail {
  id: string;
  name: string;
  module_id: string;
  level_id: string;
  skill_ids: string[];
  skills: string;
  is_vip: boolean;
  units: any;
  coursebook: string;
  coursebook_description: string;
  supplementary_materials: string;
  teachers_reference: string;
  course_objective: string;
  learning_outcomes: string;
  assessment: string;
  sum_duration_hours: number;
  sum_revenue_hours: number;
  sum_lesson_hours: number;
  sum_tutoring_hours: number;
  sum_testing_hours: number;
}

export interface Session {
  id?: string;
  syllabus_weekly_session_id?: string;
  order: number;
  week_day?: string;
  week_day_id?: string;
  day_start_time?: string;
  day_end_time?: string;
  skill_ids?: string[];
  skills?: string;
  start_time_unix: number;
  end_time_unix: number;
  day_start_time_ui?: string;
  day_end_time_ui?: string;
  teacher_id?: string;
  teacher_name?: string;

  teacher_full_name?: string;
  week_no?: number;
  week_day_ui?: string;
  room_id?: string;
  room_name?: string;
  session_type_id: string;
  class_weekly_session_id?: string;
  room: Room;
  teacher: Teacher;
  session_type: SessionType;
  session_type_name?: string;

  block?: number;
  duration_hours?: number;
  revenue_hours?: number;
  topic_theme?: string;
  unit?: string;
  checked: boolean;
  main_activities?: string;
  supplementary_materials?: string;
  homework?: string;
  teaching_notes?: string;
}

export interface WeeklySession {
  id?: string;
  order?: number;
  skill_ids?: string[];
  skills?: string;
  syllabus_weekly_session_id?: string;
  week_day?: string;
  day_start_time?: string;
  day_end_time?: string;
  teacher_id?: string;
  teacher_name?: string;
  room_id?: string;
  room?: Room;
  teacher?: Teacher;
}

export interface ClassList {
  id: string;
  name: string;
  syllabus_id: string;
  module_id: string;
  skill_ids: string[];
  skills: string;
  start_date: string;
  end_date: string;
  code: string;
  process?: string;
  teachers: Teacher[];
  rooms: Room[];
}

export interface RequestSearchTeachersAvailableSession {
  module_id: string;
  class_id?: string;
  class_sessions: ClassSessions[];
}

export interface ClassSessions {
  id?: string;
  skill_ids?: string[];
  start_time_unix: number;
  end_time_unix: number;
}

export interface RequestSearchRoomsAvailableSession {
  class_sessions: ClassSessions[];
  class_id?: string;
  attendees_count: number;
}
export interface WeeklyWeekDay{
  id: string;
  name: string;
}

export interface WeeklySessionTeacher {
  id: string;
  name: string;
}
export interface WeeklySessionSkill {
  id: string[];
  name: string;
}

