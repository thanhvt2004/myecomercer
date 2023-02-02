import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import {
  Course,
  GenerateSessionRequest,
  Level,
  Module,
  Syllabus,
  SyllabusDetail,
  Teacher,
  WeeklySession,
  WeeklySessionSkill,
  WeeklySessionTeacher,
  WeeklyWeekDay,
} from 'src/app/_models/classes.model';
import { Session } from 'src/app/_models/classes.model';
import { ManageService } from 'src/app/_services/manage.service';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

import { NzMessageService } from 'ng-zorro-antd/message';
import { SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { Day } from '@progress/kendo-date-math';

import { Constants } from 'src/app/_share/constants/constants';
import { parseAdjust } from 'src/app/_core/helpers/utils.helper';
import { WeekDay } from '@angular/common';

@Component({
  selector: 'app-class-new',
  templateUrl: './class-new.component.html',
  styleUrls: ['./class-new.component.scss'],
})
export class ClassNewComponent implements OnInit {
  public selectedViewIndex = 2;
  loading: boolean = true;
  createClassForm!: FormGroup;
  syllabusDetailForm!: FormGroup;
  weekCount!: number;
  requestWeeklySession: any = [];
  requestSession: any = [];
  weeklySessions: Session[] = [];
  levels: Level[] = [];
  sessions: Session[] = [];
  indexSelectedWeeklySession!: number;
  selectedSyllabusId = '';
  selectedModuledId = '';
  requestSessions: Session[] = [];
  indexSelectedSession: number | any;
  visibleWeelySessionForm = false;
  selectedWeeklySession!: Session;
  courses: Course[] = [];
  modules: Module[] = [];
  syllabuses: Syllabus[] = [];
  visibleSessionForm = false;
  selectedSession!: Session;

  dateFormat = Constants.Format.Date.Short;
  selectedDate: Date = new Date();
  baseData: any[] = [];
  sampleData: any[] = [];
  events: SchedulerEvent[] = [];
  weekStart: Day = Day.Monday;
  event!: Event;
  selectedIndexSession = 0;
  pageIndex = 1;
  pageSize = Constants.SearchConstant.PageSize[6];

  isDisabledGenerateWeeklySessions = true;
  isDisabledSave = true;

  visibleAddSessionForm = false;
  isEdit = false;
  syllabusDetail!: SyllabusDetail;
  isExpandSyllabus = false;

  //table session multiple selecte
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

  //edit sesssion form 
  editId : string | null = null;
  days = Constants.Days;
  constructor(
    private manageService: ManageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private apiResponseHelper: ApiResponseHelper,
    private router: Router,
    private messageService: NzMessageService
  ) {}

  //DECLARE VARIABLES
  isCollapse = true;

  //END DECLARE VARIABLES

  ngOnInit(): void {
    //load data for course
    this.getCourses();
    this.initFormGroup();
    this.getTeachers();
  }

  initFormGroup() {
    this.createClassForm = this.fb.group({
      code: [''],
      name: ['', [Validators.required]],
      syllabus_id: [{ value: '', disabled: true }, [Validators.required]],
      course_id: [{ value: '', disabled: true }, [Validators.required]],
      level_id: [{ value: '', disabled: true }, [Validators.required]],
      module_id: [{ value: '', disabled: true }, [Validators.required]],
      start_date: [null, [Validators.required]],
      is_fixed: [false],
    });

    this.filterSessionForm = this.fb.group({
      selectedWeekDay: [[]],
      selectedTeacher: [[]],
      selectedSkill: [[]],
      start_date: [null],
      to_date: [null],

    })
  }

  resetForm(): void {
    this.createClassForm.reset();
  }

  changeDate(event: any) {
    this.createClassForm.controls['course_id'].enable();
  }

  //COURSE

  getCourses() {
    this.manageService.class_getCourses().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.courses = res.data;
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

  onCourseChange(event: string) {
    // reset value
    this.createClassForm.controls['level_id'].setValue(null);
    this.createClassForm.controls['module_id'].setValue(null);
    this.createClassForm.controls['syllabus_id'].setValue(null);
    //enable control
    this.createClassForm.controls['level_id'].enable();
    //get levels
    this.getLevels(event);
  }
  //END COURSE

  //LEVEL

  onLevelChange(event: string) {
    this.createClassForm.controls['module_id'].enable(),
      //get levels
      this.getModules(event);
  }

  getLevels(courseId: string) {
    this.manageService.class_getLevels(courseId).subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.levels = res.data;
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
  //END LEVEL

  //MODULE

  onModuleChange(event: string) {
    this.createClassForm.controls['syllabus_id'].enable(),
      (this.selectedModuledId = event);
    //get syllabuses
    this.getSyllabuses(event);
  }
  getModules(levelId: string) {
    this.manageService.class_getModules(levelId).subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.modules = res.data;
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
  //END MODULE

  //SYLLABUS

  onSyllabusChange(event: string) {
    this.selectedSyllabusId = event;
    this.getSyllabusDetail(this.selectedSyllabusId);
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
          this.weeklySessions = res.data.weekly_sessions;
          console.log(res.data.weekly_sessions);
          if (this.weeklySessions?.length > 0) {
            this.isDisabledGenerateWeeklySessions = false;
          }
          this.initSyllabusDetailForm(this.syllabusDetail);
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

  getSyllabuses(moduleId: string) {
    this.manageService.class_getSyllabuses(moduleId).subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.syllabuses = res.data;
        if (!this.syllabuses || this.syllabuses.length < 1) {
          this.messageService.error(
            this.translate.instant('Messages.SyllabusesError')
          );
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

  initSyllabusDetailForm(syllabusDetail: SyllabusDetail) {
    this.syllabusDetailForm = this.fb.group({
      sum_duration_hours: [
        { value: syllabusDetail?.sum_duration_hours, disabled: true },
      ],
      sum_lesson_hours: [
        { value: syllabusDetail?.sum_lesson_hours, disabled: true },
      ],
      sum_tutoring_hours: [
        { value: syllabusDetail?.sum_tutoring_hours, disabled: true },
      ],
      sum_testing_hours: [
        { value: syllabusDetail?.sum_testing_hours, disabled: true },
      ],
      learning_outcomes: [syllabusDetail?.learning_outcomes],
      assessment: [syllabusDetail?.assessment],
      units: [syllabusDetail?.units],
      course_objective: [syllabusDetail?.course_objective],
      teachers_reference: [syllabusDetail?.teachers_reference],
      supplementary_materials: [syllabusDetail?.supplementary_materials],
      coursebook_description: [syllabusDetail?.coursebook_description],
      coursebook: [syllabusDetail?.coursebook],
    });
  }

  //END SYLLABUS

  //WEEKLY SESSION

  onCloseWeeklySessionForm(event: any) {
    this.visibleWeelySessionForm = false;

    this.weeklySessions[this.indexSelectedWeeklySession] =
      event.weeklySessionRequest;
  }

  editWeeklySession(data: Session, index: number) {
    this.visibleWeelySessionForm = true;
    this.selectedWeeklySession = data;

    this.indexSelectedWeeklySession = index;
  }
  deleteWeeklySession(data: Session) {}

  generateWeeklySession() {
    this.requestWeeklySession = [];
    this.weeklySessions.forEach((item: Session) => {
      this.requestWeeklySession.push({
        syllabus_weekly_session_id: item.id,
        week_day: item.week_day,
        day_start_time: this.formatDateToTimestamp(item.day_start_time),
        day_end_time: this.formatDateToTimestamp(item.day_end_time),
      });
    });
    const generateWeeklySession: GenerateSessionRequest = {
      syllabus_id: this.selectedSyllabusId,
      start_date: this.formatDate(this.createClassForm.value.start_date),
      weekly_sessions: this.requestWeeklySession,
    };

    this.manageService
      .class_generateWeeklySession(generateWeeklySession)
      .subscribe(
        (res: any) => {
          this.loading = false;

          this.sessions = res.data.sessions;
          if (this.sessions?.length > 0) {
            this.isDisabledSave = false;
          }
          this.baseData = [];
          this.sessions.forEach((item: any) => {
            if (item.start_time_unix && item.end_time_unix) {
              item.day_start_time = this.formatUnixTimestampToDate(
                item.start_time_unix
              );
              item.day_end_time = this.formatUnixTimestampToDate(
                item.end_time_unix
              );
              item.teacher_name = this.weeklySessions?.find(
                (value) => value.teacher_id === item.teacher_id
              )?.teacher_name;
              item.room_name = this.weeklySessions?.find(
                (value) => value.room_id === item.room_id
              )?.room_name;
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
        },
        (err) => {
          this.messageService.error(
            this.translate.instant('Messages.SystemError')
          );
        }
      );
  }

  //---MODAL

  //---END MODAL

  //END WEEKLY SESSION

  //CLASS TABLE
  addNewClass() {
    if (this.createClassForm.invalid) {
      const element = document.getElementById('top-element');
      element?.scrollIntoView();
      Object.values(this.createClassForm.controls).forEach(
        (control: AbstractControl) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        }
      );

      return;
    }
    this.requestSession = [];
    this.sessions.forEach((item: Session) => {
      this.requestSession.push({
        order: item.order,
        block: item.block,
        teacher_id: item.teacher_id,
        room_id: item.room_id,
        start_time_unix: item.start_time_unix,
        end_time_unix: item.end_time_unix,
        syllabus_weekly_session_id: item.syllabus_weekly_session_id,
        session_type_id: item.session_type_id ? item.session_type_id : null,
        skill_ids: item.skill_ids,
        skills: item.skills,
        duration_hours: item.duration_hours,
        revenue_hours: item.revenue_hours,
        unit: item.unit,
        topic_theme: item.topic_theme,
        main_activities: item.main_activities,
        supplementary_materials: item.supplementary_materials,
        homework: item.homework,
        teaching_notes: item.teaching_notes,
      });
    });

    const requestAddClass = {
      name: this.createClassForm.value.name,
      module_id: this.selectedModuledId,
      syllabus_id: this.selectedSyllabusId,
      units: this.syllabusDetailForm.value.units,
      coursebook: this.syllabusDetailForm.value.coursebook,
      coursebook_description:
        this.syllabusDetailForm.value.coursebook_description,
      supplementary_materials:
        this.syllabusDetailForm.value.supplementary_materials,
      teachers_reference: this.syllabusDetailForm.value.teachers_reference,
      course_objective: this.syllabusDetailForm.value.course_objective,
      learning_outcomes: this.syllabusDetailForm.value.learning_outcomes,
      assessment: this.syllabusDetailForm.value.assessment,
      code: this.createClassForm.value.code,
      saving_draft: false,
      weekly_sessions: this.requestWeeklySession,
      sessions: this.requestSession,
    };

    requestAddClass.weekly_sessions.forEach((item: WeeklySession) => {
      delete item.skill_ids;
      delete item.skills;
    });

    this.manageService
      .class_addNewClass(requestAddClass)
      .subscribe((res: any) => {
        this.router.navigate([`/class/detail/${res.data}`]);
        this.loading = false;
        this.isEdit = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.messageService.success(
            this.translate.instant('Messages.AddNewSuccess')
          );
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

  //END CLASS TABLE

  // SESSION

  editSession(data: Session, index: number) {
    this.visibleSessionForm = true;
    this.selectedSession = data;
    this.indexSelectedSession = index + this.pageSize * (this.pageIndex - 1);
  }
  deleteSession(data: Session) {}

  onCloseSessionForm(event: any) {
    this.visibleSessionForm = false;
    this.sessions[this.indexSelectedSession] = event;
    this.sessions = [...this.sessions];
    this.baseData = [];
    this.sessions.forEach((item: any) => {
      if (item.end_time_unix && item.start_time_unix) {
        item.day_start_time = this.formatUnixTimestampToDate(
          item.start_time_unix
        );
        item.day_end_time = this.formatUnixTimestampToDate(item.end_time_unix);

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

  onCloseAddSessionForm(event: any) {
    this.visibleAddSessionForm = false;
    this.sessions = [...this.sessions, event];
    // this.sessions[this.sessions.length - 1].room = {
    //   id: event.room_id,
    //   name: event.room_name,
    // };
    // this.sessions[this.sessions.length - 1].teacher = {
    //   id: event.teacher_id,
    //   full_name: event.teacher_name,
    // };

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
  //---MODAL

  //---END MODAL
  //MUTIPLE SELECT SESSIONS
  addDate() {}

  addTeachersAndRooms() {
    this.checkedSessions = this.sessions.filter(
      (item: Session) => item.checked
    );
    if (this.checkedSessions.length > 0) {
      this.visibleAddTeachersRooms = true;
    } else {
      this.visibleAddTeachersRooms = false;
    }
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

  onCurrentPageDataChange(event: any) {
    this.listOfCurrentPageData = event;
    this.refreshCheckedStatus();
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

    // this.sessions = [...this.sessions, event];
  }
  //END MUTIPLE SELECT SESSIONS
  //END SESSION

  //FORMAT DATE, TIME
  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }

  formatDateToTimestamp(value: string | undefined) {
    if(value) { 
      const newValue = moment(value).format('HH:mm:00');
      return newValue;
    }
    return ''
  }

  formatUnixTimestampToISODate(value: number) {
    const newValue = new Date(value * 1000).toISOString();
    return newValue;
  }

  formatUnixTimestampToDate(value: number) {
    const newValue = new Date(value * 1000);
    return moment(newValue);
  }

  get f() {
    return this.createClassForm.controls;
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

  startEdit(id: string): void {
    console.log("eedit id", id);
    this.editId = id;
  }

  stopEdit(): void {
    this.editId = null;
  }
}
