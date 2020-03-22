export interface CalendarEventOptions {
  description: string;
  location: string;
}

export interface EventSettings {
  status: string;
  id: string;
  useDefaultTitle: boolean;
  customTitle: string;
  eventStartDateTime: Date;
  eventEndDateTime: Date;
  useDefaultLocation: boolean;
  customLocation: string;
  baseDescription: string;
}

export interface EventsRegisterOptions {
  executeStatusValue: string;
  addedStatusValue: string;
  calendarId: string;
  calendarSheetName: string;
  defaultTitle: string;
  defaultLocation: string;
  popupMinutes: string;
}
