/**
 * [en]
 * Add accessor via extending Object prototypes
 *
 * @example
 * addAccessor(Object3D.prototype, "x", {
 *   get() {
 *     return this.position.x;
 *   },
 *   set(v) {
 *     this.position.x = v;
 *   },
 * });
 *
 * @param obj
 * @param prop
 * @param accessor
 */
export function addAccessor<T>(
  obj: T,
  prop: string,
  accessor: {
    get: (this: T) => any;
    set: (this: T, v: any) => any;
  }
) {
  Object.defineProperty(obj, prop, {
    get: accessor.get,
    set: accessor.set,
    enumerable: false,
    configurable: true,
  });
}

/**
 * [en]
 * Add getter via extending Object prototypes
 *
 * @param obj
 * @param prop
 * @param getter
 */
export function addGetter<T>(obj: T, prop: string, getter: (this: T) => any) {
  Object.defineProperty(obj, prop, {
    get: getter,
    enumerable: false,
    configurable: true,
  });
}

/**
 * [en]
 * Add setter via extending Object prototypes
 *
 * @param obj
 * @param prop
 * @param setter
 */
export function addSetter<T>(obj: T, prop: string, setter: (this: T) => any) {
  Object.defineProperty(obj, prop, {
    set: setter,
    enumerable: false,
    configurable: true,
  });
}
