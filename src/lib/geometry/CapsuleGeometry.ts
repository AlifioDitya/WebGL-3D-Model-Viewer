import { BufferAttribute } from "./BufferAttribute";
import { BufferGeometry } from "./BufferGeometry";

export class CapsuleGeometry extends BufferGeometry {
  constructor(
    radius: number = 1,
    height: number = 2,
    radialSegments: number = 32,
    heightSegments: number = 16,
  ) {
    super();

    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const halfHeight = height / 2;

    // Top Hemisphere
    for (let y = 0; y <= heightSegments; y++) {
      const theta = (y * Math.PI) / (2 * heightSegments);
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let x = 0; x <= radialSegments; x++) {
        const phi = (x * 2 * Math.PI) / radialSegments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const nx = cosPhi * sinTheta;
        const ny = cosTheta;
        const nz = sinPhi * sinTheta;
        const vx = radius * nx;
        const vy = radius * ny + halfHeight;
        const vz = radius * nz;

        vertices.push(vx, vy, vz);
        normals.push(nx, ny, nz);
      }
    }

    // Cylinder
    for (let y = 0; y <= heightSegments; y++) {
      const v = y / heightSegments;

      for (let x = 0; x <= radialSegments; x++) {
        const phi = (x * 2 * Math.PI) / radialSegments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const nx = cosPhi;
        const ny = 0;
        const nz = sinPhi;
        const vx = radius * nx;
        const vy = v * height - halfHeight;
        const vz = radius * nz;

        vertices.push(vx, vy, vz);
        normals.push(nx, ny, nz);
      }
    }

    // Bottom Hemisphere
    for (let y = 0; y <= heightSegments; y++) {
      const theta = (y * Math.PI) / (2 * heightSegments) + Math.PI / 2;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let x = 0; x <= radialSegments; x++) {
        const phi = (x * 2 * Math.PI) / radialSegments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const nx = cosPhi * sinTheta;
        const ny = cosTheta;
        const nz = sinPhi * sinTheta;
        const vx = radius * nx;
        const vy = radius * ny - halfHeight;
        const vz = radius * nz;

        vertices.push(vx, vy, vz);
        normals.push(nx, ny, nz);
      }
    }

    // Indices
    const createIndices = (baseIndex: number, reverse: boolean = false) => {
      for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < radialSegments; x++) {
          const first = baseIndex + y * (radialSegments + 1) + x;
          const second = first + radialSegments + 1;

          if (reverse) {
            indices.push(second, first, first + 1);
            indices.push(second + 1, second, first + 1);
          } else {
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
          }
        }
      }
    };

    createIndices(0, true);
    createIndices((heightSegments + 1) * (radialSegments + 1));
    createIndices((heightSegments + 1) * (radialSegments + 1) * 2, true);

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
