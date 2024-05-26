import { BufferAttribute } from "./BufferAttribute";
import { BufferGeometry } from "./BufferGeometry";
import { Vector3 } from "../math/Vector3";

export class TetrakisHexahedron extends BufferGeometry {
  thickness: number;
  positions: number[];
  normals: number[];
  shorterEdge: number;
  longerEdge: number;

  constructor(
    thickness: number = 0.1,
    shorterEdge: number = 1.5,
    longerEdge: number = 2,
  ) {
    super();
    this.thickness = thickness;
    this.shorterEdge = shorterEdge;
    this.longerEdge = longerEdge;
    this.positions = [];
    this.normals = [];

    const outerVertices = [
      new Vector3(shorterEdge, 0, 0), // v0
      new Vector3(-shorterEdge, 0, 0), // v1
      new Vector3(0, shorterEdge, 0), // v2
      new Vector3(0, -shorterEdge, 0), // v3
      new Vector3(0, 0, longerEdge / 2), // v4
      new Vector3(0, 0, -longerEdge / 2), // v5
      new Vector3(longerEdge / 2, longerEdge / 2, longerEdge / 2), // v6
      new Vector3(longerEdge / 2, -longerEdge / 2, longerEdge / 2), // v7
      new Vector3(-longerEdge / 2, longerEdge / 2, longerEdge / 2), // v8
      new Vector3(-longerEdge / 2, -longerEdge / 2, longerEdge / 2), // v9
      new Vector3(longerEdge / 2, longerEdge / 2, -longerEdge / 2), // v10
      new Vector3(longerEdge / 2, -longerEdge / 2, -longerEdge / 2), // v11
      new Vector3(-longerEdge / 2, longerEdge / 2, -longerEdge / 2), // v12
      new Vector3(-longerEdge / 2, -longerEdge / 2, -longerEdge / 2), // v13
    ];

    const scale = 1 - this.thickness;
    const innerVertices = outerVertices.map((v) => v.clone().multiply(scale));

    const edges = [
      [outerVertices[0], outerVertices[2]],
      [outerVertices[0], outerVertices[3]],
      [outerVertices[0], outerVertices[4]],
      [outerVertices[0], outerVertices[5]],
      [outerVertices[1], outerVertices[2]],
      [outerVertices[1], outerVertices[3]],
      [outerVertices[1], outerVertices[4]],
      [outerVertices[1], outerVertices[5]],
      [outerVertices[2], outerVertices[4]],
      [outerVertices[2], outerVertices[5]],
      [outerVertices[3], outerVertices[4]],
      [outerVertices[3], outerVertices[5]],
      [outerVertices[6], outerVertices[7]],
      [outerVertices[6], outerVertices[8]],
      [outerVertices[6], outerVertices[10]],
      [outerVertices[7], outerVertices[9]],
      [outerVertices[7], outerVertices[11]],
      [outerVertices[8], outerVertices[9]],
      [outerVertices[8], outerVertices[12]],
      [outerVertices[9], outerVertices[13]],
      [outerVertices[10], outerVertices[11]],
      [outerVertices[10], outerVertices[12]],
      [outerVertices[11], outerVertices[13]],
      [outerVertices[12], outerVertices[13]],
    ];

    for (let [outerStart, outerEnd] of edges) {
      const innerStart = outerStart.clone().multiply(scale);
      const innerEnd = outerEnd.clone().multiply(scale);
      this.createEdge(outerStart, outerEnd);
      this.createEdge(innerStart, innerEnd);
      this.addQuad(outerStart, outerEnd, innerEnd, innerStart);
    }

    this.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(this.positions), 3),
    );
    this.setAttribute(
      "normal",
      new BufferAttribute(new Float32Array(this.normals), 3),
    );
  }

  createEdge(start: Vector3, end: Vector3) {
    const dir = end.clone().sub(start).normalize();
    const up = new Vector3(0, 1, 0);
    if (Math.abs(dir.y) > 0.9) {
      up.set(1, 0, 0); // use a different up vector if dir is too vertical
    }
    const right = new Vector3()
      .crossVectors(dir, up)
      .normalize()
      .multiply(this.thickness / 2);
    const forward = new Vector3()
      .crossVectors(right, dir)
      .normalize()
      .multiply(this.thickness / 2);

    const vertices = [
      start.clone().add(right).add(forward),
      start.clone().add(right).sub(forward),
      start.clone().sub(right).add(forward),
      start.clone().sub(right).sub(forward),
      end.clone().add(right).add(forward),
      end.clone().add(right).sub(forward),
      end.clone().sub(right).add(forward),
      end.clone().sub(right).sub(forward),
    ];

    const pushQuad = (v1: Vector3, v2: Vector3, v3: Vector3, v4: Vector3) => {
      const normal = new Vector3()
        .crossVectors(v2.clone().sub(v1), v3.clone().sub(v1))
        .normalize()
        .toArray();
      this.positions.push(
        ...v1.toArray(),
        ...v2.toArray(),
        ...v3.toArray(),
        ...v1.toArray(),
        ...v3.toArray(),
        ...v4.toArray(),
      );
      this.normals.push(
        ...normal,
        ...normal,
        ...normal,
        ...normal,
        ...normal,
        ...normal,
      );
    };

    // Front face
    pushQuad(vertices[1], vertices[0], vertices[4], vertices[5]);
    // Back face
    pushQuad(vertices[2], vertices[3], vertices[7], vertices[6]);
    // Top face
    pushQuad(vertices[2], vertices[0], vertices[4], vertices[6]);
    // Bottom face
    pushQuad(vertices[1], vertices[3], vertices[7], vertices[5]);
    // Right face
    pushQuad(vertices[1], vertices[0], vertices[2], vertices[3]);
    // Left face
    pushQuad(vertices[4], vertices[5], vertices[7], vertices[6]);
  }

  addQuad(v1: Vector3, v2: Vector3, v3: Vector3, v4: Vector3) {
    const normal = new Vector3()
      .crossVectors(v2.clone().sub(v1), v3.clone().sub(v1))
      .normalize()
      .toArray();
    this.positions.push(
      ...v1.toArray(),
      ...v2.toArray(),
      ...v3.toArray(),
      ...v1.toArray(),
      ...v3.toArray(),
      ...v4.toArray(),
    );
    this.normals.push(
      ...normal,
      ...normal,
      ...normal,
      ...normal,
      ...normal,
      ...normal,
    );
  }
}
