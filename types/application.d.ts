import { Sheet } from './gas';

export interface EventOptions {
  calendarId: string;
  defaultTitle: string;
  defaultLocation: string;
  popupMinutes: string;
}

export interface TaskOptions {
  sheetName: string;
  listId: string;
  parentTaskTitle: string;
}

export interface ApplicationOptions {
  sheetName: string;
  executeStatusValue: string;
  addedStatusValue: string;
  lastRowStatusValue: string;
  startLine: number;
  event: EventOptions;
  task: TaskOptions;
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

export interface TaskSettings {
  status: string;
  id: string;
}

export interface Settings {
  sheet: Sheet;
  rowNumber: number;
  event: EventSettings;
  task: TaskSettings;
}

export interface TaskInsertOptions {
  due?: string;
  parent?: string;
  position?: string;
}
