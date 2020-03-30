import { TasksRegisterOptions, TaskOptions, TaskSettings, Task, Sheet } from '~/types';

export class TasksRegister {
  options: TasksRegisterOptions;

  constructor (options: TasksRegisterOptions) {
    this.options = options;
  }

  /**
   * シートに登録されたタスクを, カレンダーのタスクに登録する
   */
  start (): void {
    const settings = this.getSettings();
    const taskTitles = this.getTaskTitles(settings.lastRow);
    const parentTask = this.createParentTask(settings);

    taskTitles.reverse().forEach((taskTitle) => {
      this.createChidedTask(taskTitle, parentTask);
    });
  }

  /**
   * タスク登録の設定を取得する
   * E2 に登録対象の日時が登録されている.
   *
   * @returns タスクの設定
   * @protected
   */
  protected getSettings (): TaskSettings {
    const sheet = this.getSheet();
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
   * 登録するタスクのタイトルのリストを取得する
   *
   * @param lastRow 最終行
   * @returns タスクのタイトルのリスト
   * @protected
   */
  protected getTaskTitles (lastRow: number): string[] {
    const taskTitles: string[] = [];
    const sheet = this.getSheet();

    for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
      const isEnable = sheet.getRange(rowNumber, 1).getValue() as boolean;
      if (isEnable) {
        const taskTitle = sheet.getRange(rowNumber, 2).getValue() as string;
        taskTitles.push(taskTitle);
      }
    }

    return taskTitles;
  }

  /**
   * スプレッドシートを取得する
   *
   * @returns スプレッドシート
   * @protected
   */
  protected getSheet (): Sheet {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.options.taskSheetName);
  }

  /**
   * 新しいタスクを追加する
   *
   * @param taskTitle タスクのタイトル
   * @param options タスクのオプション
   * @returns 作成されたタスク
   * @protected
   */
  protected insertNewTask (taskTitle: string, options: TaskOptions): Task {
    const newTask = Tasks.newTask();
    newTask.title = taskTitle;
    if (options.due) {
      newTask.due = options.due;
    }

    return Tasks.Tasks.insert(newTask, this.options.taskListId, options);
  }

  /**
   * 親のタスクを作成する
   *
   * @param settings タスクの設定
   * @returns 作成されたタスク
   * @protected
   */
  protected createParentTask (settings: TaskSettings): Task {
    const titleDate = Utilities.formatDate(settings.rawDate, 'Asia/Tokyo', 'yyyy/MM/dd');
    const title = `${titleDate} ${this.options.parentTaskTitle}`;
    const options: TaskOptions = {
      due: settings.date,
    };

    return this.insertNewTask(title, options);
  }

  /**
   * サブタスクを設定する
   *
   * @param taskTitle タスクのタイトル
   * @param parentTask 親タスク
   * @return 作成されたタスク
   * @protected
   */
  protected createChidedTask (taskTitle: string, parentTask: Task): Task {
    const options: TaskOptions = {
      parent: parentTask.id,
    };

    return this.insertNewTask(taskTitle, options);
  }
}

/**
 * シートに登録されたタスクを, カレンダーのタスクに登録する
 */
export function addTasks (): void {
  // データの入ったシート名
  const taskSheetName = PropertiesService.getScriptProperties().getProperty('TASK_SHEET_NAME');
  // タスクリストの ID
  const taskListId = PropertiesService.getScriptProperties().getProperty('TASK_LIST_ID');
  // ベースのタイトル
  const parentTaskTitle = PropertiesService.getScriptProperties().getProperty('PARENT_TASK_TITLE');

  const options: TasksRegisterOptions = {
    taskSheetName,
    taskListId,
    parentTaskTitle,
  };
  const tasksRegister = new TasksRegister(options);
  tasksRegister.start();
}
