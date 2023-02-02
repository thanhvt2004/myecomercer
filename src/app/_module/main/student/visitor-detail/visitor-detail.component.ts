import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, takeUntil } from 'rxjs';
import { TeacherType } from 'src/app/_models/teacher.model';
import { DestroyService } from 'src/app/_services/destroy.service';
import { ManageService } from 'src/app/_services/manage.service';
import { StudentService } from 'src/app/_services/student.service';
import { TeacherService } from 'src/app/_services/teacher.service';
import { Constants } from 'src/app/_share/constants/constants';
import { ApiResponseHelper } from 'src/app/_share/_helper/api-response-helper';
import { Course } from 'src/app/_models/classes.model';
import { isBuffer } from 'lodash';
import { EntraceTest } from 'src/app/_models/student.model';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzTreeSelectComponent } from 'ng-zorro-antd/tree-select';

@Component({
  selector: 'app-visitor-detail',
  templateUrl: './visitor-detail.component.html',
  styleUrls: ['./visitor-detail.component.scss'],
})
export class VisitorDetailComponent implements OnInit {
  currentLanguage = '';
  options = ['Thông tin', 'Lịch sử', 'Test', 'Lộ trình'];
  dateFormat = Constants.Format.Date.Short;
  Categories = Constants.Categories;
  selectedIndex = 0;
  loading = false;
  isEdit = false;
  visitorDetailForm!: FormGroup;
  visitorId = '';
  visitorDetail: any;
  checked = true;
  studentStudyPurpose: any[] = [];
  studentStudyInterest: any[] = [];
  selectedStudentStudyPurpose: string[] = [];
  selectedStudentStudyInterest: string[] = [];

