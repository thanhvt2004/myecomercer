import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogoutCallbackComponent } from './logout-callback.component';

const routes: Routes = [
  {
    path:'',
    component: LogoutCallbackComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogoutCallbackRoutingModule { }
