import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringReplacePipe } from 'src/app/_core/pipes/string-replace.pipe';
import { MyFilterPipe } from 'src/app/_core/pipes/myfilter-pipe';
import { SharedComponentModule } from 'src/app/_share/shared-component/shared-component.module';
import {
  FormatTimeStampUnixToDatePipe,
  FormatTimeStampUnixToHourPipe,
  FormatHourDisplayPipe,
  formatDateToTimestampDisplayPipe,
  FormatDateToStringPipe,
} from 'src/app/_core/pipes/format-date-time.pipe';

@NgModule({
  declarations: [
    StringReplacePipe,
    FormatTimeStampUnixToDatePipe,
    FormatTimeStampUnixToHourPipe,
    FormatHourDisplayPipe,
    formatDateToTimestampDisplayPipe,
    FormatDateToStringPipe,
    MyFilterPipe,
  ],
  imports: [CommonModule, SharedComponentModule],
  exports: [
    StringReplacePipe,
    FormatTimeStampUnixToDatePipe,
    FormatTimeStampUnixToHourPipe,
    FormatHourDisplayPipe,
    formatDateToTimestampDisplayPipe,
    FormatDateToStringPipe,
    MyFilterPipe,
  ],
})
export class CoreModule {}
