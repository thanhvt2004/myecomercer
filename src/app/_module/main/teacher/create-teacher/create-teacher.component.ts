import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TeacherRank } from 'src/app/_models/classes.model';
import {
  TeacherContractType,
  TeacherType,
} from 'src/app/_models/teacher.model';
import { TeacherService } from 'src/app/_services/teacher.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';
import { NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { concatMap, takeUntil, tap } from 'rxjs';
import { DestroyService } from 'src/app/_services/destroy.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-teacher',
  templateUrl: './create-teacher.component.html',
  styleUrls: ['./create-teacher.component.scss'],
})
export class CreateTeacherComponent implements OnInit {
  @ViewChild('nzTreeComponent', { static: false })
  nzTreeComponent!: NzTreeComponent;
  createTeacherForm!: FormGroup;
  loading = false;
  dateFormat = Constants.Format.Date.Short;
  ranks: TeacherRank[] = [];
  teacherType: TeacherType[] = [];
  teacherContractType: TeacherContractType[] = [];
  nodes: any[] = [];
  listCourseTeacher = [];
  teacherId: string = '';
  Categories = Constants.Categories;
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private translate: TranslateService,
    private apiResponseHelper: ApiResponseHelper,
    private teacherService: TeacherService,
    private destroyService: DestroyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initTeacherDetailForm();
    this.getRanksType();
    this.getTeacherContractType();
    this.getTeacherType();
    this.getAllCourses();
  }

  onCreateTeacher() {
    const requestUpdateTeacherDetail = {
      first_name: this.createTeacherForm.value.first_name,
      middle_name: this.createTeacherForm.value.middle_name,
      last_name: this.createTeacherForm.value.last_name,
      full_name: `${this.createTeacherForm.value.last_name} ${this.createTeacherForm.value.middle_name} ${this.createTeacherForm.value.first_name}`,
      sex: this.createTeacherForm.value.sex,
      date_of_birth: this.formatDate(
        this.createTeacherForm.value.date_of_birth
      ),
      home_address: this.createTeacherForm.value.home_address,
      email: this.createTeacherForm.value.email,
      mobile_phone: this.createTeacherForm.value.mobile_phone,
      type_id: this.teacherType?.find(
        (item: any) => item.value === this.createTeacherForm.value.type
      )?.id,
      contract_type_id: this.teacherContractType?.find(
        (item: any) => item.value === this.createTeacherForm.value.contract
      )?.id,
      rank_id: this.createTeacherForm.value.rank_id,
      salary_per_teaching_hour:
        +this.createTeacherForm.value.salary_per_teaching_hour,
      kpi_admin_hours: +this.createTeacherForm.value.kpi_admin_hours,
      kpi_teaching_hours: +this.createTeacherForm.value.kpi_teaching_hours,
    };

    const dataNodesChange = this.nzTreeComponent.getTreeNodes();
    const keys = ['levels', 'modules', 'skills'];

    this.teacherService
      .createTeacher(requestUpdateTeacherDetail)
      .pipe(
        tap((res) => {
          this.teacherId = res.data;
        }),
        concatMap((res: any) =>
          this.teacherService.updateTeacherCourses(
            res.data,
            this.getRequestUpdateTeacherCoursesFromTreeNode(
              dataNodesChange,
              keys
            )
          )
        ),
        takeUntil(this.destroyService.destroyed$)
      )
      .subscribe(
        (res: any) => {
          this.messageService.success(
            this.translate.instant(
              'Modules.Teacher.Message.CreateTeacherSuccess'
            )
          );
          this.router.navigate([`/teacher/detail/${this.teacherId}`]);
        },
        (err) => {
          this.messageService.error(
            this.translate.instant('Messages.SystemError')
          );
        }
      );
  }

  initTeacherDetailForm(detail: any = null) {
    this.createTeacherForm = this.fb.group({
      first_name: [''],
      middle_name: [''],
      last_name: [''],
      contract: [''],
      email: ['', [Validators.email]],
      mobile_phone: [''],
      home_address: [''],
      date_of_birth: [''],
      sex: [''],
      type: [''],
      kpi_teaching_hours: [''],
      salary_per_teaching_hour: [''],
      kpi_admin_hours: [''],
      rank_id: [''],
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

  getAllCourses() {
    this.teacherService.getAllCoursesCommon().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.listCourseTeacher = res.data;

        this.applyTreeNode();
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

  applyTreeNode() {
    this.listCourseTeacher.forEach((item: any) => {
      const treeNode: NzTreeNodeOptions = {
        title: item.name,
        key: item.id,
        children: [],
        isLeaf: false,
      };

      item.levels.forEach((itemLevel: any, i: number) => {
        treeNode.children?.push({
          title: itemLevel.name,
          key: itemLevel.id,
          isLeaf: false,
          children: [],
        });

        if (itemLevel.modules && Array.isArray(itemLevel.modules)) {
          itemLevel.modules.forEach((itemModule: any, indexModules: number) => {
            treeNode.children
              ?.filter((item: any, index: number) => index === i)
              .map((itemChildren) => {
                itemChildren.children?.push({
                  title: itemModule.name,

                  key: itemModule.id,
                  isLeaf:
                    itemModule.skills && Array.isArray(itemModule.skills)
                      ? false
                      : true,
                  children: [],
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
  }

  //FORMAT DATE
  formatDate(value: string) {
    const newValue = moment(value).format('YYYY-MM-DD');
    return newValue;
  }

  get f() {
    return this.createTeacherForm.controls;
  }
}
