import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { validateTimePickerControlsValue } from 'src/app/_core/helpers/utils.helper';
import {
  RequestSearchRoomsAvailableSession,
  RequestSearchTeachersAvailableSession,
  Room,
  Session,
  SessionType,
  Skill,
  Teacher,
  WeeklySession,
} from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'aio-modal-add-session',
  templateUrl: './modal-add-session.component.html',
  styleUrls: ['./modal-add-session.component.scss'],
})
export class ModalAddSessionComponent implements OnInit {
  @Input() weeklySessions: WeeklySession[] = [];
  @Input() sessions: Session[] = [];
  @Input() createClassForm: any;
  @Output() onCloseForm = new EventEmitter();
  @Output() onCancelForm = new EventEmitter();

  addSessionForm!: FormGroup;
  skills!: Skill[];
  rooms!: Room[];
  teachers: Teacher[] = [];
  othersTeachers: Teacher[] = [];
  listOfTeacherData: Teacher[] = [];
  listOfOthersTeacherData: Teacher[] = [];
  sessionTypes: SessionType[] = [];
  loading = true;
  days: string[] = [];
  dateFormat = Constants.Format.Date.Day;

  selectedIndexTeacher = 0;
  teacherValue = '';
  teacherOthersValue = '';
  pageIndex = 1;
  pageSize = Constants.SearchConstant.PageSize[5];
  pageIndexOthers = 1;
  pageSizeOthers = Constants.SearchConstant.PageSize[5];
  constructor(
    private manageService: ManageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private apiResponseHelper: ApiResponseHelper,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.weeklySessions.forEach((item: any) => {
      this.days.push(item.week_day);
    });
    this.getSkills();
    this.initAddFormSession();
    this.getRoomsAvailable();
    this.getSessionTypes();
  }

  initAddFormSession() {
    this.addSessionForm = this.fb.group(
      {
        session_type_id: [null],
        class_weekly_session_id: [null],
        syllabus_weekly_session_id: [null],
        week_no: [0],
        week_day: [null],
        start_date: [null],
        day_start_time: [null],
        day_end_time: [null],
        skill_ids: [null],

        room_id: [null],
        searchTeacher: [null],
        searchOthersTeacher: [null],
      },
      {
        validators: validateTimePickerControlsValue(
          'day_start_time',
          'day_end_time'
        ),
      }
    );
  }

  //END DAY

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

  onChangeSkills(event: any) {
    this.resetSearchTeacherTable();
    const day_start_time = this.addSessionForm.controls['day_start_time'].value;
    const day_end_time = this.addSessionForm.controls['day_end_time'].value;
    if (event && day_start_time && day_end_time && this.addSessionForm.valid) {
      this.getRoomsAvailable();
      this.onSearchTeacher();
    }
  }

  //END SKILL

