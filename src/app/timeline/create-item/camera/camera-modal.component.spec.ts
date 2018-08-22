import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { TimelineModule } from '../../timeline.module';
import { CameraModalComponent } from './camera-modal.component';

describe('CameraModalComponent', () => {
  let component: CameraModalComponent;
  let fixture: ComponentFixture<CameraModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TimelineModule, RouterTestingModule, NgbModule.forRoot()],

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be compiled', () => {
    expect(component).toBeTruthy();
  });

});
