import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { DropFileComponent } from './drop-file.component';
import { TimelineModule } from '../../timeline.module';

describe('DropFileComponent', () => {
  let component: DropFileComponent;
  let fixture: ComponentFixture<DropFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TimelineModule, RouterTestingModule, NgbModule.forRoot()],

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be compiled', () => {
    expect(component).toBeTruthy();
  });

});
