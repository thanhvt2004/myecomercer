import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { Day } from '@progress/kendo-date-math';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { forkJoin, takeUntil } from 'rxjs';
import {
  parseAdjust,
  RequestSearchForm,
} from 'src/app/_core/helpers/utils.helper';
import { Skill, TeacherRank } from 'src/app/_models/classes.model';
import { Report } from 'src/app/_models/report.model';
import {
  TeacherContractType,
  TeacherType,
} from 'src/app/_models/teacher.model';
import { DestroyService } from 'src/app/_services/destroy.service';
import { ManageService } from 'src/app/_services/manage.service';
import { ReportService } from 'src/app/_services/report.service';
import { TeacherService } from 'src/app/_services/teacher.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';

@Component({
  selector: 'app-teacher-detail',
  templateUrl: './teacher-detail.component.html',
  styleUrls: ['./teacher-detail.component.scss'],
})
export class TeacherDetailComponent implements OnInit {
  @ViewChild('nzTreeComponent', { static: false })
  nzTreeComponent!: NzTreeComponent;
  selectedIndex = 0;  
  loading = false;
  teacherDetailForm!: FormGroup;
  searchClassTeacherForm!: FormGroup;
  classTeachScheduleForm!: FormGroup;
  teacherId = '';
  levels: any[] = [];
  skills: Skill[] = [];
  dateFormat = Constants.Format.Date.Short;
  //SCHEDULER
  currentYear = new Date().getFullYear();
  baseData: any[] = [];
  sampleData: any[] = [];
  listCourseTeacher = [];
  selectedDate: Date = new Date();
  events: SchedulerEvent[] = [];
  weekStart: Day = Day.Monday;
  resultReport: Report[] = [];
  date = new Date();
  defaultStartDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
  defaultEndDate = new Date(
    this.date.getFullYear(),
    this.date.getMonth() + 1,
    0
  );

  isEdit = false;
  teacherList: any[] = [];
  teacherDetail: any;
  ranks: TeacherRank[] = [];
  nodes: any[] = [];
  teacherCourses: any[] = [];
  value: any[] = [];
  valueOpen = true;
  defaultCheckedKeys: any[] = [];

  filterSearch!: any[];
  requestSearchClassTeacherForm = new RequestSearchForm();
  pageSize = Constants.SearchConstant.PageSize[10];

  public selectedViewIndex = 2;

  Categories = Constants.Categories;
  teacherContractType: TeacherContractType[] = [];
  teacherType: TeacherType[] = [];
  selected: string[] | undefined;
  getRequestUpdate: any[] = [];
  arrayWhenUpdate: any[] = [];

