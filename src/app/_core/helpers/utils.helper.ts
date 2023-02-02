import { AbstractControl, FormGroup } from '@angular/forms';

export class RequestSearchForm {
  page: number;
  page_size: number;
  sort_by: string;
  sort_descending: boolean;
  constructor() {
    (this.page = 1), (this.page_size = 10);
    this.sort_by = 'date';
    this.sort_descending = false;
  }
}

export function parseAdjust(eventDate: string): Date {
  const date = new Date(eventDate);
  date.setFullYear(date.getFullYear());
  return date;
}

export function validateTimePickerControlsValue(
  firstControlName: string,
  secondControlName: string
) {
  return function (formGroup: FormGroup) {
    const { value: firstControlValue } = formGroup.get(
      firstControlName
    ) as AbstractControl;
    const { value: secondControlValue } = formGroup.get(
      secondControlName
    ) as AbstractControl;
    return Math.floor(new Date(firstControlValue).getTime() / 1000) <
      Math.floor(new Date(secondControlValue).getTime() / 1000)
      ? null
      : {
          isValidTime: {
            firstControlValue,
            secondControlValue,
          },
        };
  };
}
