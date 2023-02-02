import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceUrl } from '../_share/constants/service-url.constants';
import { StringHelper } from '../_share/_helper/string.helper';
//import { ServiceUrl } from '../_share/constants/service-url.constants';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class StudentService {



  constructor(
    private baseApiService: BaseApiService,
    private stringHelper: StringHelper
  ) {}

  addNewVisitor(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Visitor.AddNewVisitor,
      request
    );
  }
  getvisitorDetail(visitorId: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Visitor.Visitors}/${visitorId}`
    );
  }
  searchVisitors(request: any): Observable<any> {
    return this.baseApiService.post(
      ServiceUrl.APIURL.Visitor.SearchVisitors,
      request
    );
  }
  updateVisitorDetail(visitorId: string, request: any): Observable<any> {
    return this.baseApiService.put(
      `${ServiceUrl.APIURL.Visitor.Visitors}/${visitorId}`,
      request
    );
  }
  getVisitorHistory(visitorId: string) {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Visitor.Visitors}/${visitorId}/visit-histories`
    );;
  }
  addNewVisitorHistory(visitorId: string, request: any): Observable<any> {
    return this.baseApiService.post(
      `${ServiceUrl.APIURL.Visitor.Visitors}/${visitorId}/visit-histories`,
      request
    );
  }
  editVisitorHistory(visitorHistoryId: any, request: any) {
    return this.baseApiService.put(
      `${ServiceUrl.APIURL.Visitor.VisitorHistories}/${visitorHistoryId}`,
      request
    );
  }
  getEntranceTest(visitorId: string) {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Visitor.Visitors}/${visitorId}/entrance-tests`
    );
  }
  addNewEntranceTest(visitorId: string, request: any): Observable<any> {
    return this.baseApiService.post(
      `${ServiceUrl.APIURL.Visitor.Visitors}/${visitorId}/entrance-tests`,
      request
    );
  }
  editEntranceTest(visitorEntranceTestId: any, request: any) {
    return this.baseApiService.put(
      `${ServiceUrl.APIURL.Visitor.VisitorEntranceTests}/${visitorEntranceTestId}`,
      request
    );
  }
  generateEntranceTest(request: any) {
    return this.baseApiService.post(
      `${ServiceUrl.APIURL.Visitor.VisitorEntranceTests}/generate`,
      request
    );
  }
  getStudyRouter(visitorId: string) {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Visitor.Visitors}/${visitorId}/study-routes`
    );
  }
  getStudyRouteDetail(studyRouterId: string) {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Visitor.VisitorStudyRoute}/${studyRouterId}`
    );
  }
  generateStudyRoute(request: any) {
    return this.baseApiService.post(
      `${ServiceUrl.APIURL.Visitor.VisitorStudyRoute}/generate`,
      request
    );
  }
  createStudyRoute(request: any, visitorId: string) {
    return this.baseApiService.post(
      `${ServiceUrl.APIURL.Visitor.Visitors}/${visitorId}/study-routes`,
      request
    );
  }
  updateStudyRoute(request: any, studyRouteId: string) {
    return this.baseApiService.put(
      `${ServiceUrl.APIURL.Visitor.VisitorStudyRoute}/${studyRouteId}`,
      request
    );
  }
  searchStudents(request: any): Observable<any> {
    return this.baseApiService.post(
      `${ServiceUrl.APIURL.Student.Students}/search`,
      request
    );
  }
  getStudentDetail(studentId: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Student.Students}/${studentId}`
    );
  }
  updateStudentDetail(studentId: string, request: any): Observable<any> {
    return this.baseApiService.put(
      `${ServiceUrl.APIURL.Student.Students}/${studentId}`,
      request
    );
  }
  getStudentClass(studentId: string): Observable<any> {
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Student.Students}/${studentId}/classes`
    );
  }
}

