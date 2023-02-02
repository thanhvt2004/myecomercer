import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_core/guards/auth.guard';
import { CreateTeacherComponent } from './create-teacher/create-teacher.component';
import { TeacherDetailComponent } from './teacher-detail/teacher-detail.component';
import { TeacherListComponent } from './teacher-list/teacher-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    canActivate: [AuthGuard],
    data: {
      functionCode: 'TEACHER',
    },
  },
  {
    path: 'list',
    component: TeacherListComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'TEACHER',
    },
  },
  {
    path: 'detail/:id',
    component: TeacherDetailComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'TEACHER',
    },
  },
  {
    path: 'create',
    component: CreateTeacherComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'TEACHER',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherRoutingModule {}
