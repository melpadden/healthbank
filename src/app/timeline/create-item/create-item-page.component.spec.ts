import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {CreateItemPageComponent} from './create-item-page.component';
import {TimelineModule} from '../timeline.module';
import {toDateTime} from '../../shared/date/date.type';
import {FileWithPreview} from '../../shared/timeline/models/timeline';
import { ENV_SETTING_TEST_PROVIDER } from '../../settings-loader.spec';

describe('CreateItemPageComponent', () => {
  let component: CreateItemPageComponent;
  let fixture: ComponentFixture<CreateItemPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TimelineModule, RouterTestingModule, NgbModule.forRoot()],
      providers: [ENV_SETTING_TEST_PROVIDER],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateItemPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be compiled', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the page', () => {
    component.disablePage();
    expect(component.disable).toBeTruthy();
  });

  it('should have only lower case tag', () => {
    component.onAdding('TEST').subscribe(tag => {
      expect(tag).toBe('TEST'.toLowerCase());
    }).unsubscribe();
  });

  it('should reset the form', () => {
    component.createItemForm.controls['title'].setValue('TEST');
    component.createItemForm.controls['files'].setValue('MockFile');
    component.now();
    expect(component.createItemForm.valid).toBeTruthy();
    component.reset();
    expect(component.createItemForm.valid).toBeFalsy();
  });

  it('should receive a file', () => {
    component.getFiles([{
      originalFile: new File(['originalFile'], 'thumbnail_', {type: 'image/jpeg'}),
      originalFileMetadata: {size: '10Kb', name: 'name', type: 'any'},
      thumbnail: new File(['test'], 'thumbnail_', {type: 'image/jpeg'})
    } as FileWithPreview]);
    expect(component.createItemForm.controls['files'].value[0].originalFile).not.toBe(null);
    expect(component.createItemForm.controls['files'].value[0].thumbnail).not.toBe(null);
    expect(component.createItemForm.controls['files'].value[0].originalFileMetadata.name).toBe('name');
    component.getFiles([]);
    expect(component.createItemForm.controls['files'].value).toBe(null);
  });

});
