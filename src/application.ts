import { ApplicationOptions, Settings, EventSettings, TaskSettings } from '~/types/application';
import { Sheet } from '~/types';

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
    const taskStatus = sheet.getRange(rowNumber, columnNumber).getValue();
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
      event: eventSettings,
      task: taskSettings,
    };
  }

  /**
   * イベントの登録を行う
   * @param settings
   */
  protected registerEvent (settings: Settings): void{
  }

  /**
   * タスクの登録を行う
   * @param settings
   */
  protected registerTask (settings: Settings): void{
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
