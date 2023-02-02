import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RequestSearchForm } from 'src/app/_core/helpers/utils.helper';
import { TeacherType } from 'src/app/_models/teacher.model';
import { ManageService } from 'src/app/_services/manage.service';
import { StudentService } from 'src/app/_services/student.service';
import { TeacherService } from 'src/app/_services/teacher.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'app-visitor-list',
  templateUrl: './visitor-list.component.html',
  styleUrls: ['./visitor-list.component.scss'],
})
export class VisitorListComponent implements OnInit {
  pageSize = Constants.SearchConstant.PageSize[10];
  searchVisitorForm!: FormGroup;
  loading = false;
  status: any[] = [];
  purposes: any[] = [];
  requestSearchForm = new RequestSearchForm();
  filterSearch!: any[];
  currentLanguage='';
  studentStudyPurpose: TeacherType[] = [];
  visitorList: any[] = [];
  Categories = Constants.Categories;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private teacherService: TeacherService,
    private studentService: StudentService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initSearchVisitorForm();
    this.getVisitor();
    this.getStudentStudyPurpose();
    this.currentLanguage = this.translate.getDefaultLang();
  }

  initSearchVisitorForm() {
    this.searchVisitorForm = this.fb.group({
      full_name: [null],
      mobile_phone: [null],
      status: [null],
      purposes: [null],
    });
  }
  getStudentStudyPurpose() {
    this.teacherService
      .getListCommonBycategories(this.Categories.studentStudyPurpose)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.studentStudyPurpose = res.data;
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
  getVisitor() {
    const requestSearchVisitorForm = {
      filters: this.filterSearch,
      page: this.requestSearchForm.page,
      page_size: this.requestSearchForm.page_size,
      sort_by: this.requestSearchForm.sort_by,
      sort_descending: this.requestSearchForm.sort_descending,
    };
    this.studentService.searchVisitors(requestSearchVisitorForm).subscribe((res: any) => {
    this.loading = false;
    var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
    if (response.isSuccess == true) {
      this.visitorList = res.data;
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
  getVisitorListFromSearch(){
    this.filterSearch = [];

    if (this.searchVisitorForm.value.full_name) {
      this.filterSearch.push({
        field: 'full_name',
        value_string: this.searchVisitorForm.value.full_name,
      });
    }
    if (this.searchVisitorForm.value.mobile_phone) {
      this.filterSearch.push({
        field: 'mobile_phone',
        value_string: this.searchVisitorForm.value.mobile_phone,
      });
    }
    if (this.searchVisitorForm.value.status ) {
      this.filterSearch.push({
        field: 'status',
        status: this.searchVisitorForm.value.status
       
      });
    } 
    if (this.searchVisitorForm.value.purposes && this.searchVisitorForm.value.purposes.length > 0) {
      this.filterSearch.push({
        field: 'study_purposes',
        value_uuid: this.searchVisitorForm.value.purposes,
      });
    }
    console.log("this.filterSearch", this.filterSearch);
    this.getVisitor();
  }

  onSearchVisitor() {
    this.getVisitorListFromSearch();
  }

  onClickDetailVisitor(data: any) {
    this.router.navigate([`student/visitor/detail/${data.id}`]);
  }
  createVisitor() {
    var newLink = 'student/visitor/create';
    this.router.navigate([newLink]);
  }
}
