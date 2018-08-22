import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { VersionService } from '../version/version.service';

@Injectable()
export class RuntimeErrorHandlerService extends ErrorHandler {

  constructor(private injector: Injector) {
    super();
  }

  handleError(error: any) {
    const body = document.getElementsByTagName('BODY')[0];

    if (!document.querySelector('.modal.error')) {
      const versionService = this.injector.get<VersionService>(VersionService);

      const backDrop = document.createElement('DIV');
      backDrop.className = 'modal-backdrop fade show';
      body.appendChild(backDrop);

      const modal = document.createElement('DIV');
      modal.className = 'modal fade show error';
      modal.style.display = 'block';
      modal.tabIndex = -1;
      modal.innerHTML = `
        <div role="document" class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-body">
              <a href="./" class="float-right btn btn-secondary">Seite neu laden</a>

              <h2 class="modal-title">Ein Systemfehler ist aufgetreten.</h2>
              <div class="row">
                <p id="lead" class="col-md-10 lead"></p>
              </div>
              <p>
                Bitte wenden Sie sich an den Support mit den unten angeführten Informationen.
              </p>
              <em>Technische Details</em>
              <div class="content details">
                <div class="row">
                  <div class="col-sm-2">Version</div>
                  <div id="version" class="col-sm-10"></div>
                </div>
                <div class="row">
                  <div class="col-sm-2">Zeitstempel</div>
                  <div id="timestamp" class="col-sm-10"></div>
                </div>
                <div>
                  Stacktrace
                  <pre class="rounded bg-faded p-1" id="stacktrace" style="white-space: pre-wrap;"></pre>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      body.appendChild(modal);
      const lead = document.getElementById('lead');
      const version = document.getElementById('version');
      const timestamp = document.getElementById('timestamp');
      const stacktrace = document.getElementById('stacktrace');

      lead.innerText = error && error.message;
      version.innerText = versionService.getFormattedFull();
      timestamp.innerText = new Date().toISOString() + ' (U)';
      stacktrace.innerText = error && (error.stack || JSON.stringify(error));
    }

    super.handleError(error);
  }
}
