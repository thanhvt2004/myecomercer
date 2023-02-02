import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RequestSearchForm } from 'src/app/_core/helpers/utils.helper';
import {
  ClassList,
  Course,
  Room,
  Teacher,
} from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss'],
})
export class ClassListComponent implements OnInit {
  //DECLARE VARIABLES
  searchClassForm!: FormGroup;
  isCollapse = true;
  loading = false;
  courses: Course[] = [];
  teachers: Teacher[] = [];
  rooms: Room[] = [];
  classList: ClassList[] = [];

  pageSize = Constants.SearchConstant.PageSize[10];
  dateFormat = Constants.Format.Date.Short;

  requestSearchClassForm = new RequestSearchForm();
  filterSearch!: any[];

  date = new Date();
  defaultStartDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  defaultEndDate = new Date(
    this.date.getFullYear(),
    this.date.getMonth() + 1,
    0
  );
  //END DECLARE VARIABLES

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private manageService: ManageService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initSearchClassForm();
    this.getTeachers();
    this.getRooms();
    this.getCourses();
    this.getClassListFromSearch();
  }

  initSearchClassForm() {
    this.searchClassForm = this.fb.group({
      startDate: [this.defaultStartDate],
      endDate: [this.defaultEndDate],
      code: [''],
      course_ids: [[]],
      teacher_ids: [[]],
      room_ids: [[]],
    });
  }

  //CLASS LIST
  getClassListFromSearch() {
    this.filterSearch = [];

    if (this.searchClassForm.value.code) {
      this.filterSearch.push({
        field: 'code',
        value_string: this.searchClassForm.value.code,
      });
    }
    if (
      this.searchClassForm.value.endDate &&
      this.searchClassForm.value.startDate
    ) {
      this.filterSearch.push({
        field: 'date',
        value_date_from: this.formatDate(this.searchClassForm.value.startDate),
        value_date_to: this.formatDate(this.searchClassForm.value.endDate),
      });
    } else {
      return;
    }

    if (this.searchClassForm.value.course_ids.length > 0) {
      this.filterSearch.push({
        field: 'course_ids',
        value_uuid: this.searchClassForm.value.course_ids,
      });
    }
    if (this.searchClassForm.value.teacher_ids.length > 0) {
      this.filterSearch.push({
        field: 'teacher_ids',
        value_uuid: this.searchClassForm.value.teacher_ids,
      });
    }
    if (this.searchClassForm.value.room_ids.length > 0) {
      this.filterSearch.push({
        field: 'room_ids',
        value_uuid: this.searchClassForm.value.room_ids,
      });
    }

    const requestSearchClassForm = {
      filters: this.filterSearch,
      page: this.requestSearchClassForm.page,
      page_size: this.requestSearchClassForm.page_size,
      sort_by: this.requestSearchClassForm.sort_by,
      sort_descending: this.requestSearchClassForm.sort_descending,
    };

    this.manageService
      .class_searchClasses(requestSearchClassForm)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.classList = res.data;
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

  onSearchClass() {
    this.getClassListFromSearch();
  }
  //END CLASS LIST

  resetForm(): void {
    this.searchClassForm.reset();
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
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

  getCourses() {
    this.manageService.class_getCourses().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.courses = res.data;
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

  createClass() {
    var newLink = '/class/new/';
    this.router.navigate([newLink]);
  }

  //ADVANCED SEARCH
  onCoursesChange(event: any) {}
  onTeachersChange(event: any) {}
  onRoomsChange(event: any) {}

  //END ADVANCED SEARCH

  //TABLE
  onClickDetailClass(data: any) {
    this.router.navigate([`/class/detail/${data.id}`]);
  }

  //FORMAT DATE
  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }
}
