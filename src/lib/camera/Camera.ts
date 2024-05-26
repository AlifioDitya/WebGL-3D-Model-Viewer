import { Matrix4 } from "../math/Matrix4";
import { ObjectTreeNode } from "../object/ObjectTreeNode";

export abstract class Camera extends ObjectTreeNode {
  protected _projectionMatrix = Matrix4.identity();
  private _invWorldMatrix = Matrix4.identity();

  copy(camera: Camera, copyChildren: boolean = true) {
    super.copy(camera, copyChildren);
    this._projectionMatrix.copy(camera.projectionMatrix);
    this._invWorldMatrix.copy(camera._invWorldMatrix);
    return this;
  }

  abstract clone(copyChildren?: boolean): ObjectTreeNode;

  computeWorldTransform() {
    super.computeWorldTransform();
    this.invertWorldMatrix();
  }

  protected invertWorldMatrix() {
    const temp = new Matrix4();
    temp.copy(this.worldTransform);
    temp.invert();
    this._invWorldMatrix = temp;
  }

  get viewProjectionMatrix() {
    if (!("_fov" in this)) {
      this.computeProjectionMatrix();
    }
    this.computeWorldTransform();
    return Matrix4.multiplyMatrices(
      this.projectionMatrix,
      this._invWorldMatrix,
    );
  }

  get projectionMatrix() {
    return this._projectionMatrix;
  }

  abstract computeProjectionMatrix(): void;
}
