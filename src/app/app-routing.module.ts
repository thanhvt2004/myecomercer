import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./_module/main/main.module').then((m) => m.MainModule),
    // data: {
    //   functionCode: 'BYPASS',
    // },
    // canActivate: [AuthGuard],
  },
  {
    path: 'main',
    loadChildren: () =>
      import('./_module/main/main.module').then((m) => m.MainModule),
    // data: {
    //   functionCode: 'BYPASS',
    // },
    // canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./_module/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'callback',
    loadChildren: () =>
      import('./_module/auth-callback/auth-callback.module').then(
        (m) => m.AuthCallbackModule
      ),
  },
  {
    path: 'logout_callback',
    loadChildren: () =>
      import('./_module/logout-callback/logout-callback.module').then(
        (m) => m.LogoutCallbackModule
      ),
  },
  {
    path: 'page-not-found',
    loadChildren: () =>
      import('./_module/page-not-found/page-not-found.module').then(
        (m) => m.PageNotFoundModule
      ),
  },
  {
    path: 'standalone',
    loadChildren: () =>
      import('./_module/standalone/standalone.module').then(
        (m) => m.StandaloneModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
