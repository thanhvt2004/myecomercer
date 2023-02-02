import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
// import { AuthService } from 'src/app/_services/auth.service2';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss']
})
export class AuthCallbackComponent implements OnInit {

  public error!: boolean;

  constructor(
    private authService: AuthService,
    private router: Router
    , private route: ActivatedRoute) { }


  async ngOnInit() {
    // check for error
    if (this.route.snapshot.queryParams['error']) {
      this.error = true;
      return;
    }

    this.authService.completeLogin().then(user => {
      var returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl != undefined && returnUrl.length > 0) {
        this.router.navigate([returnUrl]);
      } else {
        this.router.navigate(['/']);
      }
    })


  }

}
