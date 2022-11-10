/**
 * Typegaurd for Generator
 *
 * @param obj
 * @returns
 */
export function isGenerator(obj: any): obj is Generator {
  return obj && typeof obj.next === "function";
}
