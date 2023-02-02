import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
  Course,
  Room,
  Session,
} from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';
import { TeacherType } from 'src/app/_models/teacher.model';

@Component({
  selector: 'aio-modal-visitor-history',
  templateUrl: './modal-visitor-history.component.html',
  styleUrls: ['./modal-visitor-history.component.scss'],
})
export class ModalVisitorHistoryComponent implements OnInit {
  @Input() sessions: Session[] = [];
  @Input() visitorHistory: any;
  @Input() targetCourses: Course[] = [];
  @Input() targetClasses: TeacherType[] = [];
  @Output() onCloseForm = new EventEmitter();
  @Output() onCancelForm = new EventEmitter();

  addVisitorHistoryForm!: FormGroup;
  loading = true;
  dateFormat = Constants.Format.Date.Day;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initVisitorHistoryForm();
  }

  initVisitorHistoryForm() {
    if (this.visitorHistory) {
      this.addVisitorHistoryForm = this.fb.group({
        target_course_id: [this.visitorHistory.target_course_id],
        target_class_setup_type_id: [
          this.visitorHistory.target_class_setup_type_id,
        ],
        note: [this.visitorHistory.note],
      });
    } else {
      this.addVisitorHistoryForm = this.fb.group({
        target_course_id: [null],
        target_class_setup_type_id: [null],
        note: [null],
      });
    }
  }

  onChangeTargetCourse(event: any) {}

  onChangeTargetClass(event: any) {}

  onCloseHistoryForm() {
    if (this.addVisitorHistoryForm.invalid) {
      Object.values(this.addVisitorHistoryForm.controls).forEach(
        (control: AbstractControl) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        }
      );
      return;
    }
    const sessionRequest = {
      ...this.addVisitorHistoryForm.getRawValue(),
    };
    console.log('sessionRequest', sessionRequest);

    this.onCloseForm.emit(sessionRequest);
  }

  //FORMAT DATE TIME
  formatDateToUnixTimeStamp(start_date: any, day_time: any) {
    const newDate = `${moment(start_date).format('YYYY-MM-DD')} ${moment(
      day_time
    ).format('HH:mm')}`;
    return Math.floor(new Date(newDate).getTime() / 1000);
  }

  onCancel() {
    this.onCancelForm.emit();
  }
}
