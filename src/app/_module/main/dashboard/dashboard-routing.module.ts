import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_core/guards/auth.guard';
import { DashboardManagerComponent } from './dashboard-manager/dashboard-manager.component';
import { DashboardTeacherComponent } from './dashboard-teacher/dashboard-teacher.component';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      functionCode: 'DASHBOARD_ADMIN',
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'teacher',
    component: DashboardTeacherComponent,
    data: {
      functionCode: 'DASHBOARD_TEACHER',
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'manager',
    component: DashboardManagerComponent,
    data: {
      functionCode: 'DASHBOARD_MANAGER',
    },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
