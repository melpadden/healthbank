import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  pure: true
})
export class DateFormatPipe implements PipeTransform {
  public static FORMAT = 'dd.MM.y';

  private datePipe: DatePipe;

  constructor(@Inject(LOCALE_ID) private _locale: string) {
    this.datePipe = new DatePipe(_locale);
  }

  transform(value: string | Date): string {
    if (value == null || value === '') {
      return '';
    }
    return this.datePipe.transform(value, DateFormatPipe.FORMAT);
  }
}
