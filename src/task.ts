// eslint-disable-next-line no-undef
import Task = GoogleAppsScript.Tasks.Schema.Task;

// データの入ったシート名
const TASK_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('TASK_SHEET_NAME');
// タスクリストの ID
const TASK_LIST_ID = PropertiesService.getScriptProperties().getProperty('TASK_LIST_ID');
// ベースのタイトル
const PARENT_TASK_TITLE = PropertiesService.getScriptProperties().getProperty('PARENT_TASK_TITLE');

interface TaskSetting {
  rawDate: Date;
  date: string;
}

interface TaskOptions {
  due?: string;
  parent?: string;
  position?: string;
}

export function addTasks (): void {
  const taskTitles = getTaskTitles_();
  const setting = getSetting_();
  const baseTask = createParentTask_(setting);

  taskTitles.reverse().forEach((taskTitle) => {
    createChidedTask_(taskTitle, baseTask);
  });
}

export function getTaskTitles_ (): string[] {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TASK_SHEET_NAME);
  const taskTitles = [];

  for (let rowNumber = 2; rowNumber <= sheet.getLastRow(); rowNumber++) {
    const isEnable = sheet.getRange(rowNumber, 1).getValue() as boolean;
    const taskTitle = sheet.getRange(rowNumber, 2).getValue();
    if (isEnable) {
      taskTitles.push(taskTitle);
    }
  }

  return taskTitles;
}

export function getSetting_ (): TaskSetting {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TASK_SHEET_NAME);
  const rawDate = sheet.getRange(2, 5).getValue();
  const date = Utilities.formatDate(rawDate, 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm:ss'Z'");

  return {
    rawDate,
    date,
  };
}

export function insertNewTask_ (taskTitle: string, options: TaskOptions): Task {
  const newTask = Tasks.newTask();
  newTask.title = taskTitle;
  if (options.due) {
    newTask.due = options.due;
  }

  return Tasks.Tasks.insert(newTask, TASK_LIST_ID, options);
}

export function createParentTask_ (setting: TaskSetting): Task {
  const date = Utilities.formatDate(setting.rawDate, 'Asia/Tokyo', 'yyyy/MM/dd');
  const title = `${date} ${PARENT_TASK_TITLE}`;
  const options = {
    due: setting.date,
  };

  return insertNewTask_(title, options);
}

export function createChidedTask_ (taskTitle: string, baseTask: Task): Task {
  const options = {
    parent: baseTask.id,
  };

  return insertNewTask_(taskTitle, options);
}
