import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { validateTimePickerControlsValue } from 'src/app/_core/helpers/utils.helper';
import {
  Room,
  Skill,
  Teacher,
  WeeklySession,
} from 'src/app/_models/classes.model';
import { Session } from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'aio-modal-weekly-session',
  templateUrl: './modal-weekly-session.component.html',
  styleUrls: ['./modal-weekly-session.component.scss'],
})
export class ModalWeeklySessionComponent implements OnInit {
  @Input() selectedWeeklySession!: WeeklySession;
  @Input() sessions!: Session[];
  @Input() createClassForm: any;
  @Input() classId = '';
  @Input() isEdit = false;
  @Output() onCloseForm = new EventEmitter();
  @Output() onCancelForm = new EventEmitter();

  weeklySessionForm!: FormGroup;
  loading = true;
  skills!: Skill[];
  rooms!: Room[];
  days = Constants.Days;
  teachers!: Teacher[];
  constructor(
    private manageService: ManageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private apiResponseHelper: ApiResponseHelper,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.getSkills();
    this.initFormWeeklySession();
  }

  initFormWeeklySession() {
    this.weeklySessionForm = this.fb.group(
      {
        id: [
          this.selectedWeeklySession.id ? this.selectedWeeklySession.id : null,
        ],
        week_day: [
          this.selectedWeeklySession.week_day
            ? this.selectedWeeklySession.week_day
            : null,
        ],
        day_start_time: [
          this.selectedWeeklySession.day_start_time
            ? this.formatTimestampToDate(
                this.selectedWeeklySession.day_start_time
              )
            : null,
        ],
        day_end_time: [
          this.selectedWeeklySession.day_end_time
            ? this.formatTimestampToDate(
                this.selectedWeeklySession.day_end_time
              )
            : null,
        ],
        skill_ids: [
          this.selectedWeeklySession.skill_ids
            ? this.selectedWeeklySession.skill_ids
            : null,
        ],
      },
      {
        validators: validateTimePickerControlsValue(
          'day_start_time',
          'day_end_time'
        ),
      }
    );
  }

  //SKILL
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
  //END SKILL

  //FORMAT DATE, TIME

  formatDateToUnixTimeStamp(start_date: any, day_time: any) {
    const newDate = `${moment(start_date).format('YYYY-MM-DD')} ${moment(
      day_time
    ).format('HH:mm')}`;
    return Math.floor(new Date(newDate).getTime() / 1000);
  }

  formatTimestampToDate(value: string) {
    const newValue = moment(value, 'HH:mm:ss');
    return newValue;
  }

  formatDateToTimestamp(value: string) {
    const newValue = moment(value).format('HH:mm:00');
    return newValue;
  }

  formatDateToTimestampDisplay(value: string) {
    const newValue = moment(value).format('HH:mm');
    return newValue;
  }

  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }

  onCloseWeeklySessionForm() {
    if (this.weeklySessionForm.invalid) {
      Object.values(this.weeklySessionForm.controls).forEach(
        (control: AbstractControl) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        }
      );
      return;
    }
    const weeklySessionRequest = {
      ...this.weeklySessionForm.getRawValue(),
      day_start_time: this.formatDateToTimestamp(
        this.weeklySessionForm.controls['day_start_time'].value
      ),
      day_end_time: this.formatDateToTimestamp(
        this.weeklySessionForm.controls['day_end_time'].value
      ),
      skills: this.selectedWeeklySession.skills,
      order: this.selectedWeeklySession.order,
    };

    if (this.isEdit) {
      const requestGenerateExistedClassSession = {
        sessions: this.sessions,
        updating_weekly_session: {
          id: this.selectedWeeklySession.id,
          order: this.selectedWeeklySession.order,
          week_day: this.weeklySessionForm.value.week_day,
          day_start_time: this.formatDateToTimestamp(
            this.weeklySessionForm.controls['day_start_time'].value
          ),
          day_end_time: this.formatDateToTimestamp(
            this.weeklySessionForm.controls['day_end_time'].value
          ),
        },
      };
      this.manageService
        .class_generateExistedClassSession(
          this.classId,
          requestGenerateExistedClassSession
        )
        .subscribe((res: any) => {
          this.loading = false;
          var response = this.apiResponseHelper.ProcessData(
            res.meta,
            'Class.New'
          );
          if (response.isSuccess == true) {
            this.onCloseForm.emit({
              weeklySessionRequest,
              updatedSessions: res.data,
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
    } else {
      this.onCloseForm.emit({ weeklySessionRequest });
    }
  }

  onCancel() {
    this.onCancelForm.emit();
  }
}
