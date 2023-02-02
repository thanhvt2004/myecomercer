import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private router: Router,
        private messageService: NzMessageService,
        private translate: TranslateService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            var errResult: any;
            if (err.status === 401) {
                // logout 
                this.router.navigate(['/login']);
            }
            else if (err.status === 403) {
                this.messageService.error(this.translate.instant('Messages.403'));
                this.router.navigate(['/access-denied']);
            }
            else if (err.status === 404) {
                this.messageService.error(this.translate.instant('Messages.404'));
            }
            else {
                errResult = {
                    status: err.status,
                    statusText: err.statusText,
                    errListCode: err.error
                }
                this.messageService.error(this.translate.instant('Messages.SystemError'));

            }
           
           return throwError(errResult);
        }))
    }

}
