import {Component} from '@angular/core';
import {environment} from '../../../environments/environment';
import {VersionService} from '../../shared/version/version.service';


@Component({
  selector: 'app-footer',
  template: `
    <footer class="bg-faded">
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  assets = environment.assets;

  constructor(public versionService: VersionService) { }
}
