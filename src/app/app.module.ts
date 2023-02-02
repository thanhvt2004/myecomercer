import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NzI18nService, NZ_I18N } from 'ng-zorro-antd/i18n';
import { vi_VN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsProviderModule } from './icons-provider.module';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { BlockUIModule } from 'ng-block-ui';
import { BlockUIHttpModule } from 'ng-block-ui/http';

// import { BasicAuthInterceptor } from './_core/interceptors/auth.interceptor';
import { AuthService } from './_services/auth.service';
registerLocaleData(vi);

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    HttpClientModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BlockUIModule.forRoot({
      delayStart: 0,
      delayStop: 0,
    }),
    BlockUIHttpModule.forRoot({
      blockAllRequestsInProgress: true,
    }),
    SchedulerModule,

    //for authen
    //CoreModule.forRoot(),
    // OAuthModule.forRoot()
  ],
  providers: [
    // { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // AuthGuard,
    AuthService,
    { provide: NZ_I18N, useValue: vi_VN },
    // {
    //   provide: OAuthStorage,
    //   useValue: localStorage
    // }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private i18n: NzI18nService) {}
  // switchLanguage() {
  //   //this.i18n.setDateLocale(vi); // TODO
  //   this.i18n.setLocale(vi_VN);
  // }
}
