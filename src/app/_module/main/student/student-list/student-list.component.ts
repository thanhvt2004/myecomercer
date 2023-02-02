import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RequestSearchForm } from 'src/app/_core/helpers/utils.helper';
import { StudentService } from 'src/app/_services/student.service';
import { TeacherService } from 'src/app/_services/teacher.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';
import { ClassList, Course } from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  pageSize = Constants.SearchConstant.PageSize[10];
  loading = false;
  currentLanguage='';
  dateFormat = Constants.Format.Date.Short;
  searchStudentForm!: FormGroup;
  requestSearchForm = new RequestSearchForm();
  filterSearch!: any[];
  studentList: any[] = [];
  courses: Course[] = [];
  isCollapse = true;
  constructor(  
    private fb: FormBuilder,
    private router: Router,
    private teacherService: TeacherService ,
    private manageService: ManageService,
    private studentService: StudentService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private translate: TranslateService
  ){
  }

  ngOnInit(): void {
    this.initSearchStudentForm();
    this.getCourses();
    this.getStudent();
    this.currentLanguage = this.translate.getDefaultLang();
  }
  initSearchStudentForm() {
    this.searchStudentForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      classCode: [null],
      course_ids: [null],
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
  getStudent() {
    const requestSearchStudentForm = {
      filters: this.filterSearch,
      page: this.requestSearchForm.page,
      page_size: this.requestSearchForm.page_size,
      sort_by: this.requestSearchForm.sort_by,
      sort_descending: this.requestSearchForm.sort_descending,
    };
    this.studentService.searchStudents(requestSearchStudentForm).subscribe((res: any) => {
    this.loading = false;
    var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
    if (response.isSuccess == true) {
      this.studentList = res.data;
      console.log("student list", this.studentList);
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
  getStudentListFromSearch(){
    this.filterSearch = [];

    if (this.searchStudentForm.value.endDate &&
      this.searchStudentForm.value.startDate) {
      this.filterSearch.push({
        field: 'date',
        value_date_from: this.formatDate(this.searchStudentForm.value.startDate),
        value_date_to: this.formatDate(this.searchStudentForm.value.endDate),
      });
    }
    if (this.searchStudentForm.value.classCode) {
      this.filterSearch.push({
        field: 'class_code',
        value_string: this.searchStudentForm.value.classCode,
      });
    }
    if (this.searchStudentForm.value.courseIds ) {
      this.filterSearch.push({
        field: 'course_ids',
        status: this.searchStudentForm.value.courseIds
       
      });
    } 
    this.getStudent();
  }

  onSearchStudent() {
    this.getStudentListFromSearch();
  }
  onClickDetailStudent(data: any){
    this.router.navigate([`student/student/detail/${data.id}`]);
  }

    //ADVANCED SEARCH
    onCoursesChange(event: any) {}
    
  resetForm(): void {
    this.searchStudentForm.reset();
  }

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }
  
    //END ADVANCED SEARCH
  
  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }
}
