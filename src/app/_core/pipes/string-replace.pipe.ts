import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringReplace',
})
export class StringReplacePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    if (value) {
      const [year, month, day] = value.split('-');

      return `${day}/${month}/${year}`;
    }
    return '';
  }
}
