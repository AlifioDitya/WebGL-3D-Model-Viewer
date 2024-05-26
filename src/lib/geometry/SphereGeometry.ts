import { BufferAttribute } from "./BufferAttribute";
import { BufferGeometry } from "./BufferGeometry";

export class SphereGeometry extends BufferGeometry {
  constructor(
    radius: number = 1,
    widthSegments: number = 50,
    heightSegments: number = 50,
  ) {
    super();

    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    for (let y = 0; y <= heightSegments; y++) {
      const theta = (y * Math.PI) / heightSegments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let x = 0; x <= widthSegments; x++) {
        const phi = (x * 2 * Math.PI) / widthSegments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const nx = cosPhi * sinTheta;
        const ny = cosTheta;
        const nz = sinPhi * sinTheta;
        const vx = radius * nx;
        const vy = radius * ny;
        const vz = radius * nz;

        vertices.push(vx, vy, vz);
        normals.push(-nx, -ny, -nz);
      }
    }

    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < widthSegments; x++) {
        const first = y * (widthSegments + 1) + x;
        const second = first + widthSegments + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    const positionAttribute = new BufferAttribute(
      new Float32Array(vertices),
      3,
    );
    const normalAttribute = new BufferAttribute(new Float32Array(normals), 3);
    const indexAttribute = new BufferAttribute(new Uint16Array(indices), 1);

    this.setAttribute("position", positionAttribute);
    this.setAttribute("normal", normalAttribute);
    this.setIndices(indexAttribute);
  }
}
