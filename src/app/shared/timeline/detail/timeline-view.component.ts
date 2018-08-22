import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from '../../auth/auth.service';
import {ContactDecrypted} from '../../contact/models/contact';
import {IdentityService} from '../../contact/services/identity.service';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TimeLineItem} from '../models/timeline';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import {HttpErrorService} from '../../app-http/http-error.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-timeline-view',
  templateUrl: './timeline-view.component.html',
  styles: []
})
export class TimelineViewComponent implements OnInit, OnDestroy {

  @Input() item: TimeLineItem;

  assets = environment.assets;
  addedBy: string;
  @Input() sharedContacts: BehaviorSubject<ContactDecrypted[]>;

  private ngDestroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private translate: TranslateService,
              private router: Router,
              private errorService: HttpErrorService,
              private identityService: IdentityService,
              public authService: AuthService) {
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  ngOnInit(): void {
    this.initAddedBy()
      .takeUntil(this.ngDestroy$)
      .subscribe((message: string) => {
        this.addedBy = message;
      });
  }

  getSharedUsersCount() {
    return Object.keys(this.item.users).length - 1;
  }

  goToContact(shared: ContactDecrypted) {
    this.router.navigate(['/contacts/detail', shared.contactInfo.userId]);

  }

  private initAddedBy(): Observable<string> {
    if (this.authService.getSessionUser().userId !== this.item.owner) {
      return this.identityService.getContactFromCache(this.item.owner)
        .flatMap(contact => {
          return this.translate.get('timelineView.added.by.l2', {
            fName: contact.contactInfo.firstname,
            lName: contact.contactInfo.lastname
          });
        });
    } else {
      return this.translate.get('timelineView.added.by.l1', {
        fName: this.authService.getSessionUser().user.firstName,
        lName: this.authService.getSessionUser().user.lastName
      });
    }
  }
}
