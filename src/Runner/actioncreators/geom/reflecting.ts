import { AreaRect } from "../../../AreaRect";
import { LooseVector2 } from "../../../utilTypes";
import { Vector2 } from "../../../Vector2";
import { TargetDeclaredRunnerAction } from "../../Runner";

const leftWallNormalVec = new Vector2(1, 0);
const rightWallNormalVec = new Vector2(-1, 0);
const topWallNormalVec = new Vector2(0, 1);
const bottomWallNormalVec = new Vector2(0, -1);

/**
 * 矩形範囲内に収まるよう壁で反射
 *
 * @param duration
 * @param areaRectRef
 */
export function createRectEnclosedAction(
  // prettier-ignore
  duration: number = Infinity,
  areaRectRef: AreaRect
): TargetDeclaredRunnerAction<LooseVector2> {
  return function* () {
    let _currentCount = 0;
    const body = this.target;
    while (_currentCount < duration) {
      let wallNormalVec: Vector2 | undefined;
      if (body.x < areaRectRef.left) {
        // 左壁
        wallNormalVec = leftWallNormalVec;
        body.x = areaRectRef.left;
        // Log("left wall");
      }
      if (areaRectRef.right < body.x) {
        // 右壁
        wallNormalVec = rightWallNormalVec;
        body.x = areaRectRef.right;
        // Log("right wall");
      }
      if (body.y < areaRectRef.top) {
        // 天井
        wallNormalVec = topWallNormalVec;
        body.y = areaRectRef.top;
        // Log("ceil");
      }
      if (areaRectRef.bottom < body.y) {
        // 床
        wallNormalVec = bottomWallNormalVec;
        body.y = areaRectRef.bottom;
        // Log("floor");
      }

      if (wallNormalVec) {
        this.setDirectionByRadian(
          Vector2.reflectedAngle(this.getVector(), wallNormalVec)
        );
        // Log(this.vx, this.vy);
      }

      yield _currentCount++;
    }
  };
}

const _originRef = new Vector2(0, 0);

export function createCircleEnclosedAction(
  duration: number = Infinity,
  circleRef: { radius: number },
  reflectAngleShift: number = 0
): TargetDeclaredRunnerAction<LooseVector2> {
  return function* () {
    let _currentCount = 0;
    const body = this.target;

    while (_currentCount < duration) {
      // Radiusは変化する場合があるのでループ処理
      const radius = circleRef.radius;

      // 距離計算： radius範囲を飛び出たら処理
      const radSq = Math.pow(radius, 2);
      const distSq = Vector2.distanceSquared(body, _originRef);
      if (radSq < distSq) {
        // 円接触位置 = 円壁垂直ベクトル
        const wallNormalVec = new Vector2(body.x, body.y);

        // 位置補正: ギリギリ判定未満の位置に補正
        wallNormalVec.setLength(radius);
        body.x = wallNormalVec.x;
        body.y = wallNormalVec.y;

        // (設定してる場合) 反射角度をずらす
        if (reflectAngleShift != 0) {
          wallNormalVec.rotateByDegree(reflectAngleShift);
        }

        // Set reflected vector
        this.setDirectionByRadian(
          Vector2.reflectedAngle(this.getVector(), wallNormalVec)
        );
      }
      yield _currentCount++;
    }
  };
}

/**
 *
 */
export function createCircleEnclosedActionRef(
  duration: number = Infinity,
  circleRef: { x: number; y: number; radius: number },
  reflectAngleShift: number = 0
): TargetDeclaredRunnerAction<LooseVector2> {
  return function* () {
    let _currentCount = 0;
    const body = this.target;

    while (_currentCount < duration) {
      const radSq = Math.pow(circleRef.radius, 2);
      const distSq = Vector2.distanceSquared(body, circleRef);
      if (radSq < distSq) {
        // 円の接線を壁とすると、
        // 中央から円接触位置へ伸ばしたベクトルがその垂直ベクトルとなる
        const wallNormalVec = new Vector2(
          body.x - circleRef.x,
          body.y - circleRef.y
        );

        // 位置補正: ギリギリ判定未満の位置に設定
        wallNormalVec.setLength(circleRef.radius);
        body.x = wallNormalVec.x + circleRef.x;
        body.y = wallNormalVec.y + circleRef.y;

        // 反射角度をずらす
        if (reflectAngleShift != 0) {
          wallNormalVec.rotateByDegree(reflectAngleShift);
        }

        // Set reflected vector
        this.setDirectionByRadian(
          Vector2.reflectedAngle(this.getVector(), wallNormalVec)
        );
      }
      yield _currentCount++;
    }
  };
}
