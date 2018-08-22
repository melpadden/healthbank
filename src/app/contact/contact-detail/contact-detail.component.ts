import {Component, Input} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ContactDecrypted} from '../../shared/contact/models/contact';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styles: []
})
export class ContactDetailComponent {

  @Input() contact: ContactDecrypted;

  assets = environment.assets;

  constructor() {
  }
}
