# gas-part-time-jobs-calendar

![GitHub Actions Node CI Status](https://github.com/hiroxto/gas-part-time-jobs-calendar/workflows/Node%20CI/badge.svg)

アルバイトのカレンダーとタスクを自動入力する Google Apps Script

## Install

```sh
$ git clone git@github.com:hiroxto/gas-part-time-jobs-calendar.git
$ cd gas-part-time-jobs-calendar
$ yarn install
$ cp .clasp.example.json .clasp.json
```

## Setting

カレンダーとタスクの登録を実行するにはプロパティの設定が必要.

`ファイル -> プロジェクトのプロパティ -> スクリプトのプロパティ` から, 下記のプロパティを設定する.

### イベント登録とタスク登録の両方で使うプロパティの設定

|プロパティ名|値の説明|値の例|
|:---:|:---:|:---:|
|EXECUTE_STATUS_VALUE|登録, 更新を実行する対象の値|`登録/更新する`|
|ADDED_STATUS_VALUE|実行完了後の値|`登録完了`|
|LAST_ROW_STATUS_VALUE|最終行の値. イベントにこれがセットされていると, その行で終了する.|`最終行`|
|BASE_SHEET_NAME|データの入ったシート名|`勤務データ`|
|START_LINE|開始する行．2以上の値．|`2`|

### イベント登録で使うプロパティの設定

|プロパティ名|値の説明|値の例|
|:---:|:---:|:---:|
|CALENDAR_ID|登録するカレンダーのID|`hogehoge@group.calendar.google.com`|
|DEFAULT_TITLE|標準のタイトル|`アルバイト`|
|DEFAULT_LOCATION|標準の場所|`勤務先`|
|POPUP_MINUTES|通知する時間. `,` で区切る. 単位 : 分|`30,60,180,1440`|

### タスク登録で使うプロパティの設定

|プロパティ名|値の説明|値の例|
|:---:|:---:|:---:|
|TASK_SHEET_NAME|タスクのデータが入ったシート名|`タスク登録データ`|
|TASK_LIST_ID|タスクリストの ID|`hogehoge`|
|PARENT_TASK_TITLE|タイトルのベース|`アルバイト 持ち物確認`|

## Publish

`.clasp.json` の `scriptId` を設定して, 以下のコマンドを実行する

```sh
$ yarn run push
```

## License

[MIT License](https://github.com/hiroxto/gas-part-time-jobs-calendar/blob/master/LICENSE "MIT License")
