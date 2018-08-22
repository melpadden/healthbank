import {Component, OnInit} from '@angular/core';
import {VersionService} from '../../shared/version/version.service';
import {AuthService} from '../../shared/auth/auth.service';
import {SessionUser} from '../../shared/user/user-session';

@Component({
  selector: 'app-landing-page',
  template: `
    <app-header (sessionUser)="setSessionUser($event)"></app-header>
    <div *ngIf="!sessionUser; else template">
      <app-user-select-page (sessionUser)="setSessionUser($event)"></app-user-select-page>
    </div>
    <ng-template #template>
      <app-login [(sessionUser)]="sessionUser" ></app-login>
    </ng-template>
    <app-footer></app-footer>
  `,
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  sessionUser: SessionUser;

  constructor(public versionService: VersionService,
              private auth: AuthService) {
  }

  ngOnInit(): void {
    this.sessionUser = this.auth.getSessionUser();
  }

  setSessionUser($event: SessionUser) {
    this.sessionUser = $event;
  }
}
