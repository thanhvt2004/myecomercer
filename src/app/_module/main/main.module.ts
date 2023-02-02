import { CpnHeaderComponent } from './../../_layout/cpn-header/cpn-header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { IconsProviderModule } from 'src/app/icons-provider.module';
import { SidebarComponent } from 'src/app/_layout/sidebar/sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'src/app/_share/ng-zorro-ant.module';
import { FormsModule } from '@angular/forms';

import { BlockUIModule } from 'ng-block-ui';
import { BlockUIHttpModule } from 'ng-block-ui/http';
import { SharedComponentModule } from 'src/app/_share/shared-component/shared-component.module';

@NgModule({
  declarations: [MainComponent, SidebarComponent, CpnHeaderComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    FormsModule,
    TranslateModule,
    IconsProviderModule,
    NgZorroAntdModule,
    BlockUIModule.forRoot({
      delayStart: 0,
      delayStop: 0,
    }),
    BlockUIHttpModule.forRoot({
      blockAllRequestsInProgress: true,
    }),

    SharedComponentModule,
  ],
})
export class MainModule {}
