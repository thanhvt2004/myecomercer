import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceUrl } from '../_share/constants/service-url.constants';
import { StringHelper } from '../_share/_helper/string.helper';
//import { ServiceUrl } from '../_share/constants/service-url.constants';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class ManageService {
  constructor(
    private baseApiService: BaseApiService,
    private stringHelper: StringHelper
  ) {}

  class_getCourses(): Observable<any> {
    return this.baseApiService.get(ServiceUrl.APIURL.Class.GetCourses);
  }

  class_getLevels(course_id: string): Observable<any> {
    var url = this.stringHelper.GetUrl(ServiceUrl.APIURL.Class.GetLevels, [
      course_id,
    ]);
    return this.baseApiService.get(url);
  }

  class_getModules(level_id: string): Observable<any> {
    var url = this.stringHelper.GetUrl(ServiceUrl.APIURL.Class.GetModules, [
      level_id,
    ]);
    return this.baseApiService.get(url);
  }

  class_getSyllabuses(module_id: string): Observable<any> {
    var url = this.stringHelper.GetUrl(ServiceUrl.APIURL.Class.GetSyllabuses, [
      module_id,
    ]);
    return this.baseApiService.get(url);
  }
  class_getCourseSkills(course_id: string): Observable<any> {
    var url = this.stringHelper.GetUrl(ServiceUrl.APIURL.Class.GetCoursesSkill, [
      course_id,
    ]);
    return this.baseApiService.get(url);
  }
  class_getCourseAndChildrent(isInclude: string) {
    var url = this.stringHelper.GetUrl(ServiceUrl.APIURL.Class.GetCourseAndChildrent, [
      isInclude,
    ]);
    return this.baseApiService.get(url);
  }

  class_getSkills(): Observable<any> {
    return this.baseApiService.get(ServiceUrl.APIURL.Class.GetSkills);
  }

  class_getRoomsAvailable(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Class.GetRoomsAvailable,
      request
    );
  }

  class_getDetailSyllabus(syllabus_id: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Class.GetSyllabusDetail}/${syllabus_id}`
    );
  }

  class_searchTeachersAvailable(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Class.SearchTeachersAvailable,
      request
    );
  }

  class_generateWeeklySession(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Class.GenerateWeeklySession,
      request
    );
  }

  class_generateExistedClassSession(
    classId: string,
    request: any
  ): Observable<any> {
    var url = this.stringHelper.GetUrl(
      ServiceUrl.APIURL.Class.GenerateExistedClassSession,
      [classId]
    );
    return this.baseApiService.post(url, request);
  }

  class_addNewClass(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Class.AddNewClass,
      request
    );
  }

  class_searchClasses(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Class.SearchClasses,
      request
    );
  }

  class_getTeachers(): Observable<any> {
    return this.baseApiService.get(ServiceUrl.APIURL.Class.GetTeachers);
  }

  class_getRooms(): Observable<any> {
    return this.baseApiService.get(ServiceUrl.APIURL.Class.GetRooms);
  }

  class_getClassDetail(classId: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Class.AddNewClass}/${classId}`
    );
  }

  class_updateClass(classId: string, request: any): Observable<any> {
    return this.baseApiService.put(
      `${ServiceUrl.APIURL.Class.AddNewClass}/${classId}`,
      request
    );
  }

  class_getSessionTypes(): Observable<any> {
    return this.baseApiService.get(ServiceUrl.APIURL.Class.GetSessionTypes);
  }

  class_searchClassSessions(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Class.SearchClassSessions,
      request
    );
  }
}
