import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'formatTimeStampUnixToDate',
})
export class FormatTimeStampUnixToDatePipe implements PipeTransform {
  transform(value: number | any, ...args: unknown[]): unknown {
    if (value) {
      const newValue = new Date(value * 1000);
      return moment(newValue).format('dddd, DD/MM/YYYY');
    }
    return;
  }
}
@Pipe({
  name: 'formatDateToString',
})
export class FormatDateToStringPipe implements PipeTransform {
  transform(value: number | any, ...args: unknown[]): unknown {
    if (value) {
      const newValue = new Date(value);
      return moment(newValue).format('DD/MM/YY');
    }
    return;
  }
}


@Pipe({
  name: 'formatTimeStampUnixToHour',
})
export class FormatTimeStampUnixToHourPipe implements PipeTransform {
  transform(value: number | any, ...args: unknown[]): unknown {
    if (value) {
      const newValue = new Date(value * 1000);
      return moment(newValue).format('HH:mm');
    }
    return;
  }
}

@Pipe({
  name: 'formatDateToTimestampDisplay',
})
export class formatDateToTimestampDisplayPipe implements PipeTransform {
  transform(value: number | any, ...args: unknown[]): unknown {
    if (value) {
      const newValue = moment(value).format('HH:mm');
      return newValue;
    }
    return;
  }
}

@Pipe({
  name: 'formatHourDisplay',
})
export class FormatHourDisplayPipe implements PipeTransform {
  transform(value: number | any, ...args: unknown[]): unknown {
    if (value) {
      const newValue = value.slice(0, 5);
      return newValue;
    }
    return;
  }
}
