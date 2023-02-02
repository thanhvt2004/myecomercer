import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Course, Session, Teacher } from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';
import { EntraceTestExam } from 'src/app/_models/student.model';
import { StudentService } from 'src/app/_services/student.service';

@Component({
  selector: 'aio-modal-visitor-entrance-test',
  templateUrl: './modal-visitor-entrance-test.component.html',
  styleUrls: ['./modal-visitor-entrance-test.component.scss'],
})
export class ModalVisitorEntranceTestComponent implements OnInit {
  @Input() sessions: Session[] = [];
  @Input() visitorEntranceTest: any;
  @Input() targetCourses: Course[] = [];
  @Output() onCloseForm = new EventEmitter();
  @Output() onCancelForm = new EventEmitter();

  addVisitorEntranceTestForm!: FormGroup;
  loading = true;
  dateFormat = Constants.Format.Date.Short;
  exams: EntraceTestExam[] = [];
  editId: string | null = null;
  teachers: Teacher[] = [];
  constructor(
    private manageService: ManageService,
    private studentService: StudentService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private apiResponseHelper: ApiResponseHelper,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initVisitorEntranceTestForm();
  }

  initVisitorEntranceTestForm() {
    if (this.visitorEntranceTest) {
      this.addVisitorEntranceTestForm = this.fb.group({
        course_id: [this.visitorEntranceTest.course_id],
        date: [this.visitorEntranceTest.date],
        note: [this.visitorEntranceTest.note],
      });
      this.exams = this.visitorEntranceTest.exams;
      this.getListTeachers();
    } else {
      this.addVisitorEntranceTestForm = this.fb.group({
        course_id: [null],
        date: [null],
        note: [null],
      });
    }
  }
  class_getCourseSkills(courseId: string) {
    this.manageService.class_getCourseSkills(courseId).subscribe((res: any) => {
      this.loading = false;
      const response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        if (res.data?.length > 0) {
          this.exams = [];
          res.data.forEach((item: any) => {
            this.exams.push({
              skill_id: item.id,
              skill_name: item.name,
            });
          });
        }
        //goij service de generate ra entrance test moi
        else {
         this.generateEntranceTest(courseId);
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
  generateEntranceTest(courseId: string) {
    const request = {
      course_id: courseId
    };
    this.studentService.generateEntranceTest(request).subscribe((res: any) => {
      this.exams = res.data.exams;
    })
  }
  getListTeachers() {
    this.manageService.class_getTeachers().subscribe(
      (res: any) => {
        this.loading = false;

        this.teachers = res.data?.sort((a: any, b: any) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      },
      (err) =>
        this.messageService.error(
          this.translate.instant('Messages.SystemError')
        )
    );
  }

  onChangeTargetCourse(event: any) {
    this.class_getCourseSkills(event);
    this.getListTeachers();
  }
  startEdit(item: any) {
    this.editId = item;
  }
  stopEdit() {
    this.editId = null;
  }
  onChangeTeacher(event: any, i: number) {
    const getTeacher = this.teachers.find((x) => x.id === event);
    if (getTeacher && this.exams[i]) {
      this.exams[i].teacher_full_name = getTeacher.full_name;
    }
  }

  onCloseEntranceTestForm() {
    if (this.addVisitorEntranceTestForm.invalid) {
      Object.values(this.addVisitorEntranceTestForm.controls).forEach(
        (control: AbstractControl) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        }
      );
      return;
    }

    const testRequest = {
      ...this.addVisitorEntranceTestForm.getRawValue(),
      exams: this.exams,
    };
    testRequest.date = this.formatDate(
      this.addVisitorEntranceTestForm.value.date
    );
    testRequest.exams.map((item: any) => {
      item.date = this.formatDate(item.date);
    });

    this.onCloseForm.emit(testRequest);
  }

  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }
  onCancel() {
    this.onCancelForm.emit();
  }
}
