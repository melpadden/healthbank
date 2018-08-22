import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {TimeLineService} from '../../shared/timeline/services/timeline.service';
import {TimeLineItem} from '../../shared/timeline/models/timeline';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AuthService} from '../../shared/auth/auth.service';
import 'rxjs/add/operator/switchMap';
import {Subject} from 'rxjs/Subject';
import {HttpErrorService} from '../../shared/app-http/http-error.service';

@Component({
  selector: 'app-list-timeline-page',
  templateUrl: './list-timeline-page.component.html',
  styleUrls: []
})
export class ListTimelinePageComponent implements OnInit, OnDestroy {

  loadedItems$: Observable<Array<TimeLineItem>>;
  owner: string;
  responseContinuation: string;
  private ngDestroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private timeLineService: TimeLineService,
              private authService: AuthService,
              public route: ActivatedRoute,
              private errorService: HttpErrorService,
              public router: Router) {
  }

  ngOnInit() {
    this.loadedItems$ = this.timeLineService.getItemsSubject();
    this.route.queryParams
      .switchMap(params => {
        this.owner = params.owner;
        return this.timeLineService.reloadItemsSubject(params.owner ? params.owner : this.authService.getSessionUser().userId);
      })
      .takeUntil(this.ngDestroy$)
      .subscribe(value => {
      this.responseContinuation = value;
    }, error => {
        this.errorService.processErrorToast(error);
      });
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  loadMore(token: string) {
    this.timeLineService.getMore(this.owner ? this.owner : this.authService.getSessionUser().userId, this.responseContinuation)
      .takeUntil(this.ngDestroy$)
      .subscribe(value => {
        this.responseContinuation = value;
      });
  }

}

export interface ListTimelinePageParams extends Params {
  owner: string;
}
