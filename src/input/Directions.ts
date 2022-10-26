export const D_UP = "up";
export const D_DOWN = "down";
export const D_LEFT = "left";
export const D_RIGHT = "right";

export type Direction =
  | typeof D_UP
  | typeof D_DOWN
  | typeof D_LEFT
  | typeof D_RIGHT;

export const DirectionKeys = [D_UP, D_DOWN, D_LEFT, D_RIGHT] as const;
