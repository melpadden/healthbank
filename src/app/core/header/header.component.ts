import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {environment} from '../../../environments/environment';
import {VersionService} from '../../shared/version/version.service';
import {Router} from '@angular/router';
import {LoginService} from '../../shared/auth/login.service';
import {SessionUser} from '../../shared/user/user-session';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import {ENV_SETTINGS_TOKEN, EnvSettings} from '../../settings-loader';

@Component({
  selector: 'app-header',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" routerLink="" (click)="homeClicked()">
        <img src="{{assets}}/images/healthbank-logo.png" style="height: 2.1rem">
        healthbank
      </a>
    </nav>
  `,
  styleUrls: []
})
export class HeaderComponent {
  assets = environment.assets;

  @Output() sessionUser = new EventEmitter<SessionUser>();

  constructor(public versionService: VersionService,
              private router: Router,
              private loginService: LoginService,
              @Inject(ENV_SETTINGS_TOKEN) private envSettings: EnvSettings) {
  }

  homeClicked() {
    this.loginService.logout();
    this.sessionUser.emit(null);
  }

  mediplanClicked() {
  }

  timelineClicked() {
  }

}
