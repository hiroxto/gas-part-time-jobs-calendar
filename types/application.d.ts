import { Sheet } from './gas';

export interface ApplicationOptions {
  sheetName: string;
  executeStatusValue: string;
  addedStatusValue: string;
  event: EventOptions;
  task: TaskOptions;
}

export interface EventOptions {
  calendarId: string;
  defaultTitle: string;
  defaultLocation: string;
  popupMinutes: string;
}

export interface TaskOptions {
  taskSheetName: string;
  taskListId: string;
  parentTaskTitle: string;
}

export interface Settings {
  sheet: Sheet;
  rowNumber: number;
  event: EventSettings;
  task: TaskSettings;
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

export interface TaskInsertOptions {
  due?: string;
  parent?: string;
  position?: string;
}
