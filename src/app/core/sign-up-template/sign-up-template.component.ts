import {Component} from '@angular/core';

@Component({
  selector: 'app-sign-up-template',
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
})
export class SignUpTemplateComponent {

  constructor() {
  }
}
