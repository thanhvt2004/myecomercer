import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherListComponent } from './teacher-list/teacher-list.component';
import { TeacherDetailComponent } from './teacher-detail/teacher-detail.component';

import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedComponentModule } from 'src/app/_share/shared-component/shared-component.module';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { CoreModule } from 'src/app/_core/core.module';
import { NgZorroAntdModule } from 'src/app/_share/ng-zorro-ant.module';
import { CreateTeacherComponent } from './create-teacher/create-teacher.component';
import { NgxMaskModule } from 'ngx-mask';
@NgModule({
  declarations: [
    TeacherListComponent,
    TeacherDetailComponent,
    CreateTeacherComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    NgZorroAntdModule,
    NgxMaskModule.forRoot(),
    TeacherRoutingModule,
    SharedComponentModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SchedulerModule,
  ],
})
export class TeacherModule {}
