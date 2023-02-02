import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from 'src/app/_share/constants/constants';
import * as _ from 'lodash';
import { Router } from '@angular/router';
// import { AuthService } from 'src/app/_services/auth.service2';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-cpn-header',
  templateUrl: './cpn-header.component.html',
  styleUrls: ['./cpn-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CpnHeaderComponent implements OnInit {

  isLoggedIn = false;
  name = '';

  @Input() isCollapsed = false;
  @Output() changeMenu = new EventEmitter<any>();

  visible = false;

  public dataLang = [
    {
      name: 'English',
      title: 'EN',
      code: 'en',
      icon: '../../../assets/images/flags/US.png',
    },
    {
      name: 'Việt Nam',
      title: 'VN',
      code: 'vi',
      icon: '../../../assets/images/flags/VN.png',
    }
  ];

  public selectedLang: string = '';
  public lIconSelected: string = '';

  constructor(
    public translate: TranslateService,
    public router: Router,
    private authService: AuthService
    // private authService: OAuthService
  ) {

    translate.addLangs(Constants.Language);

    const defaultLag = localStorage.getItem('lang') || Constants.Language[0];
    const chooseLag = _.find(this.dataLang, { code: defaultLag });
    this.selectedLang = defaultLag;
    this.lIconSelected = chooseLag?.icon || '';
    translate.setDefaultLang(defaultLag);

    this.authService.loginChanged.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });

    this.authService.nameChanged.subscribe(_name => {
      this.name = _name;
    })

  }

  switchLang(langCode: any) {
    const chooseLag = _.find(this.dataLang, { code: langCode });
    this.lIconSelected = chooseLag?.icon || '';
    localStorage.setItem('lang', langCode);
    this.translate.use(langCode);
  }
  ngOnInit(): void { 
    this.authService.isLoggedIn().then(loggedIn => {
      this.isLoggedIn = loggedIn;
    })
  }

  switchMenu() {
    this.isCollapsed = !this.isCollapsed;
    this.changeMenu.emit(this.isCollapsed);
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
