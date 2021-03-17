import { parseQueryString } from "./utils/index";

let isProduction: boolean;
try {
  isProduction = process.env.NODE_ENV !== "development";
} catch (error) {
  isProduction = true;
}

/**
 * ビルド環境・クエリパラメータを利用した汎用デバッガ
 */
export class Debugger<QP = { [k: string]: any }> {
  log(...args: any[]) {
    if (!Debugger.isProduction) console.log(...args);
  }

  warn(...args: any[]) {
    if (!Debugger.isProduction) console.warn(...args);
  }

  error(...args: any[]) {
    if (!Debugger.isProduction) console.error(...args);
  }

  get isProduction() {
    return Debugger.isProduction;
  }

  get isDev() {
    return !Debugger.isProduction;
  }

  get queryParams(): QP {
    // クローンする？
    return Debugger.queryParameters as QP;
  }

  /**
   * 開発環境かどうか
   * 環境変数から設定
   */
  static readonly isProduction: boolean = isProduction;

  /**
   * URLのクエリパラメータをパースして取得
   */
  static readonly queryParameters: { [k: string]: any } = Object.freeze(
    parseQueryString()
  );
}
