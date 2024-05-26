import { MathUtils } from "../math/MathUtils";
import { Matrix4 } from "../math/Matrix4";
import { Camera } from "./Camera";

export class PerspectiveCamera extends Camera {
  _fov: number;
  _aspect: number;
  _near: number;
  _far: number;

  constructor(
    fov: number = 45,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 100,
  ) {
    super(); // Setup Node
    this._fov = fov;
    this._aspect = aspect;
    this._near = near;
    this._far = far;

    this.computeProjectionMatrix();
  }

  override copy(camera: PerspectiveCamera, copyChildren: boolean = true): this {
    super.copy(camera, copyChildren);
    this._fov = camera._fov;
    this._aspect = camera._aspect;
    this._near = camera._near;
    this._far = camera._far;
    return this;
  }

  override clone(copyChildren: boolean = true): PerspectiveCamera {
    const cloned = new PerspectiveCamera(
      this._fov,
      this._aspect,
      this._near,
      this._far,
    );

    cloned.copy(this, copyChildren);
    cloned.uuid = this.uuid;

    return cloned;
  }

  override computeProjectionMatrix() {
    const fovRad = this._fov * MathUtils.DEGTORAD;

    this._projectionMatrix = Matrix4.perspective(
      fovRad,
      this._aspect,
      this._near,
      this._far,
    );
  }
}
