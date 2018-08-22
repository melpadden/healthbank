import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared.module';
import {By} from '@angular/platform-browser';
import {Component, DebugElement} from '@angular/core';
import {emailValidator} from './email.validator';


@Component({
  template: `
    <input id="email" [formControl]="email" class="form-control" type="text">
  `
})
class TestComponent {
  email: FormControl;

  constructor(private fb: FormBuilder) {
    this.email = new FormControl('', [emailValidator()]);
  }
}

describe('Email Validator', () => {
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
  let emailField: DebugElement;

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

    emailField = fixture.debugElement.query(By.css('input[name=field1]'));
  });


  it('should validate if empty field is a valid email', function () {
    expect(component.email.value).toBe('');
    expect(component.email.valid).toBe(true);
  });

  it('should validate if null field is a valid email', function () {
    component.email.setValue(null);
    expect(component.email.valid).toBe(true);
  });

  it('should validate to false if field contains simple text', function () {
    component.email.setValue('test test');
    expect(component.email.valid).toBe(false);
  });

  it('should validate \'emmanuel@hibernate.org\' to true', function () {
    component.email.setValue('emmanuel@hibernate.org');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'emmanuel@hibernate\' to true', function () {
    component.email.setValue('emmanuel@hibernate');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'emma-n_uel@hibernate\' to true', function () {
    component.email.setValue('emma-n_uel@hibernate');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'emma+nuel@hibernate.org\' to true', function () {
    component.email.setValue('emma+nuel@hibernate.org');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'emma=nuel@hibernate.org\' to true', function () {
    component.email.setValue('emma=nuel@hibernate.org');

    expect(component.email.valid).toBe(true);
  });

  it('should validate \'emmanuel@[123.12.2.11]\' to true', function () {
    component.email.setValue('emmanuel@[123.12.2.11]');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'*@example.net\' to true', function () {
    component.email.setValue('*@example.net');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'fred&barny@example.com\' to true', function () {
    component.email.setValue('fred&barny@example.com');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'---@example.com\' to true', function () {
    component.email.setValue('---@example.com');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'foo-bar@example.net\' to true', function () {
    component.email.setValue('foo-bar@example.net');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'mailbox.sub1.sub2@this-domain\' to true', function () {
    component.email.setValue('mailbox.sub1.sub2@this-domain');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'Test^Email@example.com\' to true', function () {
    component.email.setValue('Test^Email@example.com');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'myname@östereich.at\' to true', function () {
    component.email.setValue('myname@östereich.at');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'θσερ@εχαμπλε.ψομ\' to true ', function () {
    component.email.setValue('θσερ@εχαμπλε.ψομ');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@hibernate.org\' to true ', function () {
    component.email.setValue('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@hibernate.org');
    expect(component.email.valid).toBe(true);
  });

  it('should validate \'emmanuel.hibernate.org\' to false if email is in invalid format', function () {
    component.email.setValue('emmanuel.hibernate.org');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'emma nuel@hibernate.org\' in invalid format', function () {
    component.email.setValue('emma nuel@hibernate.org');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'emma nuel@hibernate.org\' in invalid format', function () {
    component.email.setValue('emma(nuel@hibernate.org');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'emmanuel@\' of invalid format', function () {
    component.email.setValue('emmanuel@');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'emma\nnuel@hibernate.org\' of invalid format', function () {
    component.email.setValue('emma\nnuel@hibernate.org');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'emma@nuel@hibernate.org\' of invalid format', function () {
    component.email.setValue('emma@nuel@hibernate.org');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'Just a string\' of invalid format', function () {
    component.email.setValue('Just a string');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'string\' of invalid format', function () {
    component.email.setValue('string');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'me@\' of invalid format', function () {
    component.email.setValue('me@');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'@example.com\' of invalid format', function () {
    component.email.setValue('@example.com');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'me.@example.com\' of invalid format', function () {
    component.email.setValue('me.@example.com');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'.me@example.com\' of invalid format', function () {
    component.email.setValue('.me@example.com');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'me@example..com\' of invalid format', function () {
    component.email.setValue('me@example..com');
    expect(component.email.valid).toBe(false);
  });

  it('should validate to false for email \'me\\@example.com\' of invalid format', function () {
    component.email.setValue('me\\@example.com');
    expect(component.email.valid).toBe(false);
  });

  it('should validate \'θσερ.εχαμπλε.ψομ\' to false', function () {
    component.email.setValue('θσερ.εχαμπλε.ψομ');
    expect(component.email.valid).toBe(false);
  });

  it('should validate \'validation@hibernate.com@\' to false', function () {
    component.email.setValue('validation@hibernate.com@');
    expect(component.email.valid).toBe(false);
  });

  it('should validate \'validation@hibernate.com@@\' to false', function () {
    component.email.setValue('validation@hibernate.com@@');
    expect(component.email.valid).toBe(false);
  });

  it('should validate \'validation@hibernate.com@@@\' to false', function () {
    component.email.setValue('validation@hibernate.com@@@');
    expect(component.email.valid).toBe(false);
  });

  it('should validate an email wit a local part of 64 characters to true', function () {
    component.email.setValue(generateStringOfLength(64) + '@hibernate.com');
    expect(component.email.valid).toBe(true);
  });

  it('should validate an email with a local string of 65 characters to false', function () {
    component.email.setValue(generateStringOfLength(65) + '@hibernate.com');
    expect(component.email.valid).toBe(false);
  });

  it('should validate an email with a domain part of 255 characters to true', function () {
    component.email.setValue('foo@' + generateStringOfLength(251) + '.com');
    expect(component.email.valid).toBe(true);
  });

  it('should validate an email with a domain part of 256 characters to false', function () {
    component.email.setValue('foo@' + generateStringOfLength(252) + '.com');
    expect(component.email.valid).toBe(false);
  });
});
