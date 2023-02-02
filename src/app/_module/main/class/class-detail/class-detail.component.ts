import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { Day } from '@progress/kendo-date-math';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { parseAdjust } from 'src/app/_core/helpers/utils.helper';
import {
  Course,
  Session,
  SyllabusDetail,
  Teacher,
  WeeklySession,
} from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'app-class-detail',
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.scss'],
})
export class ClassDetailComponent implements OnInit {
  public selectedViewIndex = 2;

  classDetailForm!: FormGroup;
  syllabusDetailForm!: FormGroup;
  weeklySessions: WeeklySession[] = [];
  sessions: Session[] = [];
  selectedIndex = 0;
  selectedIndexSession = 0;
  visibleAddStudentForm!: boolean;
  visibleSessionForm = false;
  visibleWeelySessionForm = false;
  classId = '';
  loading = false;
  classDetail: any;
  selectedWeeklySession!: WeeklySession;
  indexSelectedWeeklySession!: number;
  selectedSession!: Session;
  indexSelectedSession!: number;
  weekCount!: number;
  pageIndex = 1;
  pageSize = Constants.SearchConstant.PageSize[6];
  selectedDate: Date = new Date();
  baseData: any[] = [];
  sampleData: any[] = [];
  events: SchedulerEvent[] = [];
  weekStart: Day = Day.Monday;
  visibleAddSessionForm = false;
  dateFormat = Constants.Format.Date.Short;
  isEdit = false;
  isExpandSyllabus = false;
  syllabusDetail!: SyllabusDetail;

  //Mutiple select session
  indeterminate = false;
  checked = false;
  setOfCheckedId = new Set<number>();
  listOfCurrentPageData: readonly Session[] = [];
  checkedSessions: Session[] = [];
  visibleAddTeachersRooms = false;

