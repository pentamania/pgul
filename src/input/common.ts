export const KEY_UP_FLG_NUM = -1; // 負数ならOK
export const KEY_DOWN_FLG_NUM = 1;

/**
 * @param mapRef
 * @param key キー
 * @param keyPressed 入力があるかどうか
 * @param autoPlayMode ユーザー入力を無視し、独自の異なる処理をする
 */
export function updateStateFrame<T>(
  mapRef: Map<T, number>,
  key: T,
  keyPressed: boolean,
  autoPlayMode: boolean
) {
  const lastVal = mapRef.get(key);
  if (lastVal == null) return;
  let nextVal = lastVal;

  // Common
  // keyUp -> 一旦ニュートラルへ
  if (lastVal === KEY_UP_FLG_NUM) {
    nextVal = 0;
  }

  if (autoPlayMode) {
    // 自動プレイモード
    if (0 < lastVal) {
      // keyDown/Press -> そのままpress状態つづける
      nextVal = lastVal + 1;
    }
  } else {
    // 通常モード
    if (keyPressed) {
      // keydown化 or keypress加算
      nextVal += 1;
    } else {
      if (0 < lastVal) {
        // keyDown/Press -> KeyUp状態へ
        nextVal = KEY_UP_FLG_NUM;
      }
    }
  }
  mapRef.set(key, nextVal);
}

/**
 * 内部キー状態を変更
 * 押下 <=> 離すを切り替える
 *
 * リプレイなどの自動操作用
 *
 * @param mapRef
 * @param key
 * @returns
 */
export function toggleKeyStateFrame<T>(mapRef: Map<T, number>, key: T) {
  const lastVal = mapRef.get(key);
  if (lastVal == null) return;

  if (0 < lastVal) {
    // keyDown/Press -> Up
    mapRef.set(key, KEY_UP_FLG_NUM);
  } else {
    // neutral/keyUp -> Down
    mapRef.set(key, KEY_DOWN_FLG_NUM);
  }
}
