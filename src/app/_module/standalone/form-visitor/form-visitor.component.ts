import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Constants } from 'src/app/_share/constants/constants';
import { ServiceUrl } from 'src/app/_share/constants/service-url.constants';
import { TeacherService } from 'src/app/_services/teacher.service';
import { StudentService } from 'src/app/_services/student.service';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { TeacherType } from 'src/app/_models/teacher.model';

@Component({
  selector: 'app-form-visitor',
  templateUrl: './form-visitor.component.html',
  styleUrls: ['./form-visitor.component.scss'],
})
export class FormVisitorComponent implements OnInit {
  visitorForm!: FormGroup;
  loading = false;
  isHidden = false;
  dateFormat = Constants.Format.Date.Short;
  studentStudyPurpose: TeacherType[] = [];
  studentStudyInterest: TeacherType[] = [];
  selectedStudentStudyPurpose = [];
  selectedStudentStudyInterest = [];
  Categories = Constants.Categories;
    constructor(
      private fb: FormBuilder, 
      private messageService: NzMessageService,
      private translate: TranslateService,
      private teacherService: TeacherService,
      private studentService: StudentService,
      private apiResponseHelper: ApiResponseHelper,) {
  }

  ngOnInit(): void {
    this.initVisitorForm();
    this.getStudentStudyPurpose();
    this.getStudentStudyInterest();
  }

  initVisitorForm() {
    this.visitorForm = this.fb.group({
      full_name: [''],
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

  onCreateVisitor() {
    console.log("this.createTeacherForm", this.visitorForm);
    const requestCreateVisitor = {
      full_name: this.visitorForm.value.full_name,
      sex: this.visitorForm.value.sex,
      date_of_birth: this.visitorForm.value.date_of_birth,
      current_school: this.visitorForm.value.current_school,
      home_address: this.visitorForm.value.home_address,
      email: this.visitorForm.value.email,
      mobile_phone: this.visitorForm.value.mobile_phone,
      parent_1_name: this.visitorForm.value.parent_1_name,
      parent_1_mobile: this.visitorForm.value.parent_1_mobile,
      parent_2_name: this.visitorForm.value.parent_2_name,
      parent_2_mobile: this.visitorForm.value.parent_2_mobile,
      study_purposes: {
        selected_ids: this.selectedStudentStudyPurpose,
        others: this.visitorForm.value.learning_purposes
      },
      study_interests: {
        selected_ids: this.selectedStudentStudyInterest
      },
      note: this.visitorForm.value.note,
    };
    this.studentService
    .addNewVisitor(requestCreateVisitor)
    .subscribe((res: any) => {
      this.loading = false;
      console.log("res", res);
      var response = this.apiResponseHelper.ProcessData(
        res.meta,
        'Class.New'
      );
      console.log("response", response);
      if (response.isSuccess == true) {
        this.messageService.success(
          this.translate.instant('Messages.AddNewSuccess')
        );
        this.initVisitorForm();
        this.selectedStudentStudyInterest = [];
        this.selectedStudentStudyPurpose = [];
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

}
