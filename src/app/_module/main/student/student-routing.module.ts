import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_core/guards/auth.guard';
import { StudentListComponent } from './student-list/student-list.component';
//import { StudentDetailComponent} from './student-detail/student-detail.component'
import { VisitorDetailComponent } from './visitor-detail/visitor-detail.component';
import { VisitorListComponent } from './visitor-list/visitor-list.component';
import { CreateVisitorComponent } from './create-visitor/create-visitor.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';

const routes: Routes = [
  {
    path: '',
    component: VisitorListComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'STUDENT',
    },
  },
  {
    path: 'visitor',
    component: VisitorListComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'STUDENT',
    },
  },
  {
    path: 'visitor/detail/:id',
    component: VisitorDetailComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'STUDENT',
    },
  },
  {
    path: 'student-list',
    component: StudentListComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'STUDENT',
    },
  },
  {
    path: 'student/detail/:id',
    component: StudentDetailComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'STUDENT',
    },
  },
  
  {
    path: 'visitor/create',
    component: CreateVisitorComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'STUDENT',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentRoutingModule {}
