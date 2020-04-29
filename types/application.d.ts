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
