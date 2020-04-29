import { ApplicationOptions } from '~/types/application';
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
   * スプレッドシートを取得する
   *
   * @returns イベントの設定が入ったシート
   */
  protected getSheet (): Sheet {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.options.sheetName);
  }
}
