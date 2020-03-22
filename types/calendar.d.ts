export interface CalendarEventOptions {
  description: string;
  location: string;
}

interface EventSetting {
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

interface EventsRegisterOption {
  executeStatusValue: string;
  addedStatusValue: string;
  calendarId: string;
  calendarSheetName: string;
  defaultTitle: string;
  defaultLocation: string;
  popupMinutes: string;
}
