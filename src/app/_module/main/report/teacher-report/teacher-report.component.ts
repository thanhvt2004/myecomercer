import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { Day } from '@progress/kendo-date-math';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { parseAdjust } from 'src/app/_core/helpers/utils.helper';
import { Room, Teacher } from 'src/app/_models/classes.model';
import { Report } from 'src/app/_models/report.model';
import { ManageService } from 'src/app/_services/manage.service';
import { ReportService } from 'src/app/_services/report.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'app-teacher-report',
  templateUrl: './teacher-report.component.html',
  styleUrls: ['./teacher-report.component.scss'],
})
export class TeacherReportComponent implements OnInit {
  searchTeacherReportForm!: FormGroup;
  loading = false;
  teachers: Teacher[] = [];
  rooms: Room[] = [];

  dateFormat = Constants.Format.Date.Short;
  date = new Date();
  defaultStartDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  defaultEndDate = new Date(
    this.date.getFullYear(),
    this.date.getMonth() + 1,
    0
  );

  public selectedViewIndex = 2;
  selectedDate: Date = new Date();
  baseData: any[] = [];
  sampleData: any[] = [];
  events: SchedulerEvent[] = [];
  weekStart: Day = Day.Monday;
  resultReport: Report[] = [];
  constructor(
    private fb: FormBuilder,
    private manageService: ManageService,
    private reportService: ReportService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initSearchTeacherReportForm();
    this.getTeachers();
    this.getRooms();
  }

  initSearchTeacherReportForm() {
    this.searchTeacherReportForm = this.fb.group({
      startDate: [this.defaultStartDate],
      endDate: [this.defaultEndDate],
      select: ['teacher'],
      teacher_ids: [''],
      room_ids: [{ value: '', disabled: true }],
    });
  }

  getTeachers() {
    this.manageService.class_getTeachers().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.teachers = res.data?.sort((a: any, b: any) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
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

  getRooms() {
    this.manageService.class_getRooms().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.rooms = res.data?.sort((a: any, b: any) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
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
  onSearch() {
    this.reportService
      .searchReport(this.searchTeacherReportForm.getRawValue())
      .subscribe((res: any) => {
        this.loading = false;
        this.resultReport = res.data;

        this.baseData = [];
        this.resultReport.forEach((item: any) => {
          this.baseData.push({
            TaskID: item.id,
            Title: item.title,
            Start: this.formatUnixTimestampToISODate(item.start_time_unix),
            End: this.formatUnixTimestampToISODate(item.end_time_unix),
            IsAllDay: false,
          });
        });

        this.sampleData = this.baseData.map(
          (dataItem) =>
            <SchedulerEvent>{
              id: dataItem.TaskID,
              start: parseAdjust(dataItem.Start),
              end: parseAdjust(dataItem.End),
              isAllDay: dataItem.IsAllDay,
              title: dataItem.Title,
            }
        );
        this.events = this.sampleData;
      });
  }

  onChangeSelect(event: string) {
    if (event === 'room') {
      this.f['room_ids'].enable();
      this.f['teacher_ids'].disable();
    } else {
      this.f['room_ids'].disable();
      this.f['teacher_ids'].enable();
    }
  }

  onDateChangeSchedule(event: any) {
    this.searchTeacherReportForm.controls['startDate'].setValue(
      this.formatDate(event.dateRange.start)
    );
    this.searchTeacherReportForm.controls['endDate'].setValue(
      this.formatDate(event.dateRange.end)
    );
    this.onSearch();
  }

  //FORMAT DATE
  formatUnixTimestampToISODate(value: number) {
    const newValue = new Date(value * 1000).toISOString();
    return moment(newValue);
  }

  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }

  get f() {
    return this.searchTeacherReportForm.controls;
  }
}
