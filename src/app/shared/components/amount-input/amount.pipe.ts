import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
    name: 'amount'
})
export class AmountPipe implements PipeTransform {

  private decimalPipe = new DecimalPipe('de');

  transform(amount: number, decimals: number = 2): string {
    return this.decimalPipe.transform(amount, `1.${decimals}-${decimals}`);
  }
}
