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
  lastRow: number;
}

interface TaskOptions {
  due?: string;
  parent?: string;
  position?: string;
}

/**
 * シートに登録されたタスクを, カレンダーのタスクに登録する
 */
export function addTasks (): void {
  const setting = getSetting_();
  const taskTitles = getTaskTitles_(setting.lastRow);
  const parentTask = createParentTask_(setting);

  taskTitles.reverse().forEach((taskTitle) => {
    createChidedTask_(taskTitle, parentTask);
  });
}

/**
 * 登録するタスクのタイトルのリストを取得する
 *
 * @param lastRow 最終行
 * @returns タスクのタイトルのリスト
 * @private
 */
export function getTaskTitles_ (lastRow: number): string[] {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TASK_SHEET_NAME);
  const taskTitles = [];

  for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
    const isEnable = sheet.getRange(rowNumber, 1).getValue() as boolean;
    if (isEnable) {
      const taskTitle = sheet.getRange(rowNumber, 2).getValue();
      taskTitles.push(taskTitle);
    }
  }

  return taskTitles;
}

/**
 * タスク登録の設定を取得する
 * E2 に登録対象の日時が登録されている.
 *
 * @returns タスクの設定
 * @private
 */
export function getSetting_ (): TaskSetting {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TASK_SHEET_NAME);
  const rawDate = sheet.getRange(2, 5).getValue();
  const date = Utilities.formatDate(rawDate, 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm:ss'Z'");
  const lastRow = sheet.getRange(3, 5).getValue();

  return {
    rawDate,
    date,
    lastRow,
  };
}

/**
 * 新しいタスクを追加する
 *
 * @param taskTitle タスクのタイトル
 * @param options タスクのオプション
 * @returns 作成されたタスク
 * @private
 */
export function insertNewTask_ (taskTitle: string, options: TaskOptions): Task {
  const newTask = Tasks.newTask();
  newTask.title = taskTitle;
  if (options.due) {
    newTask.due = options.due;
  }

  return Tasks.Tasks.insert(newTask, TASK_LIST_ID, options);
}

/**
 * 親のタスクを作成する
 *
 * @param setting タスクの設定
 * @returns 作成されたタスク
 * @private
 */
export function createParentTask_ (setting: TaskSetting): Task {
  const titleDate = Utilities.formatDate(setting.rawDate, 'Asia/Tokyo', 'yyyy/MM/dd');
  const title = `${titleDate} ${PARENT_TASK_TITLE}`;
  const options: TaskOptions = {
    due: setting.date,
  };

  return insertNewTask_(title, options);
}

/**
 * サブタスクを設定する
 *
 * @param taskTitle タスクのタイトル
 * @param parentTask 親タスク
 * @return 作成されたタスク
 * @private
 */
export function createChidedTask_ (taskTitle: string, parentTask: Task): Task {
  const options: TaskOptions = {
    parent: parentTask.id,
  };

  return insertNewTask_(taskTitle, options);
}
