export interface TaskSettings {
  rawDate: Date;
  date: string;
  lastRow: number;
}

export interface TaskOptions {
  due?: string;
  parent?: string;
  position?: string;
}

export interface TasksRegisterOptions {
  taskSheetName: string;
  taskListId: string;
  parentTaskTitle: string;
}
