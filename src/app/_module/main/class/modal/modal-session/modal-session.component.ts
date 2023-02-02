import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { validateTimePickerControlsValue } from 'src/app/_core/helpers/utils.helper';
import {
  RequestSearchRoomsAvailableSession,
  RequestSearchTeachersAvailableSession,
  Room,
  Skill,
  Teacher,
} from 'src/app/_models/classes.model';
import { Session } from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';
@Component({
  selector: 'aio-modal-session',
  templateUrl: './modal-session.component.html',
  styleUrls: ['./modal-session.component.scss'],
})
export class ModalSessionComponent implements OnInit {
  @Input() selectedSession!: Session;
  @Input() createClassForm: any;
  @Input() isEdit = false;
  @Output() onCloseForm = new EventEmitter();
  @Output() onCancelForm = new EventEmitter();

  dateFormat = Constants.Format.Date.Day;
  sessionForm!: FormGroup;
  skills!: Skill[];
  rooms!: Room[];

  teachers: Teacher[] = [];
  othersTeachers: Teacher[] = [];
  listOfTeacherData: Teacher[] = [];
  listOfOthersTeacherData: Teacher[] = [];
  selectedIndexTeacher = 0;
  teacherValue = '';
  teacherOthersValue = '';
  pageIndex = 1;
  pageSize = Constants.SearchConstant.PageSize[5];
  pageIndexOthers = 1;
  pageSizeOthers = Constants.SearchConstant.PageSize[5];

  loading = true;
  days = Constants.Days;
  constructor(
    private manageService: ManageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private apiResponseHelper: ApiResponseHelper,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.getSkills();
    this.initFormSession();
    this.getRoomsAvailable();

    this.onSearchTeacher();
  }

