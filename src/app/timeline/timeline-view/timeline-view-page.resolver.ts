import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {TimeLineService} from '../../shared/timeline/services/timeline.service';
import {TimeLineItem} from '../../shared/timeline/models/timeline';
import {Observable} from 'rxjs/Observable';
import {HttpErrorService} from '../../shared/app-http/http-error.service';

@Injectable()
export class TimelineViewPageResolver implements Resolve<TimeLineItem> {

  constructor(private timeLineService: TimeLineService,
              private router: Router,
              private route: ActivatedRoute,
              private errorService: HttpErrorService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.timeLineService.getItem(route.queryParams['reference'])
      .catch(err => {
        if (!err || (err && err.status !== 401)) {
          this.router.navigate(['../timeline/'], {relativeTo: this.route});
        }
        this.errorService.processErrorToast(err);
        return Observable.of(null);
      });
  }
}
