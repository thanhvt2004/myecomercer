import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AioTemplateLayoutComponent } from './aio-template-layout/aio-template-layout.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';



@NgModule({
  declarations: [
    AioTemplateLayoutComponent
  ],
  imports: [
    CommonModule,
    NzGridModule,
    NzLayoutModule,
    NzBreadCrumbModule
  ],
  exports: [
    AioTemplateLayoutComponent
  ]
})
export class SharedComponentModule { }
