import {Component} from '@angular/core';

@Component({
  selector: 'app-secured-template',
  template: `
    <app-navigation></app-navigation>

    <div class="container">
      <mc-breadcrumbs></mc-breadcrumbs>
      <router-outlet></router-outlet>
    </div>

    <app-footer></app-footer>
  `
})
export class SecuredTemplateComponent {
  constructor() {
  }
}
