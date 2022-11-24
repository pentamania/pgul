/**
 * [jp]
 * 開発環境かどうか
 * process.env.NODE_ENVを確認、"development"かどうかをチェック
 * ブラウザ等でprocessにそもそアクセスできないときはfalse
 *
 * @returns
 * NODE_ENV is development
 */
export function isDev(): boolean {
  let isDev: boolean;

  try {
    isDev = process.env.NODE_ENV === "development";
  } catch (error) {
    isDev = false;
  }

  return isDev;
}

/**
 * [jp]
 * isDevの反転
 *
 * @returns
 * NODE_ENV is *not* development
 */
export function isProduction() {
  return !isDev();
}
