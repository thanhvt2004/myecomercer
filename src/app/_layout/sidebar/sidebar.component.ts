import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'aio-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;

  //for open current menu
  public currentRoute: string = '';

  constructor(private route: Router) {
    this.currentRoute = this.route.url.split('/')[1];
  }

  ngOnInit(): void {}
}
