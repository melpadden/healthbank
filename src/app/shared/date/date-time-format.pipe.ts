import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateTimeFormat',
  pure: true
})
export class DateTimeFormatPipe implements PipeTransform {
  public static FORMAT = 'dd.MM.y H:mm';

  private datePipe: DatePipe;

  constructor(@Inject(LOCALE_ID) private _locale: string) {
    this.datePipe = new DatePipe(_locale);
  }

  transform(value: string | Date): string {
    if ( value === undefined ) {
      return '';
    }
    return this.datePipe.transform(value, DateTimeFormatPipe.FORMAT);
  }
}
