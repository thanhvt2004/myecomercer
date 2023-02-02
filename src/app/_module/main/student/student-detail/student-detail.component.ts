import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, takeUntil } from 'rxjs';
import { TeacherType } from 'src/app/_models/teacher.model';
import { DestroyService } from 'src/app/_services/destroy.service';
import { ManageService } from 'src/app/_services/manage.service';
import { StudentService } from 'src/app/_services/student.service';
import { TeacherService } from 'src/app/_services/teacher.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';
import { Course } from 'src/app/_models/classes.model';
import { isBuffer } from 'lodash';
import { EntraceTest, StudentClass } from 'src/app/_models/student.model';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzTreeSelectComponent } from 'ng-zorro-antd/tree-select';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
})
export class StudentDetailComponent implements OnInit {
  currentLanguage = '';
  options = ['Thông tin', 'Danh sách lớp học'];
  dateFormat = Constants.Format.Date.Short;
  Categories = Constants.Categories;
  selectedIndex = 0;
  loading = false;
  isEdit = false;
  studentDetailForm!: FormGroup;
  studentId = '';
  studentDetail: any;
  studentStudyPurpose: any[] = [];
  studentStudyInterest: any[] = [];
  selectedStudentStudyPurpose: string[] = [];
  selectedStudentStudyInterest: string[] = [];
  studentClasses: StudentClass[] = [];

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private ac: ActivatedRoute,
    private teacherService: TeacherService,
    private studentService: StudentService,
    private manageService: ManageService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private destroyService: DestroyService
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.translate.getDefaultLang();
    this.studentId = this.ac.snapshot.paramMap.get('id') as string;
    this.getStudentDetail(this.studentId);
  }

  initStudentDetailForm(detail: any = null) {
    this.studentDetailForm = this.fb.group({
      full_name: [detail?.full_name],
      sex: [detail?.sex],
      date_of_birth: [detail?.date_of_birth],
      current_school: [detail?.current_school],
      home_address: [detail?.home_address],
      email: [detail?.email],
      mobile_phone: [detail?.mobile_phone],
      parent_1_name: [detail?.parent_1_name],
      parent_2_name: [detail?.parent_2_name],
      parent_1_mobile: [detail?.parent_1_mobile],
      parent_2_mobile: [detail?.parent_2_mobile],
      learning_purposes: [detail?.study_purposes?.others],
    });

    this.studentDetailForm.disable();
  }

  getStudentDetail(studentId: string) {
    this.studentService.getStudentDetail(studentId).subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
       this.studentDetail = res.data;
       this.studentStudyPurpose = res.data.study_purposes?.items;
       this.studentStudyInterest = res.data.study_interests?.items;
       const seletedStudentStudPurpose = res.data.study_purposes?.items.find(
         (x: any) => x.selected === true
       );
       if (seletedStudentStudPurpose && seletedStudentStudPurpose.length > 0) {
         seletedStudentStudPurpose.array.forEach((element: any) => {
           this.selectedStudentStudyPurpose.push(element.id);
         });
       }
       const selectedStudentStudyInterest =
         res.data.study_interests?.items.find((x: any) => x.selected === true);
       if (
         selectedStudentStudyInterest &&
         selectedStudentStudyInterest.length > 0
       ) {
         selectedStudentStudyInterest.array.forEach((element: any) => {
           this.selectedStudentStudyInterest.push(element.id);
         });
       }
       this.initStudentDetailForm(res.data);
       this.getStudentClass();
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

  getStudentClass() {
    this.studentService.getStudentClass(this.studentId).subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
       this.studentClasses = res.data;
       console.log("studentClasses", this.studentClasses);
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
  
  onSaveStudentDetail() {
    const requestUpdateStudent = {
      full_name: this.studentDetailForm.value.full_name,
      sex: this.studentDetailForm.value.sex,
      date_of_birth: this.studentDetailForm.value.date_of_birth,
      current_school: this.studentDetailForm.value.current_school,
      home_address: this.studentDetailForm.value.home_address,
      email: this.studentDetailForm.value.email,
      mobile_phone: this.studentDetailForm.value.mobile_phone,
      parent_1_name: this.studentDetailForm.value.parent_1_name,
      parent_1_mobile: this.studentDetailForm.value.parent_1_mobile,
      parent_2_name: this.studentDetailForm.value.parent_2_name,
      parent_2_mobile: this.studentDetailForm.value.parent_2_mobile,
      study_purposes: {
        selected_ids: this.selectedStudentStudyPurpose,
        others: this.studentDetailForm.value.learning_purposes,
      },

      
      study_interests: {
        selected_ids: this.selectedStudentStudyInterest,
      },
      note: this.studentDetailForm.value.note,
    };

    forkJoin([
      this.studentService.updateStudentDetail(
        this.studentId,
        requestUpdateStudent
      ),
    ])
      .pipe(takeUntil(this.destroyService.destroyed$))
      .subscribe(
        () => {
          this.messageService.success(
            this.translate.instant(
              'Modules.Student.Message.UpdateStudentSuccess'
            )
          );
          this.isEdit = false;
          this.getStudentDetail(this.studentId);
        },
        () => {
          this.messageService.error(
            this.translate.instant(
              'Modules.Student.Message.UpdateStudentFailed'
            )
          );
        }
      );
  }
  onClickCancel() {
    this.isEdit = false;
    this.studentDetailForm.disable();
  }
  onClickEditStudent() {
    this.isEdit = true;
    this.studentDetailForm.enable();
  }

 
  get f() {
    return this.studentDetailForm.controls;
  }
}
