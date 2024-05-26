import { Matrix4 } from "../math/Matrix4";
import { Camera } from "./Camera";

export class OrthographicCamera extends Camera {
  _top: number;
  _bottom: number;
  _left: number;
  _right: number;
  _near: number;
  _far: number;

  constructor(
    left: number = -1,
    right: number = 1,
    bottom: number = -1,
    top: number = 1,
    near: number = 0.1,
    far: number = 100,
  ) {
    super(); // Setup Node
    this._left = left;
    this._right = right;
    this._top = top;
    this._bottom = bottom;
    this._near = near;
    this._far = far;
    // Jangan lupa untuk panggil computeProjectionMatrix() setiap
    // kali mengubah nilai left, right, top, bottom, near, atau far.
    this.computeProjectionMatrix();
  }
  override copy(camera: OrthographicCamera, copyChildren: boolean = true) {
    super.copy(camera, copyChildren);
    this._top = camera._top;
    this._bottom = camera._bottom;
    this._left = camera._left;
    this._right = camera._right;
    this._near = camera._near;
    this._far = camera._far;
    return this;
  }

  override clone(copyChildren: boolean = true): OrthographicCamera {
    const cloned = new OrthographicCamera(
      this._left,
      this._right,
      this._bottom,
      this._top,
      this._near,
      this._far,
    );
    cloned.copy(this, copyChildren);
    cloned.uuid = this.uuid;

    return cloned;
  }

  override computeProjectionMatrix() {
    const zoom = 10 / Math.abs(this.position.z);
    const lenX = (this._right - this._left) / 2;
    const lenY = (this._top - this._bottom) / 2;

    const newLenX = (lenX + lenX / zoom) / 2;
    const newLenY = (lenY + lenY / zoom) / 2;

    this._projectionMatrix = Matrix4.orthographic(
      -newLenX,
      newLenX,
      newLenY,
      -newLenY,
      this._near,
      this._far,
    );
  }
}
