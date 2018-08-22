import * as _ from 'lodash';
import {ResponseErrors} from './app-http/http-error.service';
import {Injectable} from '@angular/core';

/**
 * Service to Init application properties.
 */
@Injectable()
export class InitService {

  commonResponseErrors(responseErrorMessages: ResponseErrors) {
    _.extend(responseErrorMessages, {
      version__conflict: ['Fehler!', 'Dieses Objekt wurde zwischenzeitlich von einem anderen Nutzer bearbeitet. ' +
      'Laden Sie die Seite bitte neu, Ihre Änderungen gehen dabei verloren.'],
    });
  }
}
