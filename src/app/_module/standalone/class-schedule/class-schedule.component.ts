import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RequestSearchForm } from 'src/app/_core/helpers/utils.helper';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'app-class-schedule',
  templateUrl: './class-schedule.component.html',
  styleUrls: ['./class-schedule.component.scss'],
})
export class ClassScheduleComponent implements OnInit {
  scheduleList: any[] = [];
  
  loading = false;
  requestSearchClassForm = new RequestSearchForm();
  filterSearch!: any[];
  constructor(public translate: TranslateService, 
    private manageService: ManageService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    ) {
    translate.addLangs(Constants.Language);
    translate.setDefaultLang(Constants.Language[0]);
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {
    this.getClassSessionFromSearch();
  }

  getClassSessionFromSearch() {
    this.filterSearch = [];
    const date = new Date().toDateString();
    this.filterSearch.push({
      field: 'statuses',
      value_strings: ['Active'],
    });
    this.filterSearch.push({
      field: 'date',
      value_date_from: this.formatDate(date),
      value_date_to: this.formatDate(date)
    })

    const requestSearchClassForm = {
      filters: this.filterSearch,
      page: this.requestSearchClassForm.page,
      page_size: this.requestSearchClassForm.page_size,
      sort_by: "start_time",
      sort_descending: this.requestSearchClassForm.sort_descending,
    };

    this.manageService
      .class_searchClassSessions(requestSearchClassForm)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.scheduleList = res.data;
          console.log("this.scheduleList", this.scheduleList);
        } else {
          if (response.message == '') {
            this.messageService.error(
              this.translate.instant('Messages.SystemError')
            );
          } else {
            this.messageService.error(response.message);
          }
        }
      });
  }
  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }
}