  isDisableTree = false;
  mySet1 = new Set();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private ac: ActivatedRoute,
    private manageService: ManageService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private teacherService: TeacherService,
    private reportService: ReportService,
    private destroyService: DestroyService
  ) {}

  ngOnInit(): void {
    const teacherDetailSelectedTab = localStorage.getItem('teacherDetailSelectedTab')? localStorage.getItem('teacherDetailSelectedTab') : 0
    this.teacherId = this.ac.snapshot.paramMap.get('id') as string;
    this.selectedIndex = teacherDetailSelectedTab ? parseInt(teacherDetailSelectedTab) : 0 ;
    this.getTeacherDetail(this.teacherId);
    this.getRanksType();
    this.getTeacherContractType();
    this.getTeacherType();
    this.getListCourseTeacher();
    this.initSearchClassTeacherForm();
    this.initClassTeacherSchedule();
    this.getClassListTeacher();
    this.onSearchSchedule();
  }

  initSearchClassTeacherForm() {
    this.searchClassTeacherForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      teacher_ids: [[this.teacherId]],
    });
  }
  initClassTeacherSchedule() {
    this.classTeachScheduleForm = this.fb.group({
      startDate: [this.defaultStartDate],
      endDate: [this.defaultEndDate],
      select: ['teacher'],
      teacher_ids: [this.teacherId],
    });
  }

  //TEACHER DETAIL
  getTeacherDetail(teacherId: string) {
    this.teacherService.getTeacherDetail(teacherId).subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.baseData = [];
        this.teacherDetail = res.data;

        this.initTeacherDetailForm(this.teacherDetail);
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

  initTeacherDetailForm(detail: any = null) {
    this.teacherDetailForm = this.fb.group({
      first_name: [detail?.first_name],
      middle_name: [detail?.middle_name],
      last_name: [detail?.last_name],
      contract: [detail?.contract_type_value],
      email: [detail?.email, [Validators.email]],
      mobile_phone: [detail?.mobile_phone],
      home_address: [detail?.home_address],
      date_of_birth: [detail?.date_of_birth],
      sex: [detail?.sex],
      type: [detail?.type_value],
      kpi_teaching_hours: [detail?.kpi_teaching_hours],
      salary_per_teaching_hour: [detail?.salary_per_teaching_hour],
      kpi_admin_hours: [detail?.kpi_admin_hours],
      rank_id: [detail?.rank_id],
    });

    this.teacherDetailForm.disable();
  }

  onSaveTeacherDetail() {
    const requestUpdateTeacherDetail = {
      first_name: this.teacherDetailForm.value.first_name,
      middle_name: this.teacherDetailForm.value.middle_name,
      last_name: this.teacherDetailForm.value.last_name,
      full_name: `${this.teacherDetailForm.value.last_name} ${this.teacherDetailForm.value.middle_name} ${this.teacherDetailForm.value.first_name}`,
      sex: this.teacherDetailForm.value.sex,
      date_of_birth:
        this.teacherDetailForm.value.date_of_birth.length === 10
          ? this.teacherDetailForm.value.date_of_birth
          : this.formatDate(this.teacherDetailForm.value.date_of_birth),
      home_address: this.teacherDetailForm.value.home_address,
      email: this.teacherDetailForm.value.email,
      mobile_phone: this.teacherDetailForm.value.mobile_phone,
      type_id: this.teacherType?.find(
        (item: any) => item.value === this.teacherDetailForm.value.type
      )?.id,
      contract_type_id: this.teacherContractType?.find(
        (item: any) => item.value === this.teacherDetailForm.value.contract
      )?.id,
      rank_id: this.teacherDetailForm.value.rank_id,
      salary_per_teaching_hour:
        +this.teacherDetailForm.value.salary_per_teaching_hour,
      kpi_admin_hours: +this.teacherDetailForm.value.kpi_admin_hours,
      kpi_teaching_hours: +this.teacherDetailForm.value.kpi_teaching_hours,
    };
    const dataNodesChange = this.nzTreeComponent.getTreeNodes();
    const keys = ['levels', 'modules', 'skills'];

    forkJoin([
      this.teacherService.updateTeacherDetail(
        this.teacherId,
        requestUpdateTeacherDetail
      ),
      this.teacherService.updateTeacherCourses(
        this.teacherId,
        this.getRequestUpdateTeacherCoursesFromTreeNode(dataNodesChange, keys)
      ),
    ])
      .pipe(takeUntil(this.destroyService.destroyed$))
      .subscribe(
        () => {
          this.messageService.success(
            this.translate.instant(
              'Modules.Teacher.Message.UpdateTeacherSuccess'
            )
          );
          this.isEdit = false;
          this.getTeacherDetail(this.teacherId);
          this.getRanksType();
          this.getListCourseTeacher();
        },
        () => {
          this.messageService.error(
            this.translate.instant(
              'Modules.Teacher.Message.UpdateTeacherFailed'
            )
          );
        }
      );
  }

  onClickEditTeacher() {
    this.isEdit = true;
    this.teacherDetailForm.enable();
    this.isDisableTree = false;
  }

  onClickCancel() {
    this.isEdit = false;
    this.teacherDetailForm.disable();
  }

  getTeacherContractType() {
    this.teacherService
      .getListCommonBycategories(this.Categories.teacherContractType)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.teacherContractType = res.data;
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

  getTeacherType() {
    this.teacherService
      .getListCommonBycategories(this.Categories.teacherType)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.teacherType = res.data;
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

  getRanksType() {
    this.teacherService.getTeacherRank().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.ranks = res.data;
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

  getListCourseTeacher() {
    this.teacherService
      .getListCourseTeacher(this.teacherId)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.listCourseTeacher = res.data;

          this.applyTreeNode();
          this.getDataFromTeachCourse(this.listCourseTeacher);

          this.defaultCheckedKeys = this.teacherCourses;
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

  getDataFromTeachCourse(arr: any) {
    arr.forEach((item: any) => {
      if (item.checked === true) {
        this.teacherCourses.push(item.id);
      } else {
        Object.keys(item).forEach((value) => {
          if (Array.isArray(item[value])) {
            this.getDataFromTeachCourse(item[value]);
          }
        });
      }
    });
  }

  applyTreeNode() {
    this.nodes = [];
    console.log("this.listCourseTeacher.", this.listCourseTeacher);
    this.listCourseTeacher.forEach((item: any) => {
      const treeNode: NzTreeNodeOptions = {
        title: item.name,
        key: item.id,
        children: [],
        isLeaf: false,
        disabled: this.isDisableTree,
        checked: item.checked
      };
      console.log("item", item);
      console.log("treeNode", treeNode);

      item.levels.forEach((itemLevel: any, i: number) => {
        console.log("itemLevel", itemLevel);
        treeNode.children?.push({
          title: itemLevel.name,
          key: itemLevel.id,
          isLeaf: false,
          children: [],
          disabled: this.isDisableTree,
          checked: itemLevel.checked
        });

        if (itemLevel.modules && Array.isArray(itemLevel.modules)) {
          itemLevel.modules.forEach((itemModule: any, indexModules: number) => {
            treeNode.children
              ?.filter((item: any, index: number) => index === i)
              .map((itemChildren) => {
                console.log("itemChildren", itemChildren)
                console.log("item module", itemModule);
                itemChildren.children?.push({
                  title: itemModule.name,

                  key: itemModule.id,
                  isLeaf:
                    itemModule.skills && Array.isArray(itemModule.skills)
                      ? false
                      : true,
                  children: [],
                  checked: itemModule.checked,
                  disabled: this.isDisableTree
                });
              });
            if (itemModule.skills && Array.isArray(itemModule.skills)) {
              itemModule.skills.forEach((itemSkill: any) => {
                treeNode.children
                  ?.filter((item: any, index: number) => index === i)
                  ?.map((itemChildren) => {
                    itemChildren.children
                      ?.filter(
                        (value: any, indexValue: number) =>
                          indexValue === indexModules
                      )
                      .map((valueChildren: any) => {
                        valueChildren.children.push({
                          title: itemSkill.name,

                          key:
                            itemSkill.id +
                            '-' +
                            Math.floor(Math.random() * 100),
                          isLeaf: true,
                          checked: itemSkill.checked,
                          disabled: this.isDisableTree
                        });
                      });
                  });
              });
            }
          });
        }
       });

      return this.nodes.push(treeNode);
    });
    console.log("this.tree node", this.nodes);
  }

  getRequestUpdateTeacherCoursesFromTreeNode(arr: any[], keysFields: any[]) {
    const groupByKey = keysFields[0];
    const newArr = arr.map((item: any) => {
      return {
        name: item.origin.title,
        checked: item.origin.checked,
        id: item.origin.key,
        [groupByKey]: item.origin?.children,
      };
    });

    return newArr.map((item: any) => {
      return {
        ...item,
        [groupByKey]: this.buildTree(item[groupByKey], keysFields.slice(1)),
      };
    });
  }

  buildTree(arr: any[], keys: any[]): any[] {
    const groupByKey = keys[0];
    return arr.map((item: any) => {
      return {
        name: item.title,
        checked: item.checked,
        id:
          item.key.split('-').length === 6
            ? this.handleSkillId(item.key.split('-'))
            : item.key,
        [groupByKey]: item.children
          ? this.buildTree(item.children, keys.slice(1))
          : null,
      };
    });
  }

  handleSkillId(arr: any[]) {
    arr.pop();
    return arr.join('-');
  }

  //CLASS LIST
  getClassListTeacher() {
    this.filterSearch = [];

    if (this.searchClassTeacherForm.value.teacher_ids.length > 0) {
      this.filterSearch.push({
        field: 'teacher_ids',
        value_uuid: this.searchClassTeacherForm.value.teacher_ids,
      });
    }

    const requestSearchClassTeacherForm = {
      filters: this.filterSearch,
      page: this.requestSearchClassTeacherForm.page,
      page_size: this.requestSearchClassTeacherForm.page_size,
      sort_by: this.requestSearchClassTeacherForm.sort_by,
      sort_descending: this.requestSearchClassTeacherForm.sort_descending,
    };

    this.manageService
      .class_searchClasses(requestSearchClassTeacherForm)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
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

  //PHASE DATE SCHEDULER

  onSearchSchedule() {
    this.reportService
      .searchReport(this.classTeachScheduleForm.getRawValue())
      .subscribe((res: any) => {
        this.loading = false;
        this.resultReport = res.data;

        this.baseData = [];
        this.resultReport?.forEach((item: any) => {
          this.baseData.push({
            TaskID: item.id,
            Title: item.title,
            Start: this.formatUnixTimestampToISODate(item.start_time_unix),
            End: this.formatUnixTimestampToISODate(item.end_time_unix),
            IsAllDay: false,
          });
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
      });
  }

  onDateChangeSchedule(event: any) {
    this.classTeachScheduleForm.controls['startDate'].setValue(
      this.formatDate(event.dateRange.start)
    );
    this.classTeachScheduleForm.controls['endDate'].setValue(
      this.formatDate(event.dateRange.end)
    );
    this.onSearchSchedule();
  }

  onClickDetailTeacher(data: any) {}

  onClickDetailClass(data: any) {
    this.router.navigate([`/class/detail/${data.id}`]);
  }

  handleIndexChange (event: any) {
    localStorage.setItem('teacherDetailSelectedTab', event);
  }

  //FORMAT DATE
  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }

  formatUnixTimestampToISODate(value: number) {
    const newValue = new Date(value * 1000).toISOString();
    return moment(newValue);
  }

  get f() {
    return this.teacherDetailForm.controls;
  }
}
