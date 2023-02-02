import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormVisitorComponent } from './form-visitor/form-visitor.component';
import { StandaloneRoutingModule } from './standalone-routing-module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { SharedComponentModule } from 'src/app/_share/shared-component/shared-component.module';
import { NgZorroAntdModule } from 'src/app/_share/ng-zorro-ant.module';
import { ClassScheduleComponent } from './class-schedule/class-schedule.component';
import { CoreModule } from 'src/app/_core/core.module';

@NgModule({
  declarations: [FormVisitorComponent, ClassScheduleComponent],
  imports: [
    CommonModule,
    StandaloneRoutingModule,
    NgZorroAntdModule,
    SharedComponentModule,
    TranslateModule,
    ReactiveFormsModule,
    SchedulerModule,
    CoreModule,
  ],
})
export class StandaloneModule {}
