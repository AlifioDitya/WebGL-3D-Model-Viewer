import { BufferGeometry } from "../geometry/BufferGeometry";
import { BasicMaterial } from "../material/BasicMaterial";
import { ShaderMaterial } from "../material/ShaderMaterial";
import { ObjectTreeNode } from "./ObjectTreeNode";

export class Mesh extends ObjectTreeNode {
  geometry: BufferGeometry;
  material: ShaderMaterial;

  constructor(
    geometry: BufferGeometry = new BufferGeometry(),
    material: ShaderMaterial = new BasicMaterial(),
  ) {
    super();
    this.geometry = geometry;
    this.material = material;
  }

  copy(mesh: Mesh, copyChildren: boolean = true) {
    super.copy(mesh, copyChildren);
    this.geometry.copy(mesh.geometry);
    this.material.copy(mesh.material);
    return this;
  }

  clone(copyChildren: boolean = true) {
    const cloned = new Mesh().copy(this, copyChildren);
    cloned.uuid = this.uuid;
    return cloned;
  }
}
