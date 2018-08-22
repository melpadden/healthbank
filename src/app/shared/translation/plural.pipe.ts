import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'plural',
})
export class PluralPipe implements PipeTransform {

  constructor() {
  }

  transform(value: number, translationKey: string): string {
    if (!value) {
      return translationKey;
    }
    if (value === 0) {
      return translationKey + '.zero';
    } else if (value === 1) {
      return translationKey + '.singular';
    } else {
      return translationKey + '.plural';
    }
  }
}
