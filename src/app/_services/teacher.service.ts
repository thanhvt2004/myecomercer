import { Injectable } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ServiceUrl } from '../_share/constants/service-url.constants';
import { StringHelper } from '../_share/_helper/string.helper';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  constructor(
    private baseApiService: BaseApiService,
    private stringHelper: StringHelper
  ) {}

  searchTeachers(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Teacher.SearchTeachers,
      request
    );
  }

  getTeacherDetail(teacherId: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Teacher.Teachers}/${teacherId}`
    );
  }

  getTeacherRank(): Observable<any> {
    return this.baseApiService.get(`${ServiceUrl.APIURL.Teacher.Rank}`);
  }

  getListClass(value: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Class.AddNewClass}?keyword=${value}`
    );
  }

  getListCourseTeacher(teacherId: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Teacher.Teachers}/${teacherId}/courses`
    );
  }

  updateTeacherDetail(teacherId: string, request: any): Observable<any> {
    return this.baseApiService.put(
      `${ServiceUrl.APIURL.Teacher.Teachers}/${teacherId}`,
      request
    );
  }

  updateTeacherCourses(teacherId: string, request: any): Observable<any> {
    return this.baseApiService.put(
      `${ServiceUrl.APIURL.Teacher.Teachers}/${teacherId}/courses`,
      request
    );
  }

  getListCommonBycategories(categories: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Teacher.CommonData}?categories=${categories}`
    );
  }

  createTeacher(request: any): Observable<any> {
    return this.baseApiService.post(
      `${ServiceUrl.APIURL.Teacher.Teachers}`,
      request
    );
  }

  getAllCoursesCommon(): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Teacher.Courses}?including-children=true`
    );
  }
}
