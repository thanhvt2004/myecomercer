import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ServiceUrl } from '../_share/constants/service-url.constants';
import { StringHelper } from '../_share/_helper/string.helper';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(
    private baseApiService: BaseApiService,
    private stringHelper: StringHelper
  ) {}

  searchReport(formValue: any): Observable<any> {
    const { startDate, endDate, select, room_ids, teacher_ids } = formValue;
    const formatStartDate = moment(startDate).format('YYYY-MM-DD');
    const formatEndDate = moment(endDate).format('YYYY-MM-DD');
    return this.baseApiService.get(
      `${ServiceUrl.APIURL.Report.Search}/${select}/${
        select === 'teacher' ? teacher_ids : room_ids
      }?start-date=${formatStartDate}&end-date=${formatEndDate}`
    );
  }
}
