import { ApplicationOptions } from '~/types/application';

export class Application {
  options: ApplicationOptions;

  /**
   * @param options イベント登録とタスク登録のオプション
   */
  constructor (options: ApplicationOptions) {
    this.options = options;
  }
}