  initFormSession() {
    this.sessionForm = this.fb.group(
      {
        syllabus_weekly_session_id: [
          this.selectedSession.syllabus_weekly_session_id
            ? this.selectedSession.syllabus_weekly_session_id
            : null,
        ],
        id: [this.selectedSession.id ? this.selectedSession.id : null],
        class_weekly_session_id: [
          this.selectedSession.class_weekly_session_id
            ? this.selectedSession.class_weekly_session_id
            : null,
        ],
        block: [this.selectedSession.block ? this.selectedSession.block : null],

        week_day: [
          this.selectedSession.start_time_unix
            ? this.formatTimeStampUnixToDateDisplay(
                this.selectedSession.start_time_unix
              ).split('(')[0]
            : null,
        ],
        start_date: [
          this.selectedSession.start_time_unix
            ? this.formatTimeStampUnixToDate(
                this.selectedSession.start_time_unix
              )
            : null,
        ],
        day_start_time: [
          this.selectedSession.start_time_unix
            ? this.formatTimeStampUnixToDate(
                this.selectedSession.start_time_unix
              )
            : null,
        ],
        day_end_time: [
          this.selectedSession.end_time_unix
            ? this.formatTimeStampUnixToDate(this.selectedSession.end_time_unix)
            : null,
        ],

        skill_ids: [
          {
            value: this.selectedSession.skill_ids
              ? this.selectedSession.skill_ids
              : null,
            disabled: true,
          },
        ],
        room_id: [
          this.selectedSession.room_id ? this.selectedSession.room_id : null,
        ],
        order: [{ value: this.selectedSession.order, disabled: true }],
        duration_hours: [
          this.selectedSession.duration_hours
            ? this.selectedSession.duration_hours
            : null,
        ],
        revenue_hours: [
          this.selectedSession.revenue_hours
            ? this.selectedSession.revenue_hours
            : null,
        ],
        
        unit: [
          this.selectedSession.unit
            ? this.selectedSession.unit
            : null,
        ],
        topic_theme: [
          this.selectedSession.topic_theme
            ? this.selectedSession.topic_theme
            : null,
        ],
        main_activities: [
          this.selectedSession.main_activities
            ? this.selectedSession.main_activities
            : null,
        ],
        supplementary_materials: [
          this.selectedSession.supplementary_materials
            ? this.selectedSession.supplementary_materials
            : null,
        ],
        homework: [
          this.selectedSession.homework ? this.selectedSession.homework : null,
        ],
        teaching_notes: [
          this.selectedSession.teaching_notes
            ? this.selectedSession.teaching_notes
            : null,
        ],
        session_type_id: [
          this.selectedSession.session_type_id
            ? this.selectedSession.session_type_id
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

  onChangeDate(event: any) {
    this.resetSearchTeacherTable();
    const day_start_time = this.sessionForm.controls['day_start_time'].value;
    const day_end_time = this.sessionForm.controls['day_end_time'].value;
    if (event && day_start_time && day_end_time && this.sessionForm.valid) {
      this.getRoomsAvailable();
      this.onSearchTeacher();
    }
  }

  //TIME PICKER
  onChangeStartTime(event: any) {
    this.resetSearchTeacherTable();
    const start_date = this.sessionForm.controls['start_date'].value;
    const day_end_time = this.sessionForm.controls['day_end_time'].value;
    if (event && start_date && day_end_time && this.sessionForm.valid) {
      this.getRoomsAvailable();
      this.onSearchTeacher();
    }
  }

  onChangeEndTime(event: any) {
    this.resetSearchTeacherTable();
    const start_date = this.sessionForm.controls['start_date'].value;
    const day_start_time = this.sessionForm.controls['day_start_time'].value;
    if (event && start_date && day_start_time && this.sessionForm.valid) {
      this.getRoomsAvailable();
      this.onSearchTeacher();
    }
  }

  //END TIME PICKER

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

  //ROOM

  onRoomChange($event: any) {}
  getRoomsAvailable() {
    const start_date = this.sessionForm.controls['start_date'].value;
    const day_start_time = this.sessionForm.controls['day_start_time'].value;
    const day_end_time = this.sessionForm.controls['day_end_time'].value;

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
      if (this.isEdit) {
        requestRoomAvailable.class_id = this.createClassForm.id;
        requestRoomAvailable.class_sessions[0].id = this.selectedSession.id;
      }

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

  //SEARCH TEACHER
  onSearchTeacher() {
    this.searchTeacherAvailable();
    this.getListTeachers();
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
        const indexSelectedTeacherList = this.othersTeachers?.findIndex(
          (item: Teacher) =>
            item.teacher_name === this.selectedSession.teacher_full_name
        );
        if (indexSelectedTeacherList !== -1) {
          this.othersTeachers[indexSelectedTeacherList].is_selected = true;
          this.selectedIndexTeacher = 1;
          this.pageIndex = 1;
          this.pageIndexOthers =
            Math.floor(indexSelectedTeacherList / this.pageSizeOthers) + 1;
        }
      },
      (err) =>
        this.messageService.error(
          this.translate.instant('Messages.SystemError')
        )
    );
  }

  searchTeacherAvailable() {
    const start_date = this.sessionForm.controls['start_date'].value;
    const day_start_time = this.sessionForm.controls['day_start_time'].value;
    const day_end_time = this.sessionForm.controls['day_end_time'].value;
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
            skill_ids: this.selectedSession.skill_ids,
          },
        ],
      };

    if (this.isEdit) {
      requestSearchTeachersAvailable.class_id = this.createClassForm.id;
      requestSearchTeachersAvailable.class_sessions[0].id =
        this.selectedSession.id;
    }

    this.manageService
      .class_searchTeachersAvailable(requestSearchTeachersAvailable)
      .subscribe(
        (res: any) => {
          this.loading = false;

          this.teachers = res.data;
          this.teachers = res.data;
          this.listOfTeacherData = [...this.teachers];
          this.teachers?.map((item: Teacher, i: number) => {
            item.teacher_id = res.data[i].id;
            item.teacher_name = res.data[i].full_name;
          });

          const indexSelectedTeacherAvailable = this.teachers?.findIndex(
            (item: Teacher) =>
              item.teacher_name === this.selectedSession.teacher_full_name
          );
          if (indexSelectedTeacherAvailable !== -1) {
            this.teachers[indexSelectedTeacherAvailable].is_selected = true;
            this.selectedIndexTeacher = 0;
            this.listOfOthersTeacherData.forEach(
              (item) => (item.is_selected = false)
            );
            this.pageIndexOthers = 1;
            this.pageIndex =
              Math.floor(indexSelectedTeacherAvailable / this.pageSize) + 1;
          }
        },
        (err) => {
          this.messageService.error(
            this.translate.instant('Messages.SystemError')
          );
        }
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

  resetFilterTeacher(index: number) {
    if (index === 0) {
      this.teacherValue = '';
      this.onFilterTeacher(index);
    } else {
      this.teacherOthersValue = '';
      this.onFilterTeacher(index);
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

  //FORMAT DATE, TIME

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

  formatTimeStampUnixToDateDisplay(value: number) {
    const newValue = new Date(value * 1000);
    return moment(newValue).format('dddd(DD/MM/YY)');
  }

  formatTimeStampUnixToDate(value: number) {
    const newValue = new Date(value * 1000);
    return newValue;
  }

  formatDateToUnixTimeStamp(start_date: any, day_time: any) {
    const newDate = `${moment(start_date).format('YYYY-MM-DD')} ${moment(
      day_time
    ).format('HH:mm')}`;
    return Math.floor(new Date(newDate).getTime() / 1000);
  }

  onCloseSessionForm() {
    if (this.sessionForm.invalid) {
      Object.values(this.sessionForm.controls).forEach(
        (control: AbstractControl) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        }
      );
      return;
    }

    const start_date = this.sessionForm.controls['start_date'].value;
    const day_start_time = this.sessionForm.controls['day_start_time'].value;
    const day_end_time = this.sessionForm.controls['day_end_time'].value;

    const sessionRequest = {
      ...this.sessionForm.getRawValue(),
      skills: this.selectedSession.skills,
      order: this.selectedSession.order,
      session_type_name: this.selectedSession.session_type_name
        ? this.selectedSession.session_type_name
        : null,
      room_name: this.rooms?.find(
        (item: Room) => item.id === this.sessionForm.value.room_id
      )?.name,
      room_id: this.rooms?.find(
        (item: Room) => item.id === this.sessionForm.value.room_id
      )?.id,
      start_time_unix: this.formatDateToUnixTimeStamp(
        start_date,
        day_start_time
      ),
      end_time_unix: this.formatDateToUnixTimeStamp(start_date, day_end_time),
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

  onCancel() {
    this.onCancelForm.emit();
  }
}
