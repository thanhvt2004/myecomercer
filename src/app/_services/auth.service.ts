import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserManager, UserManagerSettings } from 'oidc-client-ts';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userManager: UserManager;
  private _user: any;
  private _loginChangedSubject = new Subject<boolean>();

  loginChanged = this._loginChangedSubject.asObservable();

  private _nameSubject = new Subject<string>();
  nameChanged = this._nameSubject.asObservable();

  //authContext: AuthContext;

  constructor(private _httpClient: HttpClient) {
    this._userManager = new UserManager(getClientSettings());
    this._userManager.events.addAccessTokenExpired(() => {
      this._loginChangedSubject.next(false);
      this._nameSubject.next('');
    });

    this._userManager.events.addUserLoaded((user: any) => {
      console.log('addUserLoaded ' + JSON.stringify(user));
      if (this._user !== user) {
        this._user = user;
        //this.loadSecurityContext();
        this._loginChangedSubject.next(!!user && !user.expired);

        if (user != null && user.profile.name != undefined) {
          this._nameSubject.next(user.profile.name);
        }
      }
    });
  }

  login() {
    return this._userManager.signinRedirect();
  }

  logout() {
    this._userManager.signoutRedirect();
  }

  completeLogin() {
    return this._userManager.signinRedirectCallback().then((user: any) => {
      this._user = user;
      this._loginChangedSubject.next(!!user && !user.expired);

      if (user != null && user.profile.name != undefined) {
        this._nameSubject.next(user.profile.name);
      }

      return user;
    });
  }

  isLoggedIn(): Promise<boolean> {
    return this._userManager.getUser().then((user: any) => {
      console.log(user);
      const userCurrent = !!user && !user.expired;
      if (this._user !== user) {
        this._loginChangedSubject.next(userCurrent);
      }

      this._user = user;
      if (user != null && user.profile.name != undefined) {
        this._nameSubject.next(user.profile.name);
      }

      return userCurrent;
    });
  }

  getAccessToken() {
    return this._userManager.getUser().then((user: any) => {
      if (!!user && !user.expired) {
        return user.access_token;
      } else {
        return null;
      }
    });
  }
}

export function getClientSettings(): UserManagerSettings {
  return {
    authority: environment.authorityUrl,
    client_id: environment.clientId,
    redirect_uri: `${environment.clientUrl}/${environment.callback}`,
    scope: 'openid offline',
    response_type: 'code',
    post_logout_redirect_uri: `${environment.clientUrl}/${environment.logoutCallback}`,
    automaticSilentRenew: true,
    silent_redirect_uri: `${environment.clientUrl}/silent-callback.html`,
    loadUserInfo: true,
  };
}
