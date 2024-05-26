import { BufferAttribute } from "./BufferAttribute";
import { BufferGeometry } from "./BufferGeometry";
import { Vector3 } from "../math/Vector3";

export class RingGeometry extends BufferGeometry {
  innerRadius: number;
  outerRadius: number;
  ringThickness: number;
  numSegments: number;

  constructor(
    innerRadius: number = 0.5,
    outerRadius: number = 1.0,
    ringThickness: number = 0.2,
    numSegments: number = 100,
  ) {
    super();
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.ringThickness = ringThickness;
    this.numSegments = numSegments;

    const positions = [];
    const normals = [];

    for (let i = 0; i < this.numSegments; i++) {
      const angle1 = (i / this.numSegments) * 2 * Math.PI;
      const angle2 = ((i + 1) / this.numSegments) * 2 * Math.PI;

      const xInner1 = this.innerRadius * Math.cos(angle1);
      const yInner1 = this.innerRadius * Math.sin(angle1);
      const xOuter1 = this.outerRadius * Math.cos(angle1);
      const yOuter1 = this.outerRadius * Math.sin(angle1);

      const xInner2 = this.innerRadius * Math.cos(angle2);
      const yInner2 = this.innerRadius * Math.sin(angle2);
      const xOuter2 = this.outerRadius * Math.cos(angle2);
      const yOuter2 = this.outerRadius * Math.sin(angle2);

      const normalTop = [0, 0, 1];
      const normalBottom = [0, 0, -1];

      // Top face (counter-clockwise winding order)
      positions.push(xInner1, yInner1, this.ringThickness / 2);
      positions.push(xOuter1, yOuter1, this.ringThickness / 2);
      positions.push(xInner2, yInner2, this.ringThickness / 2);
      normals.push(...normalTop, ...normalTop, ...normalTop);

      positions.push(xInner2, yInner2, this.ringThickness / 2);
      positions.push(xOuter1, yOuter1, this.ringThickness / 2);
      positions.push(xOuter2, yOuter2, this.ringThickness / 2);
      normals.push(...normalTop, ...normalTop, ...normalTop);

      // Bottom face (clockwise winding order)
      positions.push(xInner1, yInner1, -this.ringThickness / 2);
      positions.push(xInner2, yInner2, -this.ringThickness / 2);
      positions.push(xOuter1, yOuter1, -this.ringThickness / 2);
      normals.push(...normalBottom, ...normalBottom, ...normalBottom);

      positions.push(xInner2, yInner2, -this.ringThickness / 2);
      positions.push(xOuter2, yOuter2, -this.ringThickness / 2);
      positions.push(xOuter1, yOuter1, -this.ringThickness / 2);
      normals.push(...normalBottom, ...normalBottom, ...normalBottom);

      // Outer face (counter-clockwise winding order)
      const normalOuter1 = new Vector3(xOuter1, yOuter1, 0)
        .normalize()
        .toArray();
      const normalOuter2 = new Vector3(xOuter2, yOuter2, 0)
        .normalize()
        .toArray();
      positions.push(xOuter1, yOuter1, this.ringThickness / 2);
      positions.push(xOuter1, yOuter1, -this.ringThickness / 2);
      positions.push(xOuter2, yOuter2, this.ringThickness / 2);
      normals.push(...normalOuter1, ...normalOuter1, ...normalOuter2);

      positions.push(xOuter2, yOuter2, this.ringThickness / 2);
      positions.push(xOuter1, yOuter1, -this.ringThickness / 2);
      positions.push(xOuter2, yOuter2, -this.ringThickness / 2);
      normals.push(...normalOuter2, ...normalOuter1, ...normalOuter2);

      // Inner face (clockwise winding order)
      const normalInner1 = new Vector3(xInner1, yInner1, 0)
        .normalize()
        .toArray();
      const normalInner2 = new Vector3(xInner2, yInner2, 0)
        .normalize()
        .toArray();
      positions.push(xInner1, yInner1, this.ringThickness / 2);
      positions.push(xInner2, yInner2, this.ringThickness / 2);
      positions.push(xInner1, yInner1, -this.ringThickness / 2);
      normals.push(...normalInner1, ...normalInner2, ...normalInner1);

      positions.push(xInner2, yInner2, this.ringThickness / 2);
      positions.push(xInner2, yInner2, -this.ringThickness / 2);
      positions.push(xInner1, yInner1, -this.ringThickness / 2);
      normals.push(...normalInner2, ...normalInner2, ...normalInner1);
    }

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
