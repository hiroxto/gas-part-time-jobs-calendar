// eslint-disable-next-line no-undef
import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;

const properties = PropertiesService.getScriptProperties();

// 実行する status の値
const EXECUTE_STATUS_VALUE = properties.getProperty('EXECUTE_STATUS_VALUE');
// 実行完了後にセットする status の値
const ADDED_STATUS_VALUE = properties.getProperty('ADDED_STATUS_VALUE');
// 登録するカレンダーの ID
const CALENDAR_ID = properties.getProperty('CALENDAR_ID');
// データの入ったシート名
const SHEET_NAME = properties.getProperty('SHEET_NAME');
// 標準の場所
const DEFAULT_LOCATION = properties.getProperty('DEFAULT_LOCATION');
// 標準のタイトル
const DEFAULT_TITLE = properties.getProperty('DEFAULT_TITLE');
// 通知する時間
const POPUP_MINUTES = properties.getProperty('POPUP_MINUTES');

interface CalendarOptions {
  description: string;
  location: string;
}

/**
 * シートのデータをカレンダーに登録する
 */
export function addEventsToGoogleCalendar (): void {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  for (let rowNumber = 2; rowNumber <= sheet.getLastRow(); rowNumber++) {
    const status = sheet.getRange(rowNumber, 1).getValue();

    if (status !== EXECUTE_STATUS_VALUE) {
      continue;
    }

    let columnNumber = 2;
    const id = sheet.getRange(rowNumber, columnNumber).getValue();
    const useDefaultTitle = sheet.getRange(rowNumber, columnNumber).getValue() as boolean;
    const customTitle = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventStartDateTime = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventEndDateTime = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const useDefaultLocation = sheet.getRange(rowNumber, ++columnNumber).getValue() as boolean;
    const customLocation = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const description = sheet.getRange(rowNumber, ++columnNumber).getValue();

    const title = useDefaultTitle ? DEFAULT_TITLE : customTitle;
    const location = useDefaultLocation ? DEFAULT_LOCATION : customLocation;
    const options: CalendarOptions = { description, location };

    const calendarEvent = id === ''
      ? createNewCalendarEvent(title, eventStartDateTime, eventEndDateTime, options)
      : updateCalendarEvent(id, title, eventStartDateTime, eventEndDateTime, options);

    addPopupReminders(calendarEvent);

    sheet.getRange(rowNumber, 1).setValue(ADDED_STATUS_VALUE);
    sheet.getRange(rowNumber, 2).setValue(calendarEvent.getId());
  }
}

/**
 * イベントを新規作成する
 *
 * @param title イベントのタイトル
 * @param startDateTime イベントの開始日時
 * @param endDateTime イベントの終了日時
 * @param options イベントのオプション
 * @returns 作成されたイベント
 */
export function createNewCalendarEvent (title: string, startDateTime: Date, endDateTime: Date, options: CalendarOptions): CalendarEvent {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);

  return calendar.createEvent(title, startDateTime, endDateTime, options);
}

/**
 * 既存のイベントを更新する
 *
 * @param id カレンダーのID
 * @param title イベントのタイトル
 * @param startDateTime イベントの開始日時
 * @param endDateTime イベントの終了日時
 * @param options イベントのオプション
 * @returns 更新されたイベント
 */
export function updateCalendarEvent (id: string, title: string, startDateTime: Date, endDateTime: Date, options: CalendarOptions): CalendarEvent {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  const event = calendar.getEventById(id);

  event
    .setTitle(title)
    .setTime(startDateTime, endDateTime)
    .setDescription(options.description)
    .setLocation(options.location);

  return event;
}

/**
 * イベントに通知を設定する
 * 既存の通知は削除される
 *
 * @param event 通知を設定するイベント
 * @returns 通知を設定したイベント
 */
export function addPopupReminders (event: CalendarEvent): CalendarEvent {
  const popupAts: number[] = POPUP_MINUTES.split(',').map(s => Number(s.trim()));

  event.removeAllReminders();

  popupAts.forEach(popupAt => {
    event.addPopupReminder(popupAt);
  });

  return event;
}
