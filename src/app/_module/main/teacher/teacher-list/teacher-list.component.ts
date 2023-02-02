import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, debounceTime } from 'rxjs';
import { RequestSearchForm } from 'src/app/_core/helpers/utils.helper';
import {
  Course,
  Skill,
  Teacher,
  TeacherRank,
} from 'src/app/_models/classes.model';
import { switchMap } from 'rxjs/operators';
import { ManageService } from 'src/app/_services/manage.service';
import { TeacherService } from 'src/app/_services/teacher.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'app-teacher-list',
  templateUrl: './teacher-list.component.html',
  styleUrls: ['./teacher-list.component.scss'],
})
export class TeacherListComponent implements OnInit {
  searchTeacherForm!: FormGroup;
  pageSize = Constants.SearchConstant.PageSize[10];
  dateFormat = Constants.Format.Date.Short;
  isCollapse = true;
  loading = false;
  teachers: Teacher[] = [];
  classes: any[] = [];
  ranks: TeacherRank[] = [];
  teacherList: any[] = [
    {
      code: 1,
      name: 'MYPA',
      type: 'Vietnam',
      salary: 'S1',
      kpi: '50%',
      level: 'IELTS',
      process: '65%',
    },
    {
      code: 1,
      name: 'MYPA',
      type: 'Vietnam',
      salary: 'S1',
      kpi: '50%',
      level: 'IELTS',
      process: '65%',
    },
    {
      code: 1,
      name: 'MYPA',
      type: 'Vietnam',
      salary: 'S1',
      kpi: '50%',
      level: 'IELTS',
      process: '65%',
    },
    {
      code: 1,
      name: 'MYPA',
      type: 'Vietnam',
      salary: 'S1',
      kpi: '50%',
      level: 'IELTS',
      process: '65%',
    },
  ];
  skills: Skill[] = [];
  requestSearchTeacherForm = new RequestSearchForm();
  filterSearch!: any[];
  searchChange$ = new Subject();
  classes$ = new Subject<Array<any>>();
  classesObs$ = this.classes$.asObservable();
  isLoadingSearch = false;
  date = new Date();
  defaultStartDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  defaultEndDate = new Date(
    this.date.getFullYear(),
    this.date.getMonth() + 1,
    0
  );
  courses: Course[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private manageService: ManageService,
    private teacherService: TeacherService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initSearchTeacherForm();
    this.getTeachers();
    this.getSkills();
    this.getListClass();
    this.getCourses();
    this.getTeacherListFromSearch();
    this.onChangeLanguage();
  }

  initSearchTeacherForm() {
    this.searchTeacherForm = this.fb.group({
      startDate: [this.defaultStartDate],
      endDate: [this.defaultEndDate],
      code: [''],
      teacher_ids: [[]],
      class_ids: [[]],
      course_ids: [[]],
      skill_ids: [[]],
    });
  }

  //ADVANCED SEARCH
  resetForm(): void {
    this.searchTeacherForm.reset();
  }

  onSearch(value: string) {
    if (!value || value.length < 3) return;
    this.searchChange$.next(value);
  }
  getListClass() {
    this.searchChange$
      .asObservable()
      .pipe(
        debounceTime(700),
        switchMap((res) => this.teacherService.getListClass(res as string))
      )
      .subscribe((res) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.classes$.next(
            res.data?.sort((a: any, b: any) => {
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
            })
          );
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

  getSkills() {
    this.manageService.class_getSkills().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.skills = res.data;
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

  //TEACHER LIST
  getTeacherListFromSearch() {
    this.filterSearch = [];

    if (this.searchTeacherForm.value.code) {
      this.filterSearch.push({
        field: 'code',
        value_string: this.searchTeacherForm.value.code,
      });
    }
    if (
      this.searchTeacherForm.value.endDate &&
      this.searchTeacherForm.value.startDate
    ) {
      this.filterSearch.push({
        field: 'date',
        value_date_from: this.formatDate(
          this.searchTeacherForm.value.startDate
        ),
        value_date_to: this.formatDate(this.searchTeacherForm.value.endDate),
      });
    } else {
      return;
    }
    if (this.searchTeacherForm.value.class_ids.length > 0) {
      this.filterSearch.push({
        field: 'class_ids',
        value_uuid: this.searchTeacherForm.value.class_ids,
      });
    }

    if (this.searchTeacherForm.value.teacher_ids.length > 0) {
      this.filterSearch.push({
        field: 'ids',
        value_uuid: this.searchTeacherForm.value.teacher_ids,
      });
    }
    if (this.searchTeacherForm.value.skill_ids.length > 0) {
      this.filterSearch.push({
        field: 'skill_ids',
        value_uuid: this.searchTeacherForm.value.skill_ids,
      });
    }
    if (this.searchTeacherForm.value.course_ids.length > 0) {
      this.filterSearch.push({
        field: 'course_ids',
        value_uuid: this.searchTeacherForm.value.course_ids,
      });
    }

    const requestSearchTeacherForm = {
      filters: this.filterSearch,
      page: this.requestSearchTeacherForm.page,
      page_size: this.requestSearchTeacherForm.page_size,
      sort_by: this.requestSearchTeacherForm.sort_by,
      sort_descending: this.requestSearchTeacherForm.sort_descending,
    };

    this.teacherService
      .searchTeachers(requestSearchTeacherForm)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.teacherList = res.data;
          if (this.translate.getDefaultLang() === 'vi') {
            this.teacherList.forEach((item) => {
              item.type_value_ui = item.type_value_vi;
            });
          } else {
            this.teacherList.forEach((item) => {
              item.type_value_ui = item.type_value;
            });
          }
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

  onSearchTeacher() {
    this.getTeacherListFromSearch();
  }

  onClickDetailTeacher(data: any) {
    this.router.navigate([`/teacher/detail/${data.id}`]);
  }
  //END TEACHER LIST

  //ADD NEW TEACHER

  createTeacher() {
    var newLink = '/teacher/create';
    this.router.navigate([newLink]);
  }

  //CHANGE LANG
  onChangeLanguage() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (event.lang === 'vi') {
        this.teacherList.forEach((item) => {
          item.type_value_ui = item.type_value_vi;
        });
      } else {
        this.teacherList.forEach((item) => {
          item.type_value_ui = item.type_value;
        });
      }
    });
  }

  //FORMAT DATE
  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }
}
