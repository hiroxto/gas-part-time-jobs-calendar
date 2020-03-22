export interface TaskSetting {
  rawDate: Date;
  date: string;
  lastRow: number;
}

export interface TaskOptions {
  due?: string;
  parent?: string;
  position?: string;
}

export interface TasksRegisterOption {
  taskSheetName: string;
  taskListId: string;
  parentTaskTitle: string;
}
