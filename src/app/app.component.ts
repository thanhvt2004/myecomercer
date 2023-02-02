import { Component } from '@angular/core';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
    //this.configureSingleSignOn();
  }

  // configureSingleSignOn() {
  //   this.oauthService.configure(authConfig);
  //   //this.oauthService.tokenValidationHandler = new JwksValidationHandler();
  //   this.oauthService.loadDiscoveryDocumentAndTryLogin();

  //   this.oauthService.events
  //     .pipe(filter((e) => e.type === 'token_received'))
  //     .subscribe((_) => {
  //       this.oauthService.loadUserProfile();
  //     });
  // }

}
