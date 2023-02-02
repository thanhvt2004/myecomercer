import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_core/guards/auth.guard';
import { ClassScheduleComponent } from './class-schedule/class-schedule.component';
import { FormVisitorComponent } from './form-visitor/form-visitor.component';

const routes: Routes = [
  {
    path: '',
    component: FormVisitorComponent,
    data: {
      functionCode: 'STANDALONE',
    },
  },
  {
    path: 'schedule',
    component: ClassScheduleComponent,
    data: {
      functionCode: 'STANDALONE',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StandaloneRoutingModule {}
