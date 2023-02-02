import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { VisitorListComponent } from './visitor-list/visitor-list.component';
import { StudentListComponent } from './student-list/student-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { SharedComponentModule } from 'src/app/_share/shared-component/shared-component.module';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { VisitorDetailComponent } from './visitor-detail/visitor-detail.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';
import { CreateVisitorComponent } from './create-visitor/create-visitor.component';
import { CoreModule } from 'src/app/_core/core.module';
import { ModalVisitorHistoryComponent } from './modal/modal-visitor-history/modal-visitor-history.component';
import { ModalVisitorEntranceTestComponent } from './modal/modal-visitor-entrance-test/modal-visitor-entrance-test.component';

@NgModule({
  declarations: [
    VisitorListComponent,
    StudentListComponent,
    VisitorDetailComponent,
    StudentDetailComponent,
    CreateVisitorComponent,
    ModalVisitorHistoryComponent,
    ModalVisitorEntranceTestComponent,
  ],
  imports: [
    CoreModule,
    CommonModule,
    StudentRoutingModule,
    SharedComponentModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NzPaginationModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzButtonModule,
    NzGridModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzRadioModule,
    NzSwitchModule,
    NzSelectModule,
    NzSpaceModule,
    NzDividerModule,
    NzTableModule,
    NzTreeSelectModule,
    NzModalModule,
    NzSegmentedModule,
    NzTimePickerModule,
    NzCheckboxModule,
  ],
})
export class StudentModule {}
