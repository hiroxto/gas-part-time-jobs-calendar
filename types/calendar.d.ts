export interface CalendarEventOption {
  description: string;
  location: string;
}

export interface EventSetting {
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

export interface EventsRegisterOption {
  executeStatusValue: string;
  addedStatusValue: string;
  calendarId: string;
  calendarSheetName: string;
  defaultTitle: string;
  defaultLocation: string;
  popupMinutes: string;
}
