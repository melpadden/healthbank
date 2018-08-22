import { Routes } from '@angular/router';
import { NotFoundPageComponent } from './core/error/not-found-page.component';


export const appRoutes: Routes = [
  {
    path: '**',
    component: NotFoundPageComponent
  }
];
