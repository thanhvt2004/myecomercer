import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogoutCallbackRoutingModule } from './logout-callback-routing.module';
import { LogoutCallbackComponent } from './logout-callback.component';


@NgModule({
  declarations: [
    LogoutCallbackComponent
  ],
  imports: [
    CommonModule,
    LogoutCallbackRoutingModule
  ]
})
export class LogoutCallbackModule { }
