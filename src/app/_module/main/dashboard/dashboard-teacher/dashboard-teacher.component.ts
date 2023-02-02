import { Component, OnInit } from '@angular/core';
import { SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { Day } from "@progress/kendo-date-math";

@Component({
  selector: 'app-dashboard-teacher',
  templateUrl: './dashboard-teacher.component.html',
  styleUrls: ['./dashboard-teacher.component.scss']
})
export class DashboardTeacherComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }




  currentYear = new Date().getFullYear();

  parseAdjust = (eventDate: string): Date => {
    const date = new Date(eventDate);
    date.setFullYear(this.currentYear);
    return date;
  };

  baseData: any[] = [
    {
      "TaskID": 4,
      "OwnerID": 2,
      "Title": "Bowling tournament",
      "Description": "",
      "StartTimezone": null,
      "Start": "2013-08-09T21:00:00.000Z",
      "End": "2013-08-10T00:00:00.000Z",
      "EndTimezone": null,
      "RecurrenceRule": null,
      "RecurrenceID": null,
      "RecurrenceException": null,
      "IsAllDay": false
    },
    {
      "TaskID": 5,
      "OwnerID": 2,
      "Title": "Take the dog to the vet",
      "Description": "",
      "StartTimezone": null,
      "Start": "2013-08-10T07:00:00.000Z",
      "End": "2013-08-10T08:00:00.000Z",
      "EndTimezone": null,
      "RecurrenceRule": null,
      "RecurrenceID": null,
      "RecurrenceException": null,
      "IsAllDay": false
    },
    {
      "TaskID": 6,
      "OwnerID": 2,
      "Title": "Call Charlie about the project",
      "Description": "",
      "StartTimezone": null,
      "Start": "2013-08-11T11:30:00.000Z",
      "End": "2013-08-11T13:00:00.000Z",
      "EndTimezone": null,
      "RecurrenceRule": null,
      "RecurrenceID": null,
      "RecurrenceException": null,
      "IsAllDay": false
    }]

    sampleData = this.baseData.map(dataItem => (
      <SchedulerEvent> {
          id: dataItem.TaskID,
          start: this.parseAdjust(dataItem.Start),
          startTimezone: dataItem.startTimezone,
          end: this.parseAdjust(dataItem.End),
          endTimezone: dataItem.endTimezone,
          isAllDay: dataItem.IsAllDay,
          title: dataItem.Title,
          description: dataItem.Description,
          recurrenceRule: dataItem.RecurrenceRule,
          recurrenceId: dataItem.RecurrenceID,
          recurrenceException: dataItem.RecurrenceException,
  
          roomId: dataItem.RoomID,
          ownerID: dataItem.OwnerID
      }
  ));

  
  displayDate = new Date(2022, 8, 18);

  public selectedDate: Date = this.displayDate;
  public events: SchedulerEvent[] = this.sampleData;
  public weekStart: Day = Day.Monday;

}
