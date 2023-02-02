import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  RequestSearchRoomsAvailableSession,
  RequestSearchTeachersAvailableSession,
  Room,
  Session,
  Teacher,
} from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';

@Component({
  selector: 'aio-modal-add-teachers-rooms',
  templateUrl: './add-teachers-rooms.component.html',
  styleUrls: ['./add-teachers-rooms.component.scss'],
})
export class AddTeachersRoomsComponent implements OnInit {
  @Input() checkedSessions: Session[] = [];
  @Input() createClassForm: any;
  @Input() isEdit = false;
  @Output() onCloseForm = new EventEmitter();
  @Output() onCancelForm = new EventEmitter();
  teachers: Teacher[] = [];
  othersTeachers: Teacher[] = [];
  listOfTeacherData: Teacher[] = [];
  listOfOthersTeacherData: Teacher[] = [];
  rooms: Room[] = [];
  loading = false;
  selectedIndexTeacher = 0;
  teacherValue = '';
  teacherOthersValue = '';
  roomValue = '';
  pageIndex = 1;
  pageSize = Constants.SearchConstant.PageSize[5];
  pageIndexOthers = 1;
  pageSizeOthers = Constants.SearchConstant.PageSize[5];

  readMore = false;
  constructor(
    private manageService: ManageService,
    private translate: TranslateService,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.getRoomsAvailable();
    this.searchTeacherAvailable();
    this.getListTeachers();
  }

  searchTeacherAvailable() {
    const requestSessionSearchTeacher: any = [];
    this.checkedSessions.forEach((item: Session) => {
      requestSessionSearchTeacher.push({
        start_time_unix: item.start_time_unix,
        end_time_unix: item.end_time_unix,
        skill_ids: item.skill_ids,
        id: this.isEdit ? item.id : null,
      });
    });

    const requestTeacherAvailable: RequestSearchTeachersAvailableSession = {
      module_id: this.createClassForm.module_id,
      class_sessions: requestSessionSearchTeacher,
    };

    if (this.isEdit) {
      requestTeacherAvailable.class_id = this.createClassForm.id;
    }

    this.manageService
      .class_searchTeachersAvailable(requestTeacherAvailable)
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

  getRoomsAvailable() {
    const requestSessionSearchRoom: any = [];
    this.checkedSessions.forEach((item: Session) => {
      requestSessionSearchRoom.push({
        start_time_unix: item.start_time_unix,
        end_time_unix: item.end_time_unix,
        id: this.isEdit ? item.id : null,
      });
    });
    const requestRoomAvailable: RequestSearchRoomsAvailableSession = {
      attendees_count: 0,
      class_sessions: requestSessionSearchRoom,
    };

    if (this.isEdit) {
      requestRoomAvailable.class_id = this.createClassForm.id;
    }

    this.manageService.class_getRoomsAvailable(requestRoomAvailable).subscribe(
      (res: any) => {
        this.loading = false;

        this.rooms = res.data?.sort((a: any, b: any) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      },
      () => {
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

  onCancel() {
    this.onCancelForm.emit();
  }

  onCloseSessionAddTeacherAndRoomForm() {
    this.checkedSessions.forEach((item: Session) => {
      item.room_name = this.rooms?.find(
        (item: Room) => item.id === this.roomValue
      )?.name;
      item.room_id = this.rooms?.find(
        (item: Room) => item.id === this.roomValue
      )?.id;
      if (this.selectedIndexTeacher === 0) {
        item.teacher_full_name = this.teachers?.find(
          (item: Teacher) => item.is_selected
        )?.teacher_name;
        item.teacher_id = this.teachers?.find(
          (item: Teacher) => item.is_selected
        )?.teacher_id ;
      } else {
        item.teacher_full_name = this.othersTeachers?.find(
          (item: Teacher) => item.is_selected
        )?.teacher_name;
        item.teacher_id = this.othersTeachers?.find(
          (item: Teacher) => item.is_selected
        )?.teacher_id;
      }
    });
    this.onCloseForm.emit(this.checkedSessions);
  }
}
