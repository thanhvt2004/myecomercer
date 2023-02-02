import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardTeacherComponent } from './dashboard-teacher/dashboard-teacher.component';
import { DashboardManagerComponent } from './dashboard-manager/dashboard-manager.component';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    DashboardComponent,
    DashboardTeacherComponent,
    DashboardManagerComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    TranslateModule,

    SchedulerModule
  ]
})
export class DashboardModule { }
