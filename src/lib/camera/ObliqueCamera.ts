import { MathUtils } from "../math/MathUtils";
import { Matrix4 } from "../math/Matrix4";
import { Camera } from "./Camera";

export class ObliqueCamera extends Camera {
  _left: number;
  _right: number;
  _top: number;
  _bottom: number;
  _near: number;
  _far: number;
  _theta: number;
  _ratio: number;

  constructor(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
    theta: number,
    ratio: number,
  ) {
    super(); // Setup Node
    this._left = left;
    this._right = right;
    this._top = top;
    this._bottom = bottom;
    this._near = near;
    this._far = far;
    this._theta = theta;
    this._ratio = ratio;

    this.computeProjectionMatrix();
  }

  override copy(camera: ObliqueCamera, copyChildren: boolean = true) {
    super.copy(camera, copyChildren);
    this._left = camera._left;
    this._right = camera._right;
    this._top = camera._top;
    this._bottom = camera._bottom;
    this._near = camera._near;
    this._far = camera._far;
    this._theta = camera._theta;
    this._ratio = camera._ratio;
    return this;
  }
  override clone(copyChildren: boolean = true): ObliqueCamera {
    const cloned = new ObliqueCamera(
      this._left,
      this._right,
      this._top,
      this._bottom,
      this._near,
      this._far,
      this._theta,
      this._ratio,
    );
    cloned.copy(this, copyChildren);
    cloned.uuid = this.uuid;

    return cloned;
  }

  override computeProjectionMatrix() {
    const thetaRad = this._theta * MathUtils.DEGTORAD;

    const zoom = 10 / Math.abs(this.position.z);
    const lenX = (this._right - this._left) / 2;
    const lenY = (this._top - this._bottom) / 2;

    const newLenX = (lenX + lenX / zoom) / 2;
    const newLenY = (lenY + lenY / zoom) / 2;

    this._projectionMatrix = Matrix4.multiplyMatrices(
      Matrix4.oblique(
        -newLenX,
        newLenX,
        newLenY,
        -newLenY,
        this._near,
        this._far,
        thetaRad,
        this._ratio,
      ),
      Matrix4.makeTranslation(5, -5, 0),
    );
  }
}
