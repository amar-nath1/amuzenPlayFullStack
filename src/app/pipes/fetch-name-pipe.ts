import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fetchName'
})
export class FetchNamePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
