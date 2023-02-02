import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { AuthService } from '../../_services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router, private _authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this._authService.isLoggedIn().then(x => {
      console.log('GUARD: ' + x);
      if (x == false) {
        this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
      }
      return x;
    });
  }
}


// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// import * as _ from 'lodash';
// import { Observable } from 'rxjs';
// import { AuthService } from 'src/app/_services/auth.service';
// // import { AuthService } from 'src/app/_services/auth.service2';
// import { Constants } from 'src/app/_share/constants/constants';
// // import { AuthenticationService } from '@app/_services';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {

//   constructor(private router: Router,
//     private authService: AuthService
//   ) { }

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

//     var result = false;

//     this.authService.canActivateProtectedRoutes$.subscribe(authenticated => {
//       if (authenticated) {
//         result = true;
//       } else {
//         result = false;
//       }
//     });

//     if (result) {
//       //implement check permission
//       return true;
//     } else {
//       localStorage.setItem('returnUrl', state.url);
//       this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
//       return false;
//     }


//     // //if (this.authService.isAuthenticated()) {
//     // // const functionCode = route.data['functionCode'] as string;
//     // // const permissions = JSON.parse(this.authService.profile.permissions);
//     // // var filteredPermisison = _.filter(permissions, x => x === functionCode + '.' + Constants.Permission.Command.View);
//     // // if ((permissions && filteredPermisison.length > 0)
//     // //     || functionCode === "BYPASS") {
//     // return true;
//     // // } else {
//     // //   this.router.navigate(['/access-denied'], {
//     // //     queryParams: { redirect: state.url }
//     // //   });
//     // //   return false;
//     // // }
//     // //}

//     // //return true;


//     // //set data for return url
//     // localStorage.setItem('returnUrl', state.url);
//     // this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
//     // return false;
//   }


// }
