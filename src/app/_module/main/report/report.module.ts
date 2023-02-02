import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from './report-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { SharedComponentModule } from 'src/app/_share/shared-component/shared-component.module';
import { TeacherReportComponent } from './teacher-report/teacher-report.component';
import { NgZorroAntdModule } from 'src/app/_share/ng-zorro-ant.module';
@NgModule({
  declarations: [TeacherReportComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedComponentModule,
    NgZorroAntdModule,
    TranslateModule,
    ReactiveFormsModule,
    SchedulerModule,
  ],
})
export class ReportModule {}
