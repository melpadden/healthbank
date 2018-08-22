import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div>
        <svg class="ma-icon-sync" aria-hidden="true">
            <use attr.xlink:href="{{assets}}/images/symbol-defs.svg#ma-icon-sync"></use>
        </svg>
    </div>
  `,
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit {
  assets = environment.assets;

  constructor() { }

  ngOnInit() {
  }

}
