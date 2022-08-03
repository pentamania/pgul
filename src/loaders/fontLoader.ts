/**
 * Load FontFace
 *
 * @param family
 * @param path
 * @returns FontFace
 */
export async function loadFont(family: string, path: string) {
  const fontface = new FontFace(family, `url('${path}')`);
  await fontface.load();
  document.fonts.add(fontface);
  return fontface;
}

/**
 * pathMapからkey型指定済みのAssetManagerを返す
 *
 * @param pathMap
 *
 * @param keyPrefix
 * 登録キーにプレフィックスをつける
 * ローカルインストール済みの同名フォントと区別したいときに利用
 *
 * @returns AssetManager
 */
export function createFontAssetManager<T extends Record<string, string>>(
  pathMap: T,
  keyPrefix: string = ""
) {
  type FontKey = keyof T;

  const _loadedFonts: Record<FontKey, FontFace> = Object.create(null);

  return {
    /**
     * FontFaceロードを行う
     * すでにロード済みならキャッシュしたものを返す
     *
     * @param key
     * @returns Promise
     */
    async load(key: FontKey): Promise<FontFace> {
      if (_loadedFonts[key]) return _loadedFonts[key];

      // Load
      const registerKey = `${keyPrefix}${String(key)}`;
      const fontPath = pathMap[key];
      const fontface = await loadFont(registerKey, fontPath);

      // Add
      _loadedFonts[key] = fontface;

      return fontface;
    },

    /**
     * 全ての登録アセットをロードする
     *
     * @returns Promise
     */
    async loadAll() {
      const flows = [];
      for (const [key] of Object.entries(pathMap)) {
        flows.push(this.load(key));
      }
      return Promise.all(flows);
    },

    /**
     * Get fontface data
     * Error will be thrown if specified font is not loaded
     *
     * @param key
     * @returns
     */
    get(key: FontKey): FontFace {
      if (!_loadedFonts[key]) {
        throw new Error(
          `[pgul] FontFace "${String(
            key
          )}" is not loaded yet. Use "load" to cache font.`
        );
      }
      return _loadedFonts[key];
    },
  };
}
