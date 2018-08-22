import { Component } from '@angular/core';

@Component({
  selector: 'app-forbidden-page',
  template: `
    <div class="container">
      <header class="jumbotron" id="banner">
        <div class="container text-center">
          <h1>Zugriff verweigert</h1>

          <h2>Sie haben keine erforderlichen Zugriffsrechte für diese Seite.</h2>
        </div>
      </header>

      <div class="text-center">
        <p>
          <a routerLink="/" class="btn btn-primary">Zurück zur Startseite</a>
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class ForbiddenPageComponent {
  constructor() { }
}
