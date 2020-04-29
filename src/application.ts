import {
  ApplicationOptions,
  Settings,
  EventSettings,
  TaskSettings,
  TaskInsertOptions,
  EventOptions,
  TaskOptions,
  Calendar,
  CalendarEvent,
  Sheet,
  Task,
} from '~/types';

export class Application {
  options: ApplicationOptions;

  /**
   * @param options イベント登録とタスク登録のオプション
   */
  constructor (options: ApplicationOptions) {
    this.options = options;
  }

  /**
   * 登録を開始する
   */
  start (): void {
    const sheet = this.getSheet();

    for (let rowNumber = 2; rowNumber <= sheet.getLastRow(); rowNumber++) {
      const settings = this.loadSettings(sheet, rowNumber);

      if (settings.event.status === this.options.executeStatusValue) {
        this.registerEvent(settings);
      }

      if (settings.task.status === this.options.executeStatusValue) {
        this.registerTask(settings);
      }
    }
  }

  /**
   * イベントの設定を取得する
   *
   * @param sheet スプレッドシート
   * @param rowNumber 行番号
   * @returns 設定
   */
  protected loadSettings (sheet: Sheet, rowNumber: number): Settings {
    let columnNumber = 1;
    const eventStatus = sheet.getRange(rowNumber, columnNumber).getValue();
    const eventId = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const taskStatus = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const taskId = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const useDefaultTitle = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const customTitle = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventStartDateTime = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventEndDateTime = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const useDefaultLocation = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const customLocation = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const baseDescription = sheet.getRange(rowNumber, ++columnNumber).getValue();

    const eventSettings: EventSettings = {
      status: eventStatus,
      id: eventId,
      useDefaultTitle,
      customTitle,
      eventStartDateTime,
      eventEndDateTime,
      useDefaultLocation,
      customLocation,
      baseDescription,
    };

    const taskSettings: TaskSettings = {
      status: taskStatus,
      id: taskId,
    };

    return {
      sheet: sheet,
      rowNumber: rowNumber,
      event: eventSettings,
      task: taskSettings,
    };
  }

  /**
   * イベントの登録を行う
   * @param settings
   */
  protected registerEvent (settings: Settings): void{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const register = new EventRegister(this.options, settings);
    register.start();
  }

  /**
   * タスクの登録を行う
   * @param settings
   */
  protected registerTask (settings: Settings): void{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const register = new TaskRegister(this.options, settings);
    register.start();
  }

  /**
   * スプレッドシートを取得する
   *
   * @returns イベントの設定が入ったシート
   */
  protected getSheet (): Sheet {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.options.sheetName);
  }
}

export class EventRegister {
  options: ApplicationOptions;

  settings: Settings;

  /**
   * @param options
   * @param settings
   */
  constructor (options: ApplicationOptions, settings: Settings) {
    this.options = options;
    this.settings = settings;
  }

  /**
   * 登録を開始する
   */
  start (): void{
    const { sheet, rowNumber, event: eventSettings } = this.settings;

    if (eventSettings.status !== this.options.executeStatusValue) {
      return;
    }

    const title = eventSettings.useDefaultTitle ? this.options.event.defaultTitle : eventSettings.customTitle;
    const location = eventSettings.useDefaultLocation ? this.options.event.defaultLocation : eventSettings.customLocation;
    const description = [
      eventSettings.baseDescription,
      `default_title : ${eventSettings.useDefaultTitle}`,
      `default_location : ${eventSettings.useDefaultLocation}`,
    ].join('\n').trim();
    const options = { description, location };

    const calendarEvent = eventSettings.id === ''
      ? this.createNewCalendarEvent(title, eventSettings.eventStartDateTime, eventSettings.eventEndDateTime)
      : this.updateCalendarEvent(eventSettings.id, title, eventSettings.eventStartDateTime, eventSettings.eventEndDateTime);

    calendarEvent
      .setDescription(options.description)
      .setLocation(options.location);

    this.addPopupReminders(calendarEvent);

    sheet.getRange(rowNumber, 1).setValue(this.options.addedStatusValue);
    sheet.getRange(rowNumber, 2).setValue(calendarEvent.getId());
  }

  /**
   * カレンダーを取得する
   *
   * @returns 登録するカレンダー
   */
  protected getCalendar (): Calendar {
    return CalendarApp.getCalendarById(this.options.event.calendarId);
  }

  /**
   * イベントを新規作成する
   *
   * @param title イベントのタイトル
   * @param startDateTime イベントの開始日時
   * @param endDateTime イベントの終了日時
   * @returns 作成されたイベント
   */
  protected createNewCalendarEvent (title: string, startDateTime: Date, endDateTime: Date): CalendarEvent {
    return this.getCalendar().createEvent(title, startDateTime, endDateTime);
  }

  /**
   * 既存のイベントを更新する
   *
   * @param id カレンダーのID
   * @param title イベントのタイトル
   * @param startDateTime イベントの開始日時
   * @param endDateTime イベントの終了日時
   * @returns 更新されたイベント
   */
  protected updateCalendarEvent (id: string, title: string, startDateTime: Date, endDateTime: Date): CalendarEvent {
    const event = this.getCalendar().getEventById(id);

    return event.setTitle(title).setTime(startDateTime, endDateTime);
  }

