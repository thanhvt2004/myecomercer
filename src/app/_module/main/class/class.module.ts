import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassRoutingModule } from './class-routing.module';
import { ClassListComponent } from './class-list/class-list.component';
import { ClassNewComponent } from './class-new/class-new.component';
import { SharedComponentModule } from 'src/app/_share/shared-component/shared-component.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClassDetailComponent } from './class-detail/class-detail.component';
import { ModalAddStudentComponent } from './modal/modal-add-student/modal-add-student.component';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { ModalAddSessionComponent } from './modal/modal-add-session/modal-add-session.component';
import { CoreModule } from 'src/app/_core/core.module';
import { NgZorroAntdModule } from 'src/app/_share/ng-zorro-ant.module';
import { ModalSessionComponent } from './modal/modal-session/modal-session.component';
import { ModalWeeklySessionComponent } from './modal/modal-weekly-session/modal-weekly-session.component';
import { AddTeachersRoomsComponent } from './modal/add-teachers-rooms/add-teachers-rooms.component';
import { NgxMaskModule } from 'ngx-mask';
@NgModule({
  declarations: [
    ClassListComponent,
    ClassNewComponent,
    ClassDetailComponent,
    ModalAddStudentComponent,
    ModalAddSessionComponent,
    ModalSessionComponent,
    ModalWeeklySessionComponent,
    AddTeachersRoomsComponent,
  ],
  imports: [
    CoreModule,
    CommonModule,
    FormsModule,
    ClassRoutingModule,
    SharedComponentModule,
    NgZorroAntdModule,
    TranslateModule,
    ReactiveFormsModule,
    SchedulerModule,
    NgxMaskModule.forRoot(),
  ],
})
export class ClassModule {}
