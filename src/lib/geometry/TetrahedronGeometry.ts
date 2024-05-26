import { BufferAttribute } from "./BufferAttribute";
import { BufferGeometry } from "./BufferGeometry";
import { Vector3 } from "../math/Vector3";

export class TetrahedronGeometry extends BufferGeometry {
  edgeLength: number;
  edgeThickness: number;

  constructor(edgeLength: number = 3.0, edgeThickness: number = 0.2) {
    super();
    this.edgeLength = edgeLength;
    this.edgeThickness = edgeThickness;

    const positions: any = [];
    const normals: any = [];

    const a = new Vector3(1, 1, 1).multiply(this.edgeLength / Math.sqrt(3));
    const b = new Vector3(-1, -1, 1).multiply(this.edgeLength / Math.sqrt(3));
    const c = new Vector3(-1, 1, -1).multiply(this.edgeLength / Math.sqrt(3));
    const d = new Vector3(1, -1, -1).multiply(this.edgeLength / Math.sqrt(3));

    const createEdge = (start: Vector3, end: Vector3) => {
      const dir = end.clone().sub(start).normalize();
      const up = new Vector3(0, 1, 0);
      if (Math.abs(dir.y) > 0.9) {
        up.set(1, 0, 0);
      }
      const right = new Vector3()
        .crossVectors(dir, up)
        .normalize()
        .multiply(this.edgeThickness / 2);
      const forward = new Vector3()
        .crossVectors(right, dir)
        .normalize()
        .multiply(this.edgeThickness / 2);

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
        positions.push(
          ...v1.toArray(),
          ...v2.toArray(),
          ...v3.toArray(),
          ...v1.toArray(),
          ...v3.toArray(),
          ...v4.toArray(),
        );
        const normal = new Vector3()
          .crossVectors(v2.clone().sub(v1), v3.clone().sub(v1))
          .normalize()
          .toArray();
        normals.push(
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
      pushQuad(vertices[1], vertices[0], vertices[3], vertices[2]);
      // Left face
      pushQuad(vertices[5], vertices[4], vertices[6], vertices[7]);
    };

    // Create the edges of the tetrahedron
    createEdge(a, b);
    createEdge(a, c);
    createEdge(a, d);
    createEdge(b, c);
    createEdge(b, d);
    createEdge(c, d);

    this.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(positions), 3),
    );
    this.setAttribute(
      "normal",
      new BufferAttribute(new Float32Array(normals), 3),
    );
  }
}
