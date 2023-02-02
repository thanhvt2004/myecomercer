import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_core/guards/auth.guard';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'class',
        pathMatch: 'prefix',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        data: {
          functionCode: 'BYPASS',
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'class',
        loadChildren: () =>
          import('./class/class.module').then((m) => m.ClassModule),
        // data: {
        //   functionCode: 'BYPASS',
        // },
        // canActivate: [AuthGuard],
      },
      {
        path: 'teacher',
        loadChildren: () =>
          import('./teacher/teacher.module').then((m) => m.TeacherModule),
        data: {
          functionCode: 'BYPASS',
        },
        //canActivate: [AuthGuard],
      },
      {
        path: 'student',
        loadChildren: () =>
          import('./student/student.module').then((m) => m.StudentModule),
        data: {
          functionCode: 'BYPASS',
        },
        //canActivate: [AuthGuard],
      },
      {
        path: 'manage',
        loadChildren: () =>
          import('./manage/manage.module').then((m) => m.ManageModule),
        data: {
          functionCode: 'BYPASS',
        },
        //canActivate: [AuthGuard],
      },
      {
        path: 'report',
        loadChildren: () =>
          import('./report/report.module').then((m) => m.ReportModule),
        data: {
          functionCode: 'BYPASS',
        },
        //canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
