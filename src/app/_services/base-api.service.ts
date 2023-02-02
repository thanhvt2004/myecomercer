import { timeout } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  
  constructor(private http: HttpClient) { }

  get<T>(uri: string, data?: any): Observable<T> {
    return this.http.get<T>(environment.apiUrl + environment.apiVersion + environment.tennant + uri, { params: data });
  }
  post<T>(uri: string, data?: any): Observable<T> {
    return this.http.post<T>(environment.apiUrl + environment.apiVersion + environment.tennant + uri, data);
  }
  put<T>(uri: string, data?: any): Observable<T> {
    return this.http.put<T>(environment.apiUrl + environment.apiVersion + environment.tennant + uri, data);
  }
  delete<T>(uri: string, key: string, id: string): Observable<T> {
    return this.http.delete<T>(environment.apiUrl + environment.apiVersion + environment.tennant + uri + "/?" + key + "=" + id);
  }
  deleteSingle<T>(uri: string, id: string): Observable<T> {
    return this.http.delete<T>(environment.apiUrl + environment.apiVersion + environment.tennant + uri +"/" + id);
  }

  postFile<T>(uri: string, data?: any): Observable<T> {
    return this.http.post<T>(environment.apiUrl + environment.apiVersion + environment.tennant + uri, data);
  }
  getQueryString<T>(uri: string, key?: any, format?: string, id?: string): Observable<T> {
    return this.http.get<T>(environment.apiUrl + environment.apiVersion + environment.tennant + uri + "/" + id + "/?" + key + "=" + format);
  }
  downloadFile(uri: string, data?: any): Observable<any>{
    return this.http.post(environment.apiUrl + environment.apiVersion + environment.tennant + uri, data, { observe: 'response', responseType: 'blob' } );
  }
  
  protected handleError(errorResponse: any) {
    if (errorResponse.error.message) {
        return throwError(errorResponse.error.message || 'Server error');
    }

    if (errorResponse.error.errors) {
        let modelStateErrors = '';

        // for now just concatenate the error descriptions, alternative we could simply pass the entire error response upstream
        for (const errorMsg of errorResponse.error.errors) {
            modelStateErrors += errorMsg + '<br/>';
        }
        return throwError(modelStateErrors || 'Server error');
    }
    return throwError('Server error');
}
}
