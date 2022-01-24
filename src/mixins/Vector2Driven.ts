import clamp from "../utils/clamp";
import { Vector2 } from "../Vector2";
import { TwoDimensionalObjectConstructor } from "../utilTypes";

const DEFAULT_FRICTION = 0.9;
const DEFAULT_SPEED = Infinity;

/**
 * @param Base
 * @returns
 */
export function Vector2Driven<TBase extends TwoDimensionalObjectConstructor>(
  Base: TBase
) {
  return class extends Base {
    readonly vector: Vector2 = new Vector2(0, 0);

    maxSpeed: number = DEFAULT_SPEED;

    applyVector() {
      this.x += this.vector.x;
      this.y += this.vector.y;
    }

    accelX(a: number) {
      const max = this.maxSpeed;
      this.vector.x = clamp(this.vector.x + a, -max, max);
    }

    accelY(a: number) {
      const max = this.maxSpeed;
      this.vector.y = clamp(this.vector.y + a, -max, max);
    }

    brake(friction = DEFAULT_FRICTION) {
      this.vector.x *= friction;
      this.vector.y *= friction;
    }

    isMovingLeft(): boolean {
      return this.vector.x < 0;
    }

    isMovingRight(): boolean {
      return 0 < this.vector.x;
    }

    isMovingUp(): boolean {
      return this.vector.y < 0;
    }

    isMovingDown(): boolean {
      return 0 < this.vector.y;
    }

    setVector(x = this.vector.x, y = this.vector.y) {
      this.vector.x = x;
      this.vector.y = y;
      return this;
    }

    get vectorX() {
      return this.vector.x;
    }
    get vectorY() {
      return this.vector.y;
    }
  };
}