  //SESSION TYPE
  getSessionTypes() {
    this.manageService.class_getSessionTypes().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.sessionTypes = res.data;
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
  //END SESSION TYPE

  //ROOM

  getRoomsAvailable() {
    const start_date = this.addSessionForm.controls['start_date'].value;
    const day_start_time = this.addSessionForm.controls['day_start_time'].value;
    const day_end_time = this.addSessionForm.controls['day_end_time'].value;

    if (start_date && day_start_time && day_end_time) {
      const requestRoomAvailable: RequestSearchRoomsAvailableSession = {
        attendees_count: 0,
        class_sessions: [
          {
            start_time_unix: this.formatDateToUnixTimeStamp(
              start_date,
              day_start_time
            ),
            end_time_unix: this.formatDateToUnixTimeStamp(
              start_date,
              day_end_time
            ),
          },
        ],
      };

      this.manageService
        .class_getRoomsAvailable(requestRoomAvailable)
        .subscribe((res: any) => {
          this.loading = false;
          var response = this.apiResponseHelper.ProcessData(
            res.meta,
            'Class.New'
          );
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
  }
  //END ROOM
  //TIME PICKER

  onChangeDate(event: any) {
    this.resetSearchTeacherTable();
    const day_start_time = this.addSessionForm.controls['day_start_time'].value;
    const day_end_time = this.addSessionForm.controls['day_end_time'].value;
    if (event && day_start_time && day_end_time && this.addSessionForm.valid) {
      this.getRoomsAvailable();
      this.onSearchTeacher();
    }
  }
  onChangeStartTime(event: any) {
    this.resetSearchTeacherTable();
    const start_date = this.addSessionForm.controls['start_date'].value;
    const day_end_time = this.addSessionForm.controls['day_end_time'].value;
    if (event && start_date && day_end_time && this.addSessionForm.valid) {
      this.getRoomsAvailable();
      this.onSearchTeacher();
    }
  }

  onChangeEndTime(event: any) {
    this.resetSearchTeacherTable();
    const start_date = this.addSessionForm.controls['start_date'].value;
    const day_start_time = this.addSessionForm.controls['day_start_time'].value;
    if (event && start_date && day_start_time && this.addSessionForm.valid) {
      this.getRoomsAvailable();
      this.onSearchTeacher();
    }
  }

  //END TIME PICKER
  //SEARCH TEACHER

  onSearchTeacher() {
    this.searchTeacherAvailable();
    this.getListTeachers();
  }
  searchTeacherAvailable() {
    const start_date = this.addSessionForm.controls['start_date'].value;
    const day_start_time = this.addSessionForm.controls['day_start_time'].value;
    const day_end_time = this.addSessionForm.controls['day_end_time'].value;

    //get search teachers available
    const requestSearchTeachersAvailable: RequestSearchTeachersAvailableSession =
      {
        module_id: this.createClassForm.module_id,
        class_sessions: [
          {
            start_time_unix: this.formatDateToUnixTimeStamp(
              start_date,
              day_start_time
            ),
            end_time_unix: this.formatDateToUnixTimeStamp(
              start_date,
              day_end_time
            ),
            skill_ids: this.addSessionForm.controls['skill_ids'].value,
          },
        ],
      };

    this.manageService
      .class_searchTeachersAvailable(requestSearchTeachersAvailable)
      .subscribe(
        (res: any) => {
          this.loading = false;
          this.teachers = res.data;
          this.listOfTeacherData = [...this.teachers];
          this.teachers?.map((item: Teacher, i: number) => {
            item.teacher_id = res.data[i].id;
            item.teacher_name = res.data[i].full_name;
          });
        },
        (err) => {
          this.messageService.error(
            this.translate.instant('Messages.SystemError')
          );
        }
      );
  }

  getListTeachers() {
    this.manageService.class_getTeachers().subscribe(
      (res: any) => {
        this.loading = false;

        this.othersTeachers = res.data?.sort((a: any, b: any) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        this.listOfOthersTeacherData = [...this.othersTeachers];
        this.othersTeachers?.map((item: Teacher, i: number) => {
          item.teacher_id = res.data[i].id;
          item.teacher_name = res.data[i].full_name;
        });
      },
      (err) =>
        this.messageService.error(
          this.translate.instant('Messages.SystemError')
        )
    );
  }

  selectTeacher(data: Teacher, index: number) {
    //set selected
    data.is_selected = true;
    if (index === 0) {
      this.listOfOthersTeacherData.forEach(
        (item) => (item.is_selected = false)
      );

      _.find(this.teachers, function (teacher) {
        if (teacher.teacher_id != data.teacher_id) {
          teacher.is_selected = false;
        }
      });
    } else {
      this.listOfTeacherData.forEach((item) => (item.is_selected = false));
      _.find(this.othersTeachers, function (teacher) {
        if (teacher.teacher_id != data.teacher_id) {
          teacher.is_selected = false;
        }
      });
    }
  }

  onChangeTabTeacher(index: number) {
    if (index === 0) {
      this.teacherOthersValue = '';
      this.resetFilterTeacher(index);
    } else {
      this.teacherValue = '';
      this.resetFilterTeacher(index);
    }
  }

  onFilterTeacher(index: number) {
    if (index === 0) {
      const valueSearch = this.teacherValue;
      this.listOfTeacherData = this.teachers.filter(
        (item) => item.teacher_name?.toLowerCase().indexOf(valueSearch) !== -1
      );
    } else {
      const valueSearch = this.teacherOthersValue;
      this.listOfOthersTeacherData = this.othersTeachers.filter(
        (item) => item.teacher_name?.toLowerCase().indexOf(valueSearch) !== -1
      );
    }
  }

  resetFilterTeacher(index: number) {
    if (index === 0) {
      this.teacherValue = '';
      this.onFilterTeacher(index);
    } else {
      this.teacherOthersValue = '';
      this.onFilterTeacher(index);
    }
  }

  resetSearchTeacherTable() {
    this.listOfTeacherData = [];
    this.listOfOthersTeacherData = [];
    this.selectedIndexTeacher = 0;
    this.teacherValue = '';
    this.teacherOthersValue = '';
    this.listOfTeacherData.forEach((item) => (item.is_selected = false));
    this.listOfOthersTeacherData.forEach((item) => (item.is_selected = false));
  }

  //END SEARCH TEACHER

  onCloseSessionForm() {
    if (this.addSessionForm.invalid) {
      Object.values(this.addSessionForm.controls).forEach(
        (control: AbstractControl) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        }
      );
      return;
    }

    const start_date = this.addSessionForm.controls['start_date'].value;
    const day_start_time = this.addSessionForm.controls['day_start_time'].value;
    const day_end_time = this.addSessionForm.controls['day_end_time'].value;

    const skills_name: any = [];
    this.addSessionForm.controls['skill_ids'].value.forEach((item: any) => {
      skills_name.push(this.skills.find((i) => i.id === item)?.name);
    });

    const sessionRequest = {
      ...this.addSessionForm.getRawValue(),
      skills: skills_name.join(', '),
      order: this.sessions.length + 1,
      room_name: this.rooms.find(
        (item: Room) => item.id === this.addSessionForm.value.room_id
      )?.name,
      room_id: this.rooms.find(
        (item: Room) => item.id === this.addSessionForm.value.room_id
      )?.id,

      start_time_unix: this.formatDateToUnixTimeStamp(
        start_date,
        day_start_time
      ),
      end_time_unix: this.formatDateToUnixTimeStamp(start_date, day_end_time),
      session_type_id: this.addSessionForm.controls['session_type_id'].value,
      session_type_name: this.sessionTypes?.find(
        (item: SessionType) =>
          item.id === this.addSessionForm.controls['session_type_id'].value
      )?.name,
    };

    if (this.selectedIndexTeacher === 0) {
      sessionRequest.teacher_full_name = this.teachers?.find(
        (item: Teacher) => item.is_selected
      )?.teacher_name;
      sessionRequest.teacher_id = this.teachers?.find(
        (item: Teacher) => item.is_selected
      )?.teacher_id;
    } else {
      sessionRequest.teacher_full_name = this.othersTeachers?.find(
        (item: Teacher) => item.is_selected
      )?.teacher_name;
      sessionRequest.teacher_id = this.othersTeachers?.find(
        (item: Teacher) => item.is_selected
      )?.teacher_id;
    }
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
