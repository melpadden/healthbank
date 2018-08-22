import {Component, OnDestroy, OnInit} from '@angular/core';
import {extractDate, extractTime, mergeDateAndTime, toDateTime} from '../../shared/date/date.type';
import {TimeLineService} from '../../shared/timeline/services/timeline.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ItemType} from '../../shared/timeline/models/enums/item-type.enum';
import {ToastService} from '../../shared/toast/toast.service';
import {touchAllFields} from '../../shared/ngrx-form/ngrx-form-utils';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../shared/auth/auth.service';
import {ListTimelinePageParams} from '../list-items/list-timeline-page.component';
import {TagModel} from 'ngx-chips/core/accessor';
import {Observable} from 'rxjs/Observable';
import {timeValidator} from '../../shared/date/time.validator';
import {TranslateService} from '@ngx-translate/core';
import {isObject} from 'rxjs/util/isObject';
import {TimeLineItem} from '../../shared/timeline/models/timeline';
import {FileWithPreview} from '../../shared/timeline/models/timeline';
import {TagInputComponent} from 'ngx-chips';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item-page.component.html',
  styleUrls: ['../../../themes/tag-styles.scss']
})

export class CreateItemPageComponent implements OnInit, OnDestroy {

  assets = environment.assets;
  createItemForm: FormGroup;
  resetDrop: boolean;
  disable: boolean;
  owner: string;
  tagValidators = [Validators.maxLength(48)];
  tagErrorMessages = {
    'maxlength': 'The tag is too long',
  };
  tagInputTranslations = {};
  private ngDestroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private timeLineService: TimeLineService,
              private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private toastService: ToastService,
              private route: ActivatedRoute,
              private translate: TranslateService) {
    this.initFormDescription();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => this.owner = ((<ListTimelinePageParams> params).owner));
    this.enablePage();
    this.now();
    this.translate.get('createItemPage.form.tags.placeholder').subscribe((translation) => {
      this.tagInputTranslations['placeholder'] = translation;
    });
    this.translate.get('createItemPage.form.tags.secondaryPlaceholder').subscribe((translation) => {
      this.tagInputTranslations['secondaryPlaceholder'] = translation;
    });
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  initFormDescription() {
    this.createItemForm = this.fb.group(
      {
        title: new FormControl('', [Validators.required]),
        files: new FormControl('', [Validators.required]),
        creationDate: new FormControl('', [Validators.required]),
        creationTime: new FormControl('', [Validators.required, timeValidator()]),
        tags: [''],
      });
  }

  createItem() {
    // Validate
    if (this.createItemForm.invalid) {
      touchAllFields(this.createItemForm);
      this.toastService.error('createItemPage.toast.invalid.message', 'createItemPage.toast.invalid.title');
      return;
    }

    // Prepare data to send
    // TODO: correct parameters
    const actualOwner: string = this.owner ? this.owner : this.authService.getSessionUser().userId;
    const uploadedFile: FileWithPreview = this.createItemForm.controls['files'].value[0];

    const mItem: TimeLineItem = {
      reference: null,
      owner: actualOwner,
      itemType: ItemType.DOCUMENT,
      time: mergeDateAndTime(this.createItemForm.controls['creationDate'].value, this.createItemForm.controls['creationTime'].value),
      uploadTime: null,
      metadata: {
        title: this.createItemForm.controls['title'].value,
        creationDate: this.createItemForm.controls['creationDate'].value,
        creationTime: this.createItemForm.controls['creationTime'].value,
        tags: this.createItemForm.controls['tags'].value,
      },
      fileMetadata: {
        name: uploadedFile.originalFileMetadata.name,
        size: uploadedFile.originalFileMetadata.size,
        type: uploadedFile.originalFileMetadata.type
      },
      contentReference: null,
      thumbnailReference: null,
      content: null,
    };

    // Start createItem process
    this.disablePage();
    this.timeLineService.createItemMultiPart(actualOwner, mItem, uploadedFile.originalFile, uploadedFile.thumbnail)
      .takeUntil(this.ngDestroy$)
      .subscribe(value => {
        this.toastService.success('createItemPage.toast.success.message', 'createItemPage.toast.success.title');
        this.reset();
      });
  }

  getFiles(data: Array<FileWithPreview>) {
    console.log('Files to upload', data);
    this.resetDrop = false;
    if (data.length === 0) {
      this.createItemForm.controls['files'].reset();
    } else {
      this.createItemForm.controls['files'].setValue(Object.assign({}, data));
    }
  }

  reset() {
    this.resetDrop = true;
    this.createItemForm.reset();
    this.router.navigate([`/timeline`], {queryParams: this.owner ? {owner: this.owner} : {}});
  }

  disablePage() {
    this.createItemForm.disable();
    this.disable = true;
  }

  enablePage() {
    this.createItemForm.enable();
    this.disable = false;
  }

  now() {
    const currentDateTime = toDateTime(new Date());
    this.createItemForm.controls['creationDate'].setValue(extractDate(currentDateTime));
    this.createItemForm.controls['creationTime'].setValue(extractTime(currentDateTime));
  }

  onAdding(tag): Observable<TagModel> {
    return Observable.of(tag).map(value => {
      // In case of copy-paste text
      if (isObject(value)) {
        value.display = value.display.trim().toLowerCase();
        value.value = value.value.trim().toLowerCase();
        return value;
      }
      return value.toLowerCase();
    });
  }

  // NOTE: Android Chrome not recognize space keyCode
  handleSpace(tagText: string, tagInput: TagInputComponent) {
    if (tagText && tagText.indexOf(' ') >= 0) {
      const tags = this.createItemForm.controls['tags'].value ? this.createItemForm.controls['tags'].value : [];
      const tagToInsert = tagText.split(' ')[0].trim().toLowerCase();
      if (tags.filter(tag => tag === tagToInsert).length === 0) {
        this.createItemForm.controls['tags'].setValue([...tags, tagToInsert]);
      }
      tagInput.setInputValue('');
    }
  }
}
