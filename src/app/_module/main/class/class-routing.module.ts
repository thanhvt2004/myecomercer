import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_core/guards/auth.guard';
import { ClassDetailComponent } from './class-detail/class-detail.component';
import { ClassListComponent } from './class-list/class-list.component';
import { ClassNewComponent } from './class-new/class-new.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
     canActivate: [AuthGuard],
    data: {
      functionCode: 'CLASS',
    },
  },
  {
    path: 'list',
    component: ClassListComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'CLASS',
    },
  },
  {
    path: 'new',
    component: ClassNewComponent,
    canActivate: [AuthGuard],
    data: {
      functionCode: 'CLASS',
    },
  },
  {
    path: 'detail/:id',
    component: ClassDetailComponent,
      canActivate: [AuthGuard],
    data: {
      functionCode: 'CLASS',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassRoutingModule {}
