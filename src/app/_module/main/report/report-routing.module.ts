import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_core/guards/auth.guard';
import { TeacherReportComponent } from './teacher-report/teacher-report.component';

const routes: Routes = [
  {
    path: '',
    component: TeacherReportComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'REPORT',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
