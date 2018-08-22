import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared.module';
import {Component} from '@angular/core';
import {phoneNumberValidator} from './phone-number.validator';


@Component({
  template: `
    <input id="phone" [formControl]="phone" class="form-control" type="text">
  `
})
class TestComponent {
  phone: FormControl;

  constructor() {
    this.phone = new FormControl('', [phoneNumberValidator()]);
  }
}

describe('Phone Number Validator', () => {
  function generateStringOfLength(length: number): string {
    let index = 0;
    let result = '';
    while (index < length) {
      result = result + 'a';
      index++;
    }
    return result;
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, SharedModule],
      declarations: [TestComponent],
      providers: []
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should validate if empty field is a valid phone number', function () {
    expect(component.phone.value).toBe('');
    expect(component.phone.valid).toBe(true);
  });

  it('should validate if null field is a valid phone number', function () {
    component.phone.setValue(null);
    expect(component.phone.valid).toBe(true);
  });

  it('should accept correct phone numbers', function () {
    component.phone.setValue('+1234');
    expect(component.phone.valid).toBe(true);
    component.phone.setValue('+123456789012345');
    expect(component.phone.valid).toBe(true);
    component.phone.setValue('+100000000000000');
    expect(component.phone.valid).toBe(true);
  });

  it('should not accept to long  phone numbers', function () {
    // to long
    component.phone.setValue('+123456789101213112');
    expect(component.phone.valid).toBe(false);
  });

  it('should not accept to short  phone numbers', function () {
    // to long
    component.phone.setValue('+123');
    expect(component.phone.valid).toBe(false);
  });

  it('should not accept leading \'+0 \' at phone numbers', function () {
    // to long
    component.phone.setValue('+012345');
    expect(component.phone.valid).toBe(false);
  });

  it('should not accept leading \'0 \' at phone numbers', function () {
    // to long
    component.phone.setValue('012345');
    expect(component.phone.valid).toBe(false);
  });

  it('should not accept missing leading \'+ \' at phone numbers', function () {
    // to long
    component.phone.setValue('12345');
    expect(component.phone.valid).toBe(false);
  });

  it('should not accept missing containing characters at phone numbers', function () {
    // to long
    component.phone.setValue('123dfg45');
    expect(component.phone.valid).toBe(false);
  });

  it('should only accept phone numbers starting with \'+\'', function () {
    // to long
    component.phone.setValue('-12345');
    expect(component.phone.valid).toBe(false);
  });

  it('should only accept phone numbers starting with \'+\' followed by number larger 0', function () {
    // to long
    component.phone.setValue('++12345');
    expect(component.phone.valid).toBe(false);
  });

  it('should accept spaces', function () {
    // to long
    component.phone.setValue('+43 1 123 12 12');
    expect(component.phone.valid).toBe(true);
    component.phone.setValue('+43 1123 12   12');
    expect(component.phone.valid).toBe(true);
  });

  it('should accept dashes', function () {
    // to long
    component.phone.setValue('+4311231212-63');
    expect(component.phone.valid).toBe(true);
    component.phone.setValue('+43-1123-12--12');
    expect(component.phone.valid).toBe(true);
  });

  it('should accept dots', function () {
    // to long
    component.phone.setValue('+4311231212.63');
    expect(component.phone.valid).toBe(true);
    component.phone.setValue('+43.1123.12..12');
    expect(component.phone.valid).toBe(true);
  });

  it('should accept mixed space, dashes and dots', function () {
    // to long
    component.phone.setValue('+43 1 12312  12-63');
    expect(component.phone.valid).toBe(true);
    component.phone.setValue('+43 11.23-12--12');
    expect(component.phone.valid).toBe(true);
  });
});
