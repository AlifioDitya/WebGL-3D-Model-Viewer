import { BufferAttribute } from "./BufferAttribute";
import { BufferGeometry } from "./BufferGeometry";

export class TriangleGeometry extends BufferGeometry {
  constructor() {
    super();
    const vertices = new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]);
    const positionAttribute = new BufferAttribute(vertices, 3);
    this.setAttribute("position", positionAttribute);
    this.calculateNormals();
  }
}
