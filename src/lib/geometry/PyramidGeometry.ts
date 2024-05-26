import { BufferAttribute } from "./BufferAttribute";
import { BufferGeometry } from "./BufferGeometry";

export class PyramidGeometry extends BufferGeometry {
  constructor() {
    super();

    const vertices = new Float32Array([
      // Base vertices
      -1,
      -1,
      -1, // v0
      1,
      -1,
      -1, // v1
      1,
      -1,
      1, // v2
      -1,
      -1,
      1, // v3
      // Top vertex
      0,
      1,
      0, // v4
    ]);

    const indices = new Uint16Array([
      // Sides (counter-clockwise order)
      0,
      4,
      1, // v0-v4-v1
      1,
      4,
      2, // v1-v4-v2
      2,
      4,
      3, // v2-v4-v3
      3,
      4,
      0, // v3-v4-v0
      // Base (counter-clockwise order)
      0,
      1,
      2, // v0-v1-v2
      2,
      3,
      0, // v2-v3-v0
    ]);

    // Calculate normals for the pyramid vertices
    const normals = new Float32Array(vertices.length);
    this.calculatePyramidNormals(vertices, indices, normals);

    const positionAttribute = new BufferAttribute(vertices, 3);
    const normalAttribute = new BufferAttribute(normals, 3);
    const indexAttribute = new BufferAttribute(indices, 1);

    this.setAttribute("position", positionAttribute);
    this.setAttribute("normal", normalAttribute);
    this.setIndices(indexAttribute);
  }

  private calculatePyramidNormals(
    vertices: Float32Array,
    indices: Uint16Array,
    normals: Float32Array,
  ) {
    const numFaces = indices.length / 3;

    for (let i = 0; i < numFaces; i++) {
      const i0 = indices[i * 3];
      const i1 = indices[i * 3 + 1];
      const i2 = indices[i * 3 + 2];

      const v0 = this.getVertex(vertices, i0);
      const v1 = this.getVertex(vertices, i1);
      const v2 = this.getVertex(vertices, i2);

      const normal = this.computeFaceNormal(v0, v1, v2);

      this.addNormal(normals, i0, normal);
      this.addNormal(normals, i1, normal);
      this.addNormal(normals, i2, normal);
    }

    // Normalize the normals
    for (let i = 0; i < normals.length; i += 3) {
      const normal = [normals[i], normals[i + 1], normals[i + 2]];
      this.normalize(normal);
      normals[i] = normal[0];
      normals[i + 1] = normal[1];
      normals[i + 2] = normal[2];
    }
  }

  private getVertex(vertices: Float32Array, index: number): number[] {
    return [
      vertices[index * 3],
      vertices[index * 3 + 1],
      vertices[index * 3 + 2],
    ];
  }

  private computeFaceNormal(
    v0: number[],
    v1: number[],
    v2: number[],
  ): number[] {
    const v0v1 = this.subtractVectors(v1, v0);
    const v0v2 = this.subtractVectors(v2, v0);
    const normal = this.crossProduct(v0v1, v0v2);
    this.normalize(normal);
    return normal;
  }

  private subtractVectors(a: number[], b: number[]): number[] {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  private crossProduct(a: number[], b: number[]): number[] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  private normalize(vector: number[]) {
    const length = Math.sqrt(
      vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2],
    );
    if (length > 0) {
      vector[0] /= length;
      vector[1] /= length;
      vector[2] /= length;
    }
  }

  private addNormal(normals: Float32Array, index: number, normal: number[]) {
    normals[index * 3] += normal[0];
    normals[index * 3 + 1] += normal[1];
    normals[index * 3 + 2] += normal[2];
  }
}
