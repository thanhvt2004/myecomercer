// import { Key } from 'protractor';

interface Dictionary<T> {
  [Key: string]: T;
}
export class ServiceUrl {
  public static APIURL = {
    Class: {
      GetCourses: 'courses',
      GetLevels: 'courses/{0}/levels',
      GetModules: 'levels/{0}/modules',
      GetSyllabuses: 'syllabuses?module-id={0}',
      GetCoursesSkill: 'courses/{0}/skills',
      GetCourseAndChildrent: 'courses?including-children={0}',
      DeleteMulti: 'Product',
      Search: 'Product/Search',
      GetSkills: 'skills',
      GetRoomsAvailable: 'rooms/available',
      GetSyllabusDetail: 'syllabuses',
      SearchTeachersAvailable: 'teachers/available',
      GenerateWeeklySession: 'class-sessions/generate',
      GenerateExistedClassSession: 'classes/{0}/sessions/generate',
      AddNewClass: 'classes',
      SearchClasses: 'classes/search',
      GetTeachers: 'teachers',
      GetRooms: 'rooms',
      GetSessionTypes: 'session-types',
      SearchClassSessions: 'class-sessions/search',
    },
    Teacher: {
      SearchTeachers: 'teachers/search',
      Teachers: 'teachers',
      Rank: 'teacher-ranks',
      CommonData: 'common-data',
      Courses: 'courses',
    },
    Report: {
      Search: 'calendar',
    },
    Visitor: {
      AddNewVisitor: 'visitors',
      Visitors: 'visitors',
      SearchVisitors: 'visitors/search',
      VisitorHistories: 'visit-histories',
      VisitorEntranceTests: 'visitor-entrance-tests',
      VisitorStudyRoute: 'visitor-study-routes'
    },
    Student: {
      Students: 'students'
    }
  };
}
