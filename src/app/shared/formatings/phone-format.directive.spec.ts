import {Component, DebugElement, NO_ERRORS_SCHEMA, OnInit} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PhoneFormatDirective} from './phone-format.directive';
import {By} from '@angular/platform-browser';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

describe('PhoneFormatDirective', () => {
  let component: TestPhoneComponent;
  let fixture: ComponentFixture<TestPhoneComponent>;
  let inputEl: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TestPhoneComponent, PhoneFormatDirective],
      schemas:      [ NO_ERRORS_SCHEMA ]
    });

    fixture = TestBed.createComponent(TestPhoneComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    component.ngOnInit();
    inputEl = fixture.debugElement.query(By.css('input'));
  }));

  it('should do nothing on invalid input', () => {
    component.testForm.setValue({test: 'xxx'});
    inputEl.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.testForm.value.test).toBe('xxx');
  });

  it('should replace leading 00 with +', () => {
    fixture.detectChanges();
    component.testForm.setValue({test: '00123456'});
    inputEl.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.testForm.value.test).toBe('+123456');
  });

  it('should do nothing on input with three leading 0', () => {
    fixture.detectChanges();
    component.testForm.setValue({test: '000123456'});
    inputEl.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.testForm.value.test).toBe('000123456');
  });

  it('should do nothing on input with three leading 0', () => {
    fixture.detectChanges();
    component.testForm.setValue({test: '000123456'});
    inputEl.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.testForm.value.test).toBe('000123456');
  });

  it('should replace all none digits', () => {
    fixture.detectChanges();
    component.testForm.setValue({test: '+123test456'});
    inputEl.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.testForm.value.test).toBe('+123456');
  });

  it('should replace all spaces', () => {
    fixture.detectChanges();
    component.testForm.setValue({test: '+43 1 123 123 12'});
    inputEl.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.testForm.value.test).toBe('+43112312312');
  });

  it('should replace symbols and spaces', () => {
    fixture.detectChanges();
    component.testForm.setValue({test: '+43 1 123..123-12'});
    inputEl.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.testForm.value.test).toBe('+43112312312');
  });

});

@Component({
  template: `
    <form [formGroup]="testForm">
      <input formControlName="test" type="text" appPhoneFormat>
    </form>`

})
class TestPhoneComponent implements OnInit {
  testForm: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.testForm = this.fb.group(
      {
        test: new FormControl('', []),
      });
  }
}
