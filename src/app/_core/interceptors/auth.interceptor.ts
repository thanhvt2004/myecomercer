// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { AuthService } from 'src/app/_services/auth.service2';
// @Injectable()
// export class BasicAuthInterceptor implements HttpInterceptor {
//     constructor(private authService: AuthService) { }

//     intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `${this.authService.authorizationHeaderValue}`
//         }
//       });
//       return next.handle(request);
//     }
// }
