export interface TaskSettings {
  rawDate: Date;
  due: string;
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
