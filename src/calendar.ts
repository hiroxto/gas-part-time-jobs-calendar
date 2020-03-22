import { CalendarEventOptions, EventSetting, EventsRegisterOption } from '~/types';

// eslint-disable-next-line no-undef
import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;
// eslint-disable-next-line no-undef
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
// eslint-disable-next-line no-undef
import Calendar = GoogleAppsScript.Calendar.Calendar;

export class EventsRegister {
  option: EventsRegisterOption;

  constructor (option: EventsRegisterOption) {
    this.option = option;
  }

  /**
   * シートのデータをカレンダーに登録する
   */
  start (): void {
    const sheet = this.getSheet();
    for (let rowNumber = 2; rowNumber <= sheet.getLastRow(); rowNumber++) {
      const eventSetting = this.getEventSetting(sheet, rowNumber);

      if (eventSetting.status !== this.option.executeStatusValue) {
        continue;
      }

      const title = eventSetting.useDefaultTitle ? this.option.defaultTitle : eventSetting.customTitle;
      const location = eventSetting.useDefaultLocation ? this.option.defaultLocation : eventSetting.customLocation;
      const description = [
        eventSetting.baseDescription,
        `default_title : ${eventSetting.useDefaultTitle}`,
        `default_location : ${eventSetting.useDefaultLocation}`,
      ].join('\n').trim();
      const options = { description, location };

      const calendarEvent = eventSetting.id === ''
        ? this.createNewCalendarEvent(title, eventSetting.eventStartDateTime, eventSetting.eventEndDateTime)
        : this.updateCalendarEvent(eventSetting.id, title, eventSetting.eventStartDateTime, eventSetting.eventEndDateTime);

      this.setCalendarOptions(calendarEvent, options);
      this.addPopupReminders(calendarEvent);

      sheet.getRange(rowNumber, 1).setValue(this.option.addedStatusValue);
      sheet.getRange(rowNumber, 2).setValue(calendarEvent.getId());
    }
  }

  /**
   * スプレッドシートを取得する
   *
   * @returns イベントの設定が入ったシート
   * @protected
   */
  protected getSheet (): Sheet {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.option.calendarSheetName);
  }

  /**
   * カレンダーを取得する
   *
   * @returns 登録するカレンダー
   * @protected
   */
  protected getCalendar (): Calendar {
    return CalendarApp.getCalendarById(this.option.calendarId);
  }

  /**
   * イベントの設定を取得する
   *
   * @param sheet スプレッドシート
   * @param rowNumber 行番号
   * @returns イベントの設定
   * @protected
   */
  protected getEventSetting (sheet: Sheet, rowNumber: number): EventSetting {
    let columnNumber = 1;
    const status = sheet.getRange(rowNumber, columnNumber).getValue();
    const id = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const useDefaultTitle = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const customTitle = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventStartDateTime = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventEndDateTime = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const useDefaultLocation = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const customLocation = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const baseDescription = sheet.getRange(rowNumber, ++columnNumber).getValue();

    return {
      status,
      id,
      useDefaultTitle,
      customTitle,
      eventStartDateTime,
      eventEndDateTime,
      useDefaultLocation,
      customLocation,
      baseDescription,
    };
  }

  /**
   * イベントを新規作成する
   *
   * @param title イベントのタイトル
   * @param startDateTime イベントの開始日時
   * @param endDateTime イベントの終了日時
   * @returns 作成されたイベント
   * @protected
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
   * @protected
   */
  protected updateCalendarEvent (id: string, title: string, startDateTime: Date, endDateTime: Date): CalendarEvent {
    const event = this.getCalendar().getEventById(id);

    return event.setTitle(title).setTime(startDateTime, endDateTime);
  }

  /**
   * イベントにオプションをセットする
   *
   * @param event セットする対象のイベント
   * @param options イベントのオプション
   * @returns オプションを設定したイベント
   * @protected
   */
  protected setCalendarOptions (event: CalendarEvent, options: CalendarEventOptions): CalendarEvent {
    return event.setDescription(options.description).setLocation(options.location);
  }

  /**
   * イベントに通知を設定する
   * 既存の通知は削除される
   *
   * @param event 通知を設定するイベント
   * @returns 通知を設定したイベント
   * @protected
   */
  protected addPopupReminders (event: CalendarEvent): CalendarEvent {
    const popupAts: number[] = this.option.popupMinutes.split(',').map(s => Number(s.trim()));

    event.removeAllReminders();

    popupAts.forEach(popupAt => {
      event.addPopupReminder(popupAt);
    });

    return event;
  }
}

/**
 * シートのデータをカレンダーに登録する
 */
export function addEventsToGoogleCalendar (): void {
  const scriptProperties = PropertiesService.getScriptProperties();
  // 実行する status の値
  const executeStatusValue = scriptProperties.getProperty('EXECUTE_STATUS_VALUE');
  // 実行完了後にセットする status の値
  const addedStatusValue = scriptProperties.getProperty('ADDED_STATUS_VALUE');
  // 登録するカレンダーの ID
  const calendarId = scriptProperties.getProperty('CALENDAR_ID');
  // データの入ったシート名
  const calendarSheetName = scriptProperties.getProperty('CALENDAR_SHEET_NAME');
  // 標準のタイトル
  const defaultTitle = scriptProperties.getProperty('DEFAULT_TITLE');
  // 標準の場所
  const defaultLocation = scriptProperties.getProperty('DEFAULT_LOCATION');
  // 通知する時間
  const popupMinutes = scriptProperties.getProperty('POPUP_MINUTES');

  const option: EventsRegisterOption = {
    executeStatusValue,
    addedStatusValue,
    calendarId,
    defaultTitle,
    calendarSheetName,
    defaultLocation,
    popupMinutes,
  };
  const eventsRegister = new EventsRegister(option);
  eventsRegister.start();
}
