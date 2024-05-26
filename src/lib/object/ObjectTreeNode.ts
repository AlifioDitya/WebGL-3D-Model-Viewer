import { Matrix4 } from "../math/Matrix4";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { v4 as uuidv4 } from "uuid";
import { isCamera, isLight, isMesh } from "../helper/typeChecker";

interface ObjectTreeNodeJSON {
  position: number[];
  rotation: number[];
  scale: number[];
  enable: boolean;
  children: ObjectTreeNodeJSON[];
}

export class ObjectTreeNode {
  // Identity
  private _name: string = "";
  private _uuid: string = uuidv4();

  // Transforms
  private _position: Vector3 = new Vector3();
  private _rotation: Vector3 = new Vector3();
  private _quaternion: Quaternion = new Quaternion(); // Add quaternion
  private _scale: Vector3 = new Vector3(1, 1, 1);
  private _localTransform: Matrix4 = Matrix4.identity();
  private _worldTransform: Matrix4 = Matrix4.identity();

  // Node hierarchy
  private _parent?: ObjectTreeNode | null;
  private _children: ObjectTreeNode[] = [];

  // Enable/disable rendering
  enable = true;
  dead = false;

  // Constructor
  constructor(name: string = "") {
    this.name = name;
  }

  // Copy constructor
  copy(node: ObjectTreeNode, copyChildren: boolean = true): this {
    this._name = node._name;
    this._uuid = uuidv4(); // Ensure a new UUID is assigned to the copy
    this._position.copy(node._position);
    this._rotation.copy(node._rotation);
    this._quaternion.copy(node._quaternion); // Copy quaternion
    this._scale.copy(node._scale);
    this._localTransform.copy(node._localTransform);
    this._worldTransform.copy(node._worldTransform);
    this.enable = node.enable;

    if (copyChildren) {
      // Copy children
      this._children = node._children.map((child) => {
        const newChild = new (child.constructor as new () => ObjectTreeNode)();
        newChild.copy(child);
        newChild._parent = this; // Set the parent of the copied child
        return newChild;
      });
    } else {
      this._children = [];
    }

    return this;
  }

  // Clone object
  clone(copyChildren: boolean = true) {
    const cloned = new ObjectTreeNode().copy(this, copyChildren);
    cloned.uuid = this.uuid;
    return cloned;
  }

  cloneAndChange(copyNode: ObjectTreeNode, changedNode?: ObjectTreeNode) {
    if (
      (isCamera(this) && isCamera(copyNode)) ||
      (isLight(this) && isLight(copyNode))
    ) {
      throw new Error("Cannot cloneAndChange on camera or light object");
    }

    this._name = copyNode._name;
    this._uuid = copyNode._uuid;

    const isChangedNode = changedNode && this._uuid === changedNode._uuid;

    let toCopyNode = copyNode;
    if (isChangedNode) {
      toCopyNode = changedNode; // Use changed node instead of copy node
    }

    const isThisMesh = isMesh(this) && isMesh(toCopyNode);

    this._position.copy(toCopyNode._position);
    this._rotation.copy(toCopyNode._rotation);
    this._quaternion.copy(toCopyNode._quaternion);
    this._scale.copy(toCopyNode._scale);

    this._localTransform.copy(toCopyNode._localTransform);
    this._worldTransform.copy(toCopyNode._worldTransform);
    this.enable = toCopyNode.enable;

    if (isThisMesh) {
      (this as any).geometry.copy((toCopyNode as any).geometry);
      (this as any).material.copy((toCopyNode as any).material);
    }

    toCopyNode.kill(false);

    // Copy children
    this._children = toCopyNode._children.map((child) => {
      const newChild = new (child.constructor as new () => ObjectTreeNode)();
      newChild.cloneAndChange(child, isChangedNode ? undefined : changedNode);
      newChild._parent = this; // Set the parent of the copied child
      return newChild;
    });

    return this;
  }

  // Public getter, prevent re-instance new object
  get name() {
    return this._name;
  }
  get uuid() {
    return this._uuid;
  }
  get position() {
    return this._position;
  }
  get rotation() {
    return this._rotation;
  }
  get quaternion() {
    return this._quaternion;
  }
  get scale() {
    return this._scale;
  }
  get parent() {
    return this._parent;
  }
  get localTransform() {
    return this._localTransform;
  }
  get worldTransform() {
    return this._worldTransform;
  }
  get children() {
    return this._children;
  }

