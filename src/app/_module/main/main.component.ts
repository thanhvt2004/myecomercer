import { Constants } from './../../_share/constants/constants';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  isCollapsed = false;
 
  
  
  constructor(
    public translate: TranslateService
  ) {
    translate.addLangs(Constants.Language);
    translate.setDefaultLang(Constants.Language[0]);
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {
  }

  changeMenu($event:any){
    this.isCollapsed = $event;
  }
}