    //filter session
    orginalSessions: Session[] = [];
    filterSessionForm!: FormGroup;
    isShowFilter = false;
    teacherList: Teacher[] = [];
    weekDayFilter = {name: "week_day" }
    skillFilter = {name: "skills"}
    selectedWeekDay="";
    selectedTeacher="";
    selectedSkill="";

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private ac: ActivatedRoute,
    private manageService: ManageService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper
  ) {}

  ngOnInit(): void {
    this.classId = this.ac.snapshot.paramMap.get('id') as string;
    this.getClassDetail(this.classId);
    this.initFormGroup();
    this.getTeachers();
  }

  
  initFormGroup() {
    this.filterSessionForm = this.fb.group({
      selectedWeekDay: [[]],
      selectedTeacher: [[]],
      selectedSkill: [[]],
      start_date: [null],
      to_date: [null],

    })
  }

  getSyllabusDetail(syllabusId: string) {
    this.manageService
      .class_getDetailSyllabus(syllabusId)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.syllabusDetail = res.data;
          this.weekCount = res.data.week_count;
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
  getTeachers() {
    this.manageService.class_getTeachers().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.teacherList = res.data;
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

  initSyllabusDetailForm(syllabusDetail: SyllabusDetail) {
    this.syllabusDetailForm = this.fb.group({
      sum_duration_hours: [syllabusDetail?.sum_duration_hours],
      sum_lesson_hours: [syllabusDetail?.sum_lesson_hours],
      sum_tutoring_hours: [syllabusDetail?.sum_tutoring_hours],
      sum_testing_hours: [syllabusDetail?.sum_testing_hours],
      learning_outcomes: [syllabusDetail?.learning_outcomes],
      assessment: [syllabusDetail?.assessment],
      course_objective: [syllabusDetail?.course_objective],
      teachers_reference: [syllabusDetail?.teachers_reference],
      supplementary_materials: [syllabusDetail?.supplementary_materials],
      coursebook_description: [syllabusDetail?.coursebook_description],
      coursebook: [syllabusDetail?.coursebook],
    });

    return this.syllabusDetailForm.disable();
  }

  //CLASS DETAIL
  getClassDetail(classId: string) {
    this.manageService.class_getClassDetail(classId).subscribe((res: any) => {
      this.loading = false;
      this.pageIndex = 1;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.baseData = [];
        this.classDetail = res.data;
        this.initSyllabusDetailForm(this.classDetail);
        this.weeklySessions = this.classDetail.weekly_sessions;
        this.sessions = this.classDetail.sessions;
        
        this.sessions?.forEach((item: any) => {
          if (item.start_time_unix && item.end_time_unix) {
            item.day_start_time = this.formatUnixTimestampToDate(
              item?.start_time_unix
            );
            item.day_end_time = this.formatUnixTimestampToDate(
              item?.end_time_unix
            );
            this.baseData.push({
              TaskID: item.id,
              Title: `Day ${item.order}`,
              Start: this.formatUnixTimestampToISODate(item.start_time_unix),
              End: this.formatUnixTimestampToISODate(item.end_time_unix),
              IsAllDay: false,
            });
          }
        });
        this.orginalSessions = [... this.sessions];
        this.sampleData = this.baseData.map(
          (dataItem) =>
            <SchedulerEvent>{
              id: dataItem.TaskID,
              start: parseAdjust(dataItem.Start),
              end: parseAdjust(dataItem.End),
              isAllDay: dataItem.IsAllDay,
              title: dataItem.Title,
            }
        );
        this.events = this.sampleData;
        this.initClassDetailForm(this.classDetail);
        this.getSyllabusDetail(this.classDetail.syllabus_id);
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

  initClassDetailForm(detail: any) {
    this.classDetailForm = this.fb.group({
      id: [detail.id],
      name: [detail.name],
      code: [detail.code],
      course: [detail.course_name],
      level: [detail.level_name],
      level_id: [detail.level_id],
      teacher_id: [detail.teacher_id],
      module: [detail.module_name],
      module_id: [detail.module_id],
      start_date: [this.formatStringToDate(detail.start_date)],
      syllabus: [detail.syllabus_name],
    });

    return this.classDetailForm.disable();
  }
  //END CLASS DETAIL

  //WEEKLY SESSIONS
  editWeeklySession(data: WeeklySession, index: number) {
    this.visibleWeelySessionForm = true;

    this.selectedWeeklySession = data;
    this.indexSelectedWeeklySession = index;
  }

  deleteWeeklySession(event: any) {}

  onCloseWeeklySessionForm(event: any) {
    this.visibleWeelySessionForm = false;
    this.weeklySessions[this.indexSelectedWeeklySession] =
      event.weeklySessionRequest;

    for (let i = 0; i < this.sessions.length; i++) {
      for (let j = 0; j < event.updatedSessions.updated_sessions.length; j++) {
        if (
          this.sessions[i].id === event.updatedSessions.updated_sessions[j].id
        ) {
          this.sessions[i] = event.updatedSessions.updated_sessions[j];
          this.sessions[i].skills =
            this.weeklySessions[this.indexSelectedWeeklySession].skills;
          this.sessions[i].skill_ids =
            this.weeklySessions[this.indexSelectedWeeklySession].skill_ids;
        }
      }
    }

    this.sessions = [...this.sessions];
    this.baseData = [];
    this.sessions?.forEach((item: any) => {
      if (item.start_time_unix && item.end_time_unix) {
        item.day_start_time = this.formatUnixTimestampToDate(
          item.start_time_unix
        );
        item.day_end_time = this.formatUnixTimestampToDate(item.end_time_unix);
        //UPDATE SCHEDULER
        this.baseData.push({
          TaskID: item.id,
          Title: `Day ${item.order}`,
          Start: this.formatUnixTimestampToISODate(item?.start_time_unix),
          End: this.formatUnixTimestampToISODate(item?.end_time_unix),
          IsAllDay: false,
        });
      }
    });
    this.sampleData = this.baseData.map(
      (dataItem) =>
        <SchedulerEvent>{
          id: dataItem.TaskID,
          start: parseAdjust(dataItem.Start),
          end: parseAdjust(dataItem.End),
          isAllDay: dataItem.IsAllDay,
          title: dataItem.Title,
        }
    );
    this.events = this.sampleData;
  }
  //END WEEKLY SESSIONS

  //SESSIONS
  editSession(data: Session, index: number) {
    this.visibleSessionForm = true;
    this.selectedSession = data;

    this.indexSelectedSession = index + this.pageSize * (this.pageIndex - 1);
  }
  deleteSession(event: any) {}

  onCloseSessionForm(event: any) {
    this.visibleSessionForm = false;
    this.sessions[this.indexSelectedSession] = event;

    this.sessions = [...this.sessions];
    this.sessions, 'sessions';
    //UPDATE SCHEDULER
    this.baseData = [];
    this.sessions.forEach((item: any) => {
      if (item.start_time_unix && item.end_time_unix) {
        this.baseData.push({
          TaskID: item.id,
          Title: `Day ${item.order}`,
          Start: this.formatUnixTimestampToISODate(item.start_time_unix),
          End: this.formatUnixTimestampToISODate(item.end_time_unix),
          IsAllDay: false,
        });
      }
    });
    this.sampleData = this.baseData.map(
      (dataItem) =>
        <SchedulerEvent>{
          id: dataItem.TaskID,
          start: parseAdjust(dataItem.Start),
          end: parseAdjust(dataItem.End),
          isAllDay: dataItem.IsAllDay,
          title: dataItem.Title,
        }
    );
    this.events = this.sampleData;
  }

  addNewSession() {
    this.visibleAddSessionForm = true;
  }

  onCloseAddSessionForm(event: any) {
    this.visibleAddSessionForm = false;
    this.sessions = [...this.sessions, event];
    //UPDATE SCHEDULER
    this.baseData = [];
    this.sessions.forEach((item: any) => {
      if (item.start_time_unix && item.end_time_unix) {
        this.baseData.push({
          TaskID: item.id,
          Title: `Day ${item.order}`,
          Start: this.formatUnixTimestampToISODate(item.start_time_unix),
          End: this.formatUnixTimestampToISODate(item.end_time_unix),
          IsAllDay: false,
        });
      }
    });
    this.sampleData = this.baseData.map(
      (dataItem) =>
        <SchedulerEvent>{
          id: dataItem.TaskID,
          start: parseAdjust(dataItem.Start),
          end: parseAdjust(dataItem.End),
          isAllDay: dataItem.IsAllDay,
          title: dataItem.Title,
        }
    );
    this.events = this.sampleData;
  }

  updateDate() {}

  updateTeachersAndRooms() {
    this.checkedSessions = this.sessions.filter(
      (item: Session) => item.checked
    );

    this.visibleAddTeachersRooms = true;
  }

  onCurrentPageDataChange(event: any) {
    this.listOfCurrentPageData = event;
    this.refreshCheckedStatus();
  }

  onAllCheckedSession(value: boolean) {
    this.listOfCurrentPageData.forEach((item: any) => {
      this.updateCheckedSet(item.order, value);
      this.sessions[item.order - 1].checked = value;
    });
    this.refreshCheckedStatus();
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.sessions
      .filter((item: Session) => item.order === id)
      .map((item: Session) => {
        item.checked = checked;
      });
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item: any) =>
      this.setOfCheckedId.has(item.order)
    );

    this.indeterminate =
      this.listOfCurrentPageData.some((item: any) =>
        this.setOfCheckedId.has(item.order)
      ) && !this.checked;
  }

  onCloseSessionAddTeacherRoomForm(event: any) {
    this.visibleAddTeachersRooms = false;
    this.checked = false;
    this.listOfCurrentPageData.forEach((item: any) => {
      this.updateCheckedSet(item.order, false);
      this.sessions[item.order - 1].checked = false;
    });
  }

  //END SESSIONS

  updateClass() {
    const requestWeeklySessionUpdateClass: any = [];
    const requestSessionUpdateClass: any = [];
    this.weeklySessions.forEach((item: WeeklySession) => {
      requestWeeklySessionUpdateClass.push({
        id: item.id,
        week_day: item.week_day,

        day_start_time: item.day_start_time,
        day_end_time: item.day_end_time,
      });
    });
    this.sessions.forEach((item: Session, index: number) => {
      requestSessionUpdateClass.push({
        id: item.id,
        class_weekly_session_id: item.class_weekly_session_id,
        block: item.block,
        order: item.order,
        teacher_id: item.teacher_id,
        room_id: item.room_id,
        start_time_unix: item.start_time_unix ? item.start_time_unix : null,
        end_time_unix: item.end_time_unix ? item.end_time_unix : null,
        session_type_id: item.session_type_id ? item.session_type_id : null,
      });
      if (!item.id) {
        requestSessionUpdateClass[index].skills = item.skills;
        requestSessionUpdateClass[index].skill_ids = item.skill_ids;
      }
    });
    const requestUpdateClass = {
      name: this.classDetailForm.value.name,
      saving_draft: false,
      weekly_sessions: requestWeeklySessionUpdateClass,
      sessions: requestSessionUpdateClass,
    };

    this.manageService
      .class_updateClass(this.classId, requestUpdateClass)
      .subscribe(
        (res: any) => {
          this.loading = false;
          this.isEdit = false;

          this.getClassDetail(this.classId);

          this.messageService.success(
            this.translate.instant('Messages.UpdateSuccess')
          );
        },
        (err) =>
          this.messageService.error(
            this.translate.instant('Messages.SystemError')
          )
      );
  }

  addStudent() {
    this.visibleAddStudentForm = true;
  }

  //FORMAT NUMBER

  formatNumberFixed(num: number) {
    return num.toFixed(2);
  }

  //FORMAT DATE TIME
  formatStringToDate(value: string) {
    const newValue = new Date(value);
    return newValue;
  }

  formatUnixTimestampToDate(value: number) {
    const newValue = new Date(value * 1000);
    return moment(newValue);
  }
  formatUnixTimestampToISODate(value: number) {
    const newValue = new Date(value * 1000).toISOString();
    return newValue;
  }

  get f() {
    return this.classDetailForm.controls;
  }
  clickFilterSession() {
    this.isShowFilter = !this.isShowFilter;
  }

  filterSession() {
    console.log(this.filterSessionForm.getRawValue(), 'rawValue');
    console.log(this.filterSessionForm.value.selectedTeacher);
    const day = this.filterSessionForm.value.selectedWeekDay;
    const teacher = this.filterSessionForm.value.selectedTeacher;
    const skill = this.filterSessionForm.value.selectedSkill;
    const startTime = this.filterSessionForm.value.start_date;
    const toTime = this.filterSessionForm.value.to_date;
    
    const teachers = this.orginalSessions.filter((item) => {
      return (teacher.length == 0 || teacher.includes(item.teacher_id))
      && (skill.length == 0 || skill.toString().includes(item.skill_ids?.toString()))
      && (day.length == 0 || day.includes(moment(item.day_start_time).format("dddd")))
      && (startTime == null || moment(startTime).format("hh:mm") === moment(item.day_start_time).format("hh:mm"))
      && (toTime == null || moment(toTime).format("hh:mm") === moment(item.day_end_time).format("hh:mm"))
            });
    this.sessions = teachers;
  }
}