  //tab history
  targetCourses: Course[] = [];
  targetClasses: TeacherType[] = [];
  histories: any[] = [];
  editId = '';
  visitorHistory: any;
  visibleVisitorHistoryForm = false;
  //Entrance test
  visibleEntranceTestForm = false;
  entranceTestes: EntraceTest[] = [];
  visitorEntranceTest: any;
  //Study route
  studyRoutes: any[] = [];
  coursesTree: any[] = [];
  nodes: NzTreeNodeOptions[] = [];
  targetClassChecked: any[] = [];
  selectedCourse: any[] = [];
  selectedModule: any[] = [];
  steps: any[] = [];
  @ViewChild('nzTreeSelectComponent', { static: false })
  nzTreeSelectComponent!: NzTreeSelectComponent;
  studyRouteId = '';
  studyRouteStatus = 'Draf';
  // nodes = [
  //   {
  //     title: 'parent 1',
  //     key: '100',
  //     children: [
  //       {
  //         title: 'parent 1-0',
  //         key: '1001',
  //         children: [
  //           { title: 'leaf 1-0-0', key: '10010', isLeaf: true },
  //           { title: 'leaf 1-0-1', key: '10011', isLeaf: true }
  //         ]
  //       },
  //       {
  //         title: 'parent 1-1',
  //         key: '1002',
  //         children: [{ title: 'leaf 1-1-0', key: '10020', isLeaf: true }]
  //       }
  //     ]
  //   }
  // ];
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private ac: ActivatedRoute,
    private teacherService: TeacherService,
    private studentService: StudentService,
    private manageService: ManageService,
    private messageService: NzMessageService,
    private apiResponseHelper: ApiResponseHelper,
    private destroyService: DestroyService
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.translate.getDefaultLang();
    this.visitorId = this.ac.snapshot.paramMap.get('id') as string;
    this.getVisitorDetail(this.visitorId);
    this.getTargetCourse();
    this.getTargetClass();
    this.getCourseAndChildrent();
  }

  initVisitorDetailForm(detail: any = null) {
    this.visitorDetailForm = this.fb.group({
      full_name: [detail?.full_name],
      sex: [detail?.sex],
      date_of_birth: [detail?.date_of_birth],
      current_school: [detail?.current_school],
      home_address: [detail?.home_address],
      email: [detail?.email],
      mobile_phone: [detail?.mobile_phone],
      parent_1_name: [detail?.parent_1_name],
      parent_2_name: [detail?.parent_2_name],
      parent_1_mobile: [detail?.parent_1_mobile],
      parent_2_mobile: [detail?.parent_2_mobile],
      learning_purposes: [detail?.study_purposes?.others],
    });

    this.visitorDetailForm.disable();
  }

  getVisitorDetail(visitorId: string) {
    this.studentService.getvisitorDetail(visitorId).subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.visitorDetail = res.data;
        this.studentStudyPurpose = res.data.study_purposes?.items;
        this.studentStudyInterest = res.data.study_interests?.items;
        const seletedStudentStudPurpose = res.data.study_purposes?.items.find(
          (x: any) => x.selected === true
        );
        if (seletedStudentStudPurpose && seletedStudentStudPurpose.length > 0) {
          seletedStudentStudPurpose.array.forEach((element: any) => {
            this.selectedStudentStudyPurpose.push(element.id);
          });
        }
        const selectedStudentStudyInterest =
          res.data.study_interests?.items.find((x: any) => x.selected === true);
        if (
          selectedStudentStudyInterest &&
          selectedStudentStudyInterest.length > 0
        ) {
          selectedStudentStudyInterest.array.forEach((element: any) => {
            this.selectedStudentStudyInterest.push(element.id);
          });
        }
        this.initVisitorDetailForm(this.visitorDetail);
        this.getVisitorHistory();
        this.getEntranceTest();
        this.getStudyRoute();
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
  studentStudyInterestChange(value: any) {
    this.selectedStudentStudyInterest = value;
  }

  studentStudyPurposeChange(value: any) {
    this.selectedStudentStudyPurpose = value;
  }
  getTargetCourse() {
    this.manageService.class_getCourses().subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(res.meta, 'Class.New');
      if (response.isSuccess == true) {
        this.targetCourses = res.data;
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
  getTargetClass() {
    this.teacherService
      .getListCommonBycategories(this.Categories.tagetClass)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.targetClasses = res.data;
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
  getCourseAndChildrent() {
    this.manageService
      .class_getCourseAndChildrent('true')
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.coursesTree = res.data;
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
  onSaveVisitorDetail() {
    const requestUpdateVisitor = {
      full_name: this.visitorDetailForm.value.full_name,
      sex: this.visitorDetailForm.value.sex,
      date_of_birth: this.visitorDetailForm.value.date_of_birth,
      current_school: this.visitorDetailForm.value.current_school,
      home_address: this.visitorDetailForm.value.home_address,
      email: this.visitorDetailForm.value.email,
      mobile_phone: this.visitorDetailForm.value.mobile_phone,
      parent_1_name: this.visitorDetailForm.value.parent_1_name,
      parent_1_mobile: this.visitorDetailForm.value.parent_1_mobile,
      parent_2_name: this.visitorDetailForm.value.parent_2_name,
      parent_2_mobile: this.visitorDetailForm.value.parent_2_mobile,
      study_purposes: {
        selected_ids: this.selectedStudentStudyPurpose,
        others: this.visitorDetailForm.value.learning_purposes,
      },
      study_interests: {
        selected_ids: this.selectedStudentStudyInterest,
      },
      note: this.visitorDetailForm.value.note,
    };

    forkJoin([
      this.studentService.updateVisitorDetail(
        this.visitorId,
        requestUpdateVisitor
      ),
    ])
      .pipe(takeUntil(this.destroyService.destroyed$))
      .subscribe(
        () => {
          this.messageService.success(
            this.translate.instant(
              'Modules.Student.Message.UpdateVisitorSuccess'
            )
          );
          this.isEdit = false;
          this.getVisitorDetail(this.visitorId);
        },
        () => {
          this.messageService.error(
            this.translate.instant(
              'Modules.Student.Message.UpdateVisitorFailed'
            )
          );
        }
      );
  }
  onClickCancel() {
    this.isEdit = false;
    this.visitorDetailForm.disable();
  }
  onClickEditVisitor() {
    this.isEdit = true;
    this.visitorDetailForm.enable();
  }

  //History tab

  getVisitorHistory() {
    this.studentService
      .getVisitorHistory(this.visitorId)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.histories = res.data;
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

  onCloseVisitorHistoryForm(event: any) {
    const visitorHistoryRequest = {
      target_course_id: event.target_course_id,
      target_class_setup_type_id: event.target_class_setup_type_id,
      note: event.note,
      sale_care_id: '11ed7771-2354-a130-ade7-dcfb488288c7',
    };
    if (this.visitorHistory) {
      this.editVisitorHistory(visitorHistoryRequest);
    } else {
      this.addVisitorHistory(visitorHistoryRequest);
    }
  }
  onCancelVisitorHistoryForm() {
    this.visibleVisitorHistoryForm = false;
  }
  onAddVisitorHistory() {
    this.visitorHistory = null;
    this.visibleVisitorHistoryForm = true;
  }
  onEditVisitorHistory(item: any) {
    this.visitorHistory = item;
    this.visibleVisitorHistoryForm = true;
  }

  onDeleteVisitorHistory(item: any) {}

  addVisitorHistory(visitorHistoryRequest: any) {
    this.studentService
      .addNewVisitorHistory(this.visitorId, visitorHistoryRequest)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.messageService.success(
            this.translate.instant('Messages.AddNewSuccess')
          );
          this.visibleVisitorHistoryForm = false;
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
  editVisitorHistory(visitorHistoryRequest: any) {
    this.studentService
      .editVisitorHistory(this.visitorHistory.id, visitorHistoryRequest)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.messageService.success(
            this.translate.instant('Messages.UpdateSuccess')
          );
          this.visibleVisitorHistoryForm = false;
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

  //END HISTORY TAB

  //Entrance test
  onAddEntranceTest() {
    this.visitorEntranceTest = null;
    this.visibleEntranceTestForm = true;
  }
  onEditVisitorEntranceTest(item: any) {
    this.visitorEntranceTest = item;
    this.visibleEntranceTestForm = true;
  }
  getEntranceTest() {
    this.studentService
      .getEntranceTest(this.visitorId)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.entranceTestes = res.data;
          this.entranceTestes.map((item: EntraceTest) => {
            item.expand = false;
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

  onCloseEntranceTestForm(event: any) {
    const entranceTestRequest = { ...event };
    if (this.visitorEntranceTest) {
      this.editVisitorEntranceTest(entranceTestRequest);
    } else {
      this.addVisitorEntranceTest(entranceTestRequest);
    }
  }
  onCancelEntranceTestForm() {
    this.visibleEntranceTestForm = false;
  }
  addVisitorEntranceTest(request: any) {
    this.studentService
      .addNewEntranceTest(this.visitorId, request)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.messageService.success(
            this.translate.instant('Messages.AddNewSuccess')
          );
          this.visibleEntranceTestForm = false;
          this.getEntranceTest();
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
  editVisitorEntranceTest(request: any) {
    this.studentService
      .editEntranceTest(this.visitorEntranceTest.id, request)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          this.messageService.success(
            this.translate.instant('Messages.UpdateSuccess')
          );
          this.visibleEntranceTestForm = false;
          this.getEntranceTest();
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

  //Etrance test

  //Study route
  getStudyRoute() {
    this.studentService
      .getStudyRouter(this.visitorId)
      .subscribe((res: any) => {
        this.loading = false;
        var response = this.apiResponseHelper.ProcessData(
          res.meta,
          'Class.New'
        );
        if (response.isSuccess == true) {
          if(res.data.length > 0) {
            this.studyRoutes = res.data;
            const studyRouter = res.data[0];
            this.studyRouteId = studyRouter.id;
            this.studyRouteStatus = studyRouter.status;
            this.targetClassChecked = studyRouter.target_class_setup_type_id;
            this.getRouterDetail(studyRouter.id);
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
  getRouterDetail(id: string) {
    this.studentService
    .getStudyRouteDetail(id)
    .subscribe((res: any) => {
      this.loading = false;
      var response = this.apiResponseHelper.ProcessData(
        res.meta,
        'Class.New'
      );
      if (response.isSuccess == true) {
        this.steps = res.data.steps;
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
  applyTreeNode() {
    this.coursesTree.forEach((item: any) => {
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

                  key: `mod_${itemModule.id}`,
                  isLeaf: true,
                });
              });
            // if (itemModule.skills && Array.isArray(itemModule.skills)) {
            //   itemModule.skills.forEach((itemSkill: any) => {
            //     treeNode.children
            //       ?.filter((item: any, index: number) => index === i)
            //       ?.map((itemChildren) => {
            //         itemChildren.children
            //           ?.filter(
            //             (value: any, indexValue: number) =>
            //               indexValue === indexModules
            //           )
            //           .map((valueChildren: any) => {
            //             valueChildren.children.push({
            //               title: itemSkill.name,

            //               key:
            //                 itemSkill.id +
            //                 '-' +
            //                 Math.floor(Math.random() * 100),
            //               isLeaf: true,
            //             });
            //           });
            //       });
            //   });
            // }
          });
        }
      });

      return this.nodes.push(treeNode);
    });
  }

  updateSingleChecked() {}
  onChangeTargetClassRoute(item: any) {}
  onTreeChange(event: any) {
    this.selectedCourse.push(event);
  }
  onGenerateData() {
    const data = this.nzTreeSelectComponent.getCheckedNodeList();
    if (data.length > 0) {
      this.selectedModule = [];
      this.populateCheckedModule(data);
      this.generateStudyRouteData();
    }
  }

  generateStudyRouteData() {
    if(this.targetClassChecked.length === 0 && this.selectedModule.length === 0) return;
    const request = {
      target_class_setup_type_id: this.targetClassChecked,
      module_ids: this.selectedModule
    };
      this.studentService
        .generateStudyRoute(request)
        .subscribe((res: any) => {
          this.loading = false;
          var response = this.apiResponseHelper.ProcessData(
            res.meta,
            'Class.New'
          );
          if (response.isSuccess == true) {
            this.messageService.success(
              this.translate.instant('Messages.AddNewSuccess')
            );
            this.steps = res.data.steps;
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

  populateCheckedModule(data: any) {
    
    data.forEach((item: any) => {
      if (item.key.includes('mod_')) {
        this.selectedModule.push(item.key.slice(4, item.key.length));
      } else {
        this.populateCheckedModule(item.children);
      }
    });
  }

  onAddStudyRoute(savingDraft: boolean) {
    const request: any = {
      target_class_setup_type_id: this.targetClassChecked,
      steps: this.steps
    };
    if(savingDraft) {
      request['saving_draft'] = true;
    }
    else {
      this.studyRouteStatus = "Submitted"
    }
    if(this.studyRouteId ==='') {
      this.studentService
        .createStudyRoute(request, this.visitorId)
        .subscribe((res: any) => {
          this.loading = false;
          var response = this.apiResponseHelper.ProcessData(
            res.meta,
            'Class.New'
          );
          if (response.isSuccess == true) {
            this.messageService.success(
              this.translate.instant('Messages.AddNewSuccess')
            );
            this.studyRouteId = res.data;
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
    }else {
      this.updateStudyRoute(request);
    }

      
  }

  updateStudyRoute(request: any) {
    this.studentService
    .updateStudyRoute(request, this.studyRouteId)
    .subscribe((res: any) => {
      this.loading = false;
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

  onUpdateStudyRoute(isApprove: boolean){
    const request: any = {
      target_class_setup_type_id: this.targetClassChecked,
      steps: this.steps
    };
    if(isApprove) {
      request['approving'] = true;
      this.studyRouteStatus = "Approved"
    }else {
      request['rejecting'] = true;
      this.studyRouteStatus = "Rejected"
    }
    this.updateStudyRoute(request);
  }

  get f() {
    return this.visitorDetailForm.controls;
  }
}
