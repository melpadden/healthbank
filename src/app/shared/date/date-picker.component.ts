import {
  Component, EventEmitter, forwardRef, HostListener, Injectable, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {isNumber, padNumber, toInteger} from '@ng-bootstrap/ng-bootstrap/util/util';
import {PureDate} from './date.type';
import {NgbDateISOParserFormatter} from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-parser-formatter';
import {environment} from '../../../environments/environment';
import {Subscription} from 'rxjs/Subscription';
import {TranslateService} from '@ngx-translate/core';

// Define custom service providing the months and weekdays translations
@Injectable()
export class TranslationDatepickerI18n extends NgbDatepickerI18n {

  constructor(private translatorService: TranslateService) {
    super();
  }

  getWeekdayShortName(weekday: number): string {
    // 2018-01-01 began on monday, so weekdays 0-6 will return Mo-Fr
    return new Date(Date.UTC(2018, 0, weekday)).toLocaleDateString(this.translatorService.getBrowserLang(), {weekday: 'short'});
  }

  getMonthShortName(month: number): string {
    return new Date(Date.UTC(2000, month - 1, 1, 12, 0, 0)).toLocaleDateString(this.translatorService.getBrowserLang(), {month: 'short'});
  }

  getMonthFullName(month: number): string {
    return new Date(Date.UTC(2000, month - 1, 1, 12, 0, 0)).toLocaleDateString(this.translatorService.getBrowserLang(), {month: 'long'});
  }
}

export class DateFormatter implements NgbDateParserFormatter {
  parse(value: string): NgbDateStruct {
    if (value) {
      const today = new Date();

      if ((/\d+\.\d+\.\d+/).test(value)) {
        const dateParts = value.trim().split('.');
        if (dateParts.length === 1 && isNumber(dateParts[0])) {
          return {year: today.getFullYear(), month: today.getMonth() + 1, day: toInteger(dateParts[0])};
        } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
          return {year: today.getFullYear(), month: toInteger(dateParts[1]), day: toInteger(dateParts[0])};
        } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
          return {year: toInteger(dateParts[2]), month: toInteger(dateParts[1]), day: toInteger(dateParts[0])};
        }
      } else if ((/\d{1,2}\.\d{1,2}\.?$/).test(value)) {
        const dateParts = value.trim().replace(/\.$/, '').split('.');
        if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
          return {year: today.getFullYear(), month: toInteger(dateParts[1]), day: toInteger(dateParts[0])};
        }
      } else if ((/^\d{1,2}\.?$/).test(value)) {
        const dateParts = value.trim().replace(/\.$/, '').split('.');
        if (dateParts.length === 1 && isNumber(dateParts[0])) {
          return {year: today.getFullYear(), month: today.getMonth() + 1, day: toInteger(dateParts[0])};
        }
      } else if (value.length >= 2 + 2 + 2) {
        return {
          day: toInteger(value.substr(0, 2)),
          month: toInteger(value.substr(2, 2)),
          year: toInteger(value.substr(4)),
        };
      } else if (value.length === 2 + 2) {
        return {
          day: toInteger(value.substr(0, 2)),
          month: toInteger(value.substr(2, 2)),
          year: today.getFullYear(),
        };
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    return date ?
      `${isNumber(date.day) ? padNumber(date.day) : ''}.${isNumber(date.month) ? padNumber(date.month) : ''}.${date.year}` :
      '';
  }
}

@Component({
  selector: 'app-date-picker',
  templateUrl: 'date-picker-template.html',
  styleUrls: ['date-picker.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true,
  }, {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true,
  }, {provide: NgbDatepickerI18n, useClass: TranslationDatepickerI18n}]
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy, Validator {
  assets = environment.assets;
  // This declaration should not be necessary, but TSLint will complain.
  d: NgbInputDatepicker;
  formCtrl: FormControl;
  ngbIsoParser = new NgbDateISOParserFormatter();
  onChange: Function;
  onTouched: Function;

  @Input()
  maxDate: NgbDateStruct;

  @Input()
  minDate: NgbDateStruct;

  @Input()
  startDate: NgbDateStruct;

  @Input()
  set disabled(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }

  @Output()
  touched = new EventEmitter<void>();

  private formValueChangesSubscription: Subscription;
  private isDisabled: boolean;

  constructor() {
  }

  ngOnInit() {
    this.formCtrl = new FormControl();

    // Monkey patch as there is no other way to get notified
    const origMarkAsTouched = this.formCtrl.markAsTouched;
    this.formCtrl.markAsTouched = (...args: any[]) => {
      if (this.onTouched) {
        this.onTouched();
      }
      if (this.touched) {
        this.touched.emit();
      }
      origMarkAsTouched.apply(this.formCtrl, args);
    };

    this.formValueChangesSubscription = this.formCtrl.valueChanges.subscribe(v => {
      if (this.onChange) {
        this.onChange(this.ngbToIso(v));
      }
    });

    if (!this.maxDate) {
      const now = new Date();
      this.maxDate = {year: now.getFullYear() + 10, month: now.getMonth() + 1, day: 1};
    }

    if (!this.minDate) {
      this.minDate = {year: 1900, month: 1, day: 1};
    }

    this.setDisabledState(this.isDisabled);
  }

  @ViewChild(NgbInputDatepicker)
  set datePickerDirective(directive: NgbInputDatepicker) {
    this.d = directive;
    const emitter = this.d.dateSelect.subscribe(() => {
      // let datepicker choose default date if default was set with startDate
      this.startDate = null;
      emitter.unsubscribe();
    });
  }

  @HostListener('document:click', ['$event'])
  closeDatePickerOnClick(event) {
    if (!this.d || !this.d.isOpen()) {
      return;
    }
    if (event.target.offsetParent !== null && !event.target.offsetParent.classList.contains('date-picker-internal')) {
      this.d.close();
    }
  }

  @HostListener('click', ['$event'])
  preventCloseDatePickerOnClick(event) {
    event.stopPropagation();
  }

  ngOnDestroy() {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }
  }

  writeValue(obj: PureDate): void {
    this.formCtrl.setValue(this.isoToNgb(obj));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.formCtrl.registerOnChange((...args: any[]) => {
      fn(...args);
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formCtrl.disable();
    } else {
      this.formCtrl.enable();
    }
  }

  validate(c: AbstractControl): ValidationErrors | any {
    return this.formCtrl.errors;
  }

  ngbToIso(model: NgbDateStruct): PureDate {
    const padYear = (y: number) => ('000' + y).substr(-4);
    if (model && isNumber(model.year) && isNumber(model.month) && isNumber(model.day)) {
      return padYear(model.year) + '-' + padNumber(model.month) + '-' + padNumber(model.day) as PureDate;
    } else {
      return undefined;
    }
  }

  isoToNgb(date: PureDate): NgbDateStruct {
    return this.ngbIsoParser.parse(date);
  }
}
