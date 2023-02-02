import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { concatMap } from 'rxjs/internal/operators/concatMap';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { tap } from 'rxjs/internal/operators/tap';
import { TeacherType } from 'src/app/_models/teacher.model';
import { DestroyService } from 'src/app/_services/destroy.service';
import { StudentService } from 'src/app/_services/student.service';
import { TeacherService } from 'src/app/_services/teacher.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'app-create-visitor',
  templateUrl: './create-visitor.component.html',
  styleUrls: ['./create-visitor.component.scss'],
})
export class CreateVisitorComponent implements OnInit {
  options = ['Thông tin', 'Test', 'Lộ trình', 'Khai giảng'];
  selectedIndex = 0;
  visitorDetailForm!: FormGroup;
  loading = false;
  isEdit = true;
  dateFormat = Constants.Format.Date.Short;
  studentStudyPurpose: TeacherType[] = [];
  studentStudyInterest: TeacherType[] = [];
  selectedStudentStudyPurpose = [];
  selectedStudentStudyInterest = [];
  visitorId: string = '';
  Categories = Constants.Categories;
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private ac: ActivatedRoute,
    private teacherService: TeacherService,
    private studentService: StudentService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private destroyService: DestroyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initVisitorDetailForm();
    this.getStudentStudyPurpose();
    this.getStudentStudyInterest();
  }

  initVisitorDetailForm() {
    this.visitorDetailForm = this.fb.group({
      full_name: ['', [Validators.required]],
      sex: [''],
      date_of_birth: [''],
      current_school: [''],
      home_address: [''],
      email: [''],
      mobile_phone: [''],
      parent_1_name: [''],
      parent_2_name: [''],
      parent_1_mobile: [''],
      parent_2_mobile: [''],
      learning_purposes: [''],
    });
  }

  onClickCancel() {

  }
  onCreateVisitor() {
    const requestCreateVisitor = {
      full_name: this.visitorDetailForm.value.full_name,
      sex: this.visitorDetailForm.value.sex,
      date_of_birth: this.visitorDetailForm.value.date_of_birth,
      current_school: this.visitorDetailForm.value.current_school,
      home_address: this.visitorDetailForm.value.home_address,
      email: this.visitorDetailForm.value.email,
      mobile_phone: this.visitorDetailForm.value.mobile_phone,
      parent_1_name: this.visitorDetailForm.value.parent_1_name,
      parent_1_mobile: this.visitorDetailForm.value.parent_1_mobile,
      parent_2_name: this.visitorDetailForm.value.parent_2_name,
      parent_2_mobile: this.visitorDetailForm.value.parent_2_mobile,
      study_purposes: {
        selected_ids: this.selectedStudentStudyPurpose,
        others: this.visitorDetailForm.value.learning_purposes
      },
      study_interests: {
        selected_ids: this.selectedStudentStudyInterest
      },
      note: this.visitorDetailForm.value.note,
    };
    this.studentService
    .addNewVisitor(requestCreateVisitor)
    .pipe(
      tap((res) => {
        console.log("res.data", res.data);
        this.visitorId = res.data;
      }),
      //concatMap((res: any) =>
        // this.studentService.updateTeacherCourses(
        //   res.data,
        //   this.getRequestUpdateTeacherCoursesFromTreeNode(
        //     dataNodesChange,
        //     keys
        //   )
       //  )
      //),
      takeUntil(this.destroyService.destroyed$)
    )
    .subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(
        res.meta,
        'Class.New'
      );
      if (response.isSuccess == true) {
        this.messageService.success(
          this.translate.instant('Messages.AddNewSuccess')
        );
        this.router.navigate([`student/visitor/detail/${this.visitorId}`]);
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

  studentStudyInterestChange(value: any) {
    this.selectedStudentStudyInterest = value;
  }

  studentStudyPurposeChange(value: any) {
    this.selectedStudentStudyPurpose = value;
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
  getStudentStudyInterest() {
    this.teacherService
      .getListCommonBycategories(this.Categories.studentStudyInterest)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.studentStudyInterest = res.data;
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

  get f() {
    return this.visitorDetailForm.controls;
  }
}
