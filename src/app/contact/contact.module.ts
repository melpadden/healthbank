import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule, NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {RouterModule} from '@angular/router';
import {FormErrorModule} from 'ngx-form-error';
import {ContactListPageComponent} from './contact-list/contact-list-page.component';
import {AddContactModalSuccessComponent} from './add-contact/add-contact-modal-success.component';
import {contactRoutes} from './contact.routing';
import {AddContactChooseModalComponent} from './add-contact/add-contact-choose-modal.component';
import {AddContactCreateKeyModalComponent} from './add-contact/add-contact-create-key-modal.component';
import {AddContactEnterKeyModalComponent} from './add-contact/add-contact-enter-key-modal.component';
import {ContactDetailPageComponent} from './contact-detail/contact-detail-page.component';
import {ContactDetailComponent} from './contact-detail/contact-detail.component';
import {ContactDetailPageResolver} from './contact-detail/contact-detail-page.resolver';
import {ContactSharedByDetailComponent} from './contact-detail/contact-shared-by-detail.component';
import {ContactSharedWithDetailComponent} from './contact-detail/contact-shared-with-detail.component';
import {ContactTimelineViewPageResolver} from './timeline-detail/contact-timeline-view-page.resolver';
import {ContactTimelineDetailBreadcrumbResolver} from './timeline-detail/contact-timeline-detail-breadcrumb.resolver';
import {ContactDeleteDialogComponent} from './contact-delete/contact-delete.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    NgbTabsetModule.forRoot(),
    RouterModule.forChild(contactRoutes),
    CoreModule,
    SharedModule,
    ReactiveFormsModule,
    FormErrorModule,
  ],
  entryComponents: [
    AddContactCreateKeyModalComponent,
    AddContactEnterKeyModalComponent,
    AddContactChooseModalComponent,
    AddContactModalSuccessComponent,
    ContactDeleteDialogComponent,
  ],
  declarations: [
    ContactListPageComponent,
    ContactDeleteDialogComponent,
    ContactDetailPageComponent,
    ContactDetailComponent,
    ContactSharedByDetailComponent,
    ContactSharedWithDetailComponent,
    AddContactCreateKeyModalComponent,
    AddContactEnterKeyModalComponent,
    AddContactChooseModalComponent,
    AddContactModalSuccessComponent,
  ],
  providers: [
    ContactDetailPageResolver,
    ContactTimelineViewPageResolver,
    ContactTimelineDetailBreadcrumbResolver
  ]
})
export class ContactModule { }