  /**
   * イベントに通知を設定する
   * 既存の通知は削除される
   *
   * @param event 通知を設定するイベント
   * @returns 通知を設定したイベント
   */
  protected addPopupReminders (event: CalendarEvent): CalendarEvent {
    const popupAts: number[] = this.options.event.popupMinutes.split(',').map(s => Number(s.trim()));

    event.removeAllReminders();

    popupAts.forEach(popupAt => {
      event.addPopupReminder(popupAt);
    });

    return event;
  }
}

export class TaskRegister {
  options: ApplicationOptions;

  settings: Settings;

  /**
   * @param options
   * @param settings
   */
  constructor (options: ApplicationOptions, settings: Settings) {
    this.options = options;
    this.settings = settings;
  }

  /**
   * 登録を開始する
   */
  start (): void{
    const { sheet, rowNumber, task } = this.settings;

    if (task.status !== this.options.executeStatusValue) {
      return;
    }

    const taskTitles = this.getTaskTitles();
    const parentTask = this.createParentTask();

    taskTitles.reverse().forEach((taskTitle) => {
      this.createChidedTask(taskTitle, parentTask);
    });

    sheet.getRange(rowNumber, 3).setValue(this.options.addedStatusValue);
    sheet.getRange(rowNumber, 4).setValue(parentTask.id);
  }

  /**
   * 登録するタスクのタイトルのリストを取得する
   *
   * @returns タスクのタイトルのリスト
   */
  protected getTaskTitles (): string[] {
    const taskTitles: string[] = [];
    const tasksSheet = this.getTasksSheet();
    const lastRow = 20;

    for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
      const isEnable = tasksSheet.getRange(rowNumber, 1).getValue() as boolean;

      if (isEnable) {
        const taskTitle = tasksSheet.getRange(rowNumber, 2).getValue() as string;
        taskTitles.push(taskTitle);
      }
    }

    return taskTitles;
  }

  /**
   * 新しいタスクを追加する
   *
   * @param taskTitle タスクのタイトル
   * @param options タスクのオプション
   * @returns 作成されたタスク
   */
  protected insertNewTask (taskTitle: string, options: TaskInsertOptions): Task {
    const newTask = Tasks.newTask();
    newTask.title = taskTitle;
    if (options.due) {
      newTask.due = options.due;
    }

    return Tasks.Tasks.insert(newTask, this.options.task.listId, options);
  }

  /**
   * 親のタスクを作成する
   *
   * @returns 作成されたタスク
   */
  protected createParentTask (): Task {
    const startDateTime = this.settings.event.eventStartDateTime;
    const timeZone = 'Asia/Tokyo';
    const due = Utilities.formatDate(startDateTime, timeZone, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const titleDate = Utilities.formatDate(startDateTime, timeZone, 'yyyy/MM/dd');
    const title = `${titleDate} ${this.options.task.parentTaskTitle}`;
    const options: TaskInsertOptions = {
      due,
    };

    return this.insertNewTask(title, options);
  }

  /**
   * サブタスクを設定する
   *
   * @param taskTitle タスクのタイトル
   * @param parentTask 親タスク
   * @return 作成されたタスク
   */
  protected createChidedTask (taskTitle: string, parentTask: Task): Task {
    const options: TaskInsertOptions = {
      parent: parentTask.id,
    };

    return this.insertNewTask(taskTitle, options);
  }

  /**
   * タスクが登録されたシートを取得する.
   *
   * @returns スプレッドシート
   */
  protected getTasksSheet (): Sheet {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.options.task.sheetName);
  }
}

/**
 * シートに登録されたイベントとタスクを登録する
 */
export function start (): void {
  const scriptProperties = PropertiesService.getScriptProperties();

  // データの入ったシート名
  const baseSheetName = scriptProperties.getProperty('BASE_SHEET_NAME');
  // 実行する status の値
  const executeStatusValue = scriptProperties.getProperty('EXECUTE_STATUS_VALUE');
  // 実行完了後にセットする status の値
  const addedStatusValue = scriptProperties.getProperty('ADDED_STATUS_VALUE');

  // 登録するカレンダーの ID
  const calendarId = scriptProperties.getProperty('CALENDAR_ID');
  // 標準のタイトル
  const defaultTitle = scriptProperties.getProperty('DEFAULT_TITLE');
  // 標準の場所
  const defaultLocation = scriptProperties.getProperty('DEFAULT_LOCATION');
  // 通知する時間
  const popupMinutes = scriptProperties.getProperty('POPUP_MINUTES');

  // データの入ったシート名
  const taskSheetName = scriptProperties.getProperty('TASK_SHEET_NAME');
  // タスクリストの ID
  const taskListId = scriptProperties.getProperty('TASK_LIST_ID');
  // ベースのタイトル
  const parentTaskTitle = scriptProperties.getProperty('PARENT_TASK_TITLE');

  const eventOptions: EventOptions = {
    calendarId: calendarId,
    defaultTitle: defaultTitle,
    defaultLocation: defaultLocation,
    popupMinutes: popupMinutes,
  };

  const taskOptions: TaskOptions = {
    sheetName: taskSheetName,
    listId: taskListId,
    parentTaskTitle: parentTaskTitle,
  };

  const applicationOptions: ApplicationOptions = {
    sheetName: baseSheetName,
    executeStatusValue: executeStatusValue,
    addedStatusValue: addedStatusValue,
    event: eventOptions,
    task: taskOptions,
  };

  const application = new Application(applicationOptions);
  application.start();
}
