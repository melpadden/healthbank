import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { RouterModule } from '@angular/router';
import { FormErrorModule } from 'ngx-form-error';
import { userRoutes } from './user.routing';
import { ProfilePageComponent } from './profile/profile-page.component';
import { DeleteAccountModalComponent } from './profile/modal/delete-account-modal.component';
import { ConfirmDeleteAccountModalComponent } from './profile/modal/confirm-delete-account-modal.component';

import {ZXingScannerComponent, ZXingScannerModule} from '@zxing/ngx-scanner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(userRoutes),
    CoreModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FormErrorModule,
    ZXingScannerModule,
  ],
  entryComponents: [
    DeleteAccountModalComponent,
    ConfirmDeleteAccountModalComponent,
  ],
  declarations: [
    ProfilePageComponent,
    DeleteAccountModalComponent,
    ConfirmDeleteAccountModalComponent,
  ],
})
export class UserModule { }
