import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {SharedModule} from '../shared.module';
import {Component} from '@angular/core';
import {passwordMatchFormValidator, passwordMatchValidator} from './password-match.validator';


@Component({
  template: `
    <input id="pwd" [formControl]="pwd" class="form-control" type="password">
    <input id="pwdConfirm" [formControl]="pwdConfirm" class="form-control" type="password">
  `
})
class TestComponent {
  pwd: FormControl;
  pwdConfirm: FormControl;

  constructor() {
    this.pwd = new FormControl('', [Validators.minLength(8), Validators.required]);
    this.pwdConfirm = new FormControl('', [passwordMatchValidator(this.pwd)]);
  }
}

describe('Password Match Validator', () => {
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


  it('should validate if field with 8 characters is a valid password', function () {
    expect(component.pwd.value).toBe('');
    component.pwd.setValue('12345678');
    expect(component.pwd.valid).toBe(true);
  });

  it('should validate to true if original pwd is not set', function () {
    component.pwd.setValue(null);
    component.pwdConfirm.setValue(null);
    expect(component.pwdConfirm.valid).toBe(true);
  });

  it('should validate to true if original pwd is invalid', function () {
    component.pwd.setValue('132');
    component.pwdConfirm.setValue(null);
    expect(component.pwdConfirm.valid).toBe(true);
  });

  it('should accept correct password match', function () {
    component.pwd.setValue('12345678');
    expect(component.pwd.valid).toBe(true);
    component.pwdConfirm.setValue('12345678');
    expect(component.pwdConfirm.valid).toBe(true);
  });
});

@Component({
  template: `
    <form [formGroup]="formGroup" id="sign-up-data-comp" novalidate>
      <input id="pwd" formControlName="pwd" class="form-control" type="password">
      <input id="pwdConfirm" formControlName="pwdConfirm" class="form-control" type="password">
    </form>
  `
})
class TestFormComponent {
  formGroup: FormGroup;

  constructor() {
    this.formGroup = new FormGroup({
      pwd: new FormControl('', [Validators.minLength(8), Validators.required]),
      pwdConfirm: new FormControl('', [Validators.minLength(8), Validators.required])
    }, passwordMatchFormValidator('pwd', 'pwdConfirm'));
  }
}

describe('Password Form Match Validator', () => {
  let component: TestFormComponent;
  let fixture: ComponentFixture<TestFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, SharedModule],
      declarations: [TestFormComponent],
      providers: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.componentInstance;
  });

  it('should not show error when entering same pw', function (done) {
    expect(component.formGroup.controls.pwd.value).toBe('');
    expect(component.formGroup.controls.pwdConfirm.value).toBe('');

    component.formGroup.controls.pwd.setValue('12345678');
    component.formGroup.controls.pwdConfirm.setValue('12345678');
    expect(component.formGroup.controls.pwdConfirm.value).toBe('12345678');
    expect(component.formGroup.controls.pwdConfirm.value).toBe(component.formGroup.controls.pwd.value);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.formGroup.errors).toBeNull();
      done();
    });
  });

  it('should show error since not same pw', function (done) {
    expect(component.formGroup.controls.pwd.value).toBe('');
    expect(component.formGroup.controls.pwdConfirm.value).toBe('');

    component.formGroup.controls.pwd.setValue('12345678');
    component.formGroup.controls.pwdConfirm.setValue('22345678');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.formGroup.errors.pwdSame).toBeTruthy();
      done();
    });
  });

  it('should not show error when second field was not touched', function (done) {
    expect(component.formGroup.controls.pwd.value).toBe('');
    expect(component.formGroup.controls.pwdConfirm.value).toBe('');
    component.formGroup.controls.pwd.setValue('12345678');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.formGroup.errors).toBeNull();
      done();
    });
  });

  it('should show error, but revert to valid after fixed', function (done) {
    expect(component.formGroup.controls.pwd.value).toBe('');
    expect(component.formGroup.controls.pwdConfirm.value).toBe('');

    component.formGroup.controls.pwd.setValue('12345678');
    component.formGroup.controls.pwdConfirm.setValue('22345678');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.formGroup.errors.pwdSame).toBeTruthy();
      component.formGroup.controls.pwdConfirm.setValue('12345678');
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.formGroup.errors).toBeNull();
        done();
      });
    });
  });
});
