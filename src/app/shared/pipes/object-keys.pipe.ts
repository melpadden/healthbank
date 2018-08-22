import {Pipe, PipeTransform} from '@angular/core';

/**
 * Transforms an objects members to an array.
 * e.g: to iterate over the members of the object via *ngFor.
 */
@Pipe({
  name: 'keys'
})
export class ObjectKeysPipe implements PipeTransform {

  transform(value: object): any[] {
    const keys = [];
    for (const key of Object.keys(value)) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }
}
