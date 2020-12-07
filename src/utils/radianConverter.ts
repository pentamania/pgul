const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

export function toRadian(deg: number) {
  return deg * DEG_TO_RAD
}

export function toDegree(rad: number) {
  return rad * RAD_TO_DEG
}
