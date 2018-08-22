import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  template: `
    <div class="container">
      <header class="jumbotron" id="banner">
        <div class="container text-center">
          <h1>Nicht Gefunden</h1>

          <h2>Die angeforderte Seite existiert nicht.</h2>
        </div>
      </header>

      <div class="text-center">
        <p>
          <a routerLink="/" class="btn btn-primary">Zurück zur Startseite</a>
        </p>
      </div>
    </div>
  `
})
export class NotFoundPageComponent {
  constructor() {
  }
}