  get worldPosition() {
    this.computeWorldTransform();
    return this.worldTransform.extractPosition();
  }

  // Public setter
  // Should update world matrix if parent changed
  set parent(parent) {
    if (this._parent !== parent) {
      this._parent = parent;
      this.computeWorldTransform(false, true);
    }
  }
  set name(name) {
    this._name = name;
  }
  set uuid(uuid) {
    this._uuid = uuid;
  }
  set children(children) {
    this._children = children;
  }
  set position(position) {
    this._position.copy(position);
  }
  set rotation(rotation) {
    this._rotation.copy(rotation);
    this._quaternion.setFromEulerAngles(rotation); // Set quaternion from Euler angles
  }
  set quaternion(quaternion) {
    this._quaternion.copy(quaternion);
    this._rotation = this._quaternion.toEulerAngles(); // Set Euler angles from quaternion
  }
  set scale(scale) {
    this._scale.copy(scale);
  }

  // Indexer for position, rotation, and scale
  getProperty(
    axis: "x" | "y" | "z",
    type: "position" | "rotation" | "scale",
  ): number {
    switch (type) {
      case "position":
        return this.position[axis];
      case "rotation":
        return this.rotation[axis];
      case "scale":
        return this.scale[axis];
      default:
        throw new Error("Invalid property type");
    }
  }

  setProperty(
    axis: "x" | "y" | "z",
    type: "position" | "rotation" | "scale",
    value: number,
  ): void {
    let vector = this[type].clone();
    vector[axis] = value;
    this[type] = vector;
  }

  // Transform relative to its parent
  computeLocalTransform() {
    this._localTransform = Matrix4.multiplyMatrices(
      Matrix4.makeTranslation(this._position),
      this._quaternion.toMatrix4(), // Use quaternion for rotation
      Matrix4.makeScale(this._scale.x, this._scale.y, this._scale.z),
    );
  }

  // Transform relative to the world. Should change its children world matrix
  computeWorldTransform(updateParent = true, updateChildren = true) {
    if (updateParent && this.parent) {
      this.parent.computeWorldTransform(true, false);
    }
    this.computeLocalTransform();
    if (this.parent) {
      this._worldTransform = Matrix4.multiplyMatrices(
        this.parent.worldTransform,
        this._localTransform,
      );
    } else {
      this._worldTransform.copy(this._localTransform);
    }
    if (updateChildren) {
      for (const child of this._children) {
        child.computeWorldTransform(false, true);
      }
    }
  }

  /**
   * Tambah node sebagai child dari node ini.
   *
   * Jika node sudah memiliki parent, maka node akan
   * dilepas dari parentnya terlebih dahulu.
   */
  add(treeNode: ObjectTreeNode) {
    if (treeNode.parent !== this) {
      treeNode.removeFromParent();
    }
    treeNode.parent = this;

    this.children.push(treeNode);
  }

  remove(treeNode: ObjectTreeNode) {
    const index = this.children.findIndex(
      (child) => child.uuid === treeNode.uuid,
    );

    if (index >= 0) {
      this.children.splice(index, 1);

      // Note: Set parent to null outside of this method
    }
  }

  removeFromParent() {
    if (this._parent) {
      this._parent.remove(this);
    }
    return this;
  }

  toJSON(): ObjectTreeNodeJSON {
    return {
      position: this.position.toArray(),
      rotation: this.rotation.toArray(),
      scale: this.scale.toArray(),
      enable: this.enable,
      children: this.children.map((child) => child.toJSON()),
    };
  }

  static fromJSON(json: ObjectTreeNodeJSON) {
    const node = new ObjectTreeNode();
    node.position.setFromArray(json.position);
    node.rotation.setFromArray(json.rotation);
    node.scale.setFromArray(json.scale);
    node.enable = json.enable;
    node._children = json.children.map((child: any) =>
      ObjectTreeNode.fromJSON(child),
    );
    return node;
  }

  kill(killChildren: boolean = true) {
    this.dead = true;

    if (killChildren) {
      for (const child of this.children) {
        child.kill();
      }
    }
  }
}
