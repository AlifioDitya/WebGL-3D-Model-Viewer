import { BufferAttribute } from "../BufferAttribute";
import { BufferGeometry } from "../BufferGeometry";

export class CookieCutter extends BufferGeometry {
  constructor() {
    super();
    const squareCoord = 1;
    const triangleCoord = 0.6;
    const thickness = 0.2;
    const upperCoord = thickness / 2;
    const bottomCoord = -upperCoord;

    function getBottomVer(point: number[]) {
      return [point[0], point[1], bottomCoord];
    }

    let vertices: number[] = [];

    const a1Up = [squareCoord, squareCoord, upperCoord];
    const a2Up = [-squareCoord, squareCoord, upperCoord];
    const a3Up = [-squareCoord, -squareCoord, upperCoord];
    const a4Up = [squareCoord, -squareCoord, upperCoord];

    const b1Up = [-triangleCoord, -triangleCoord, upperCoord];
    const b2Up = [triangleCoord, -triangleCoord, upperCoord];
    const b3Up = [0, triangleCoord, upperCoord];

    const a1Bt = getBottomVer(a1Up);
    const a2Bt = getBottomVer(a2Up);
    const a3Bt = getBottomVer(a3Up);
    const a4Bt = getBottomVer(a4Up);

    const b1Bt = getBottomVer(b1Up);
    const b2Bt = getBottomVer(b2Up);
    const b3Bt = getBottomVer(b3Up);

    function makeTriangle(a: number[], b: number[], c: number[]) {
      return [...a, ...b, ...c];
    }

    function makeQuad(a: number[], b: number[], c: number[], d: number[]) {
      return [...a, ...b, ...c, ...a, ...c, ...d];
    }

    // inner squares (from triangle)
    vertices.push(...makeQuad(b3Up, b1Up, b1Bt, b3Bt));
    vertices.push(...makeQuad(b2Up, b3Up, b3Bt, b2Bt));
    vertices.push(...makeQuad(b1Up, b2Up, b2Bt, b1Bt));

    // outer squares
    vertices.push(...makeQuad(a2Up, a1Up, a1Bt, a2Bt));
    vertices.push(...makeQuad(a3Up, a2Up, a2Bt, a3Bt));
    vertices.push(...makeQuad(a4Up, a3Up, a3Bt, a4Bt));
    vertices.push(...makeQuad(a1Up, a4Up, a4Bt, a1Bt));

    // top face
    vertices.push(...makeTriangle(a1Up, b3Up, b2Up));
    vertices.push(...makeTriangle(a1Up, b2Up, a4Up));
    vertices.push(...makeQuad(b2Up, b1Up, a3Up, a4Up));
    vertices.push(...makeTriangle(b1Up, b3Up, a2Up));
    vertices.push(...makeTriangle(a3Up, b1Up, a2Up));
    vertices.push(...makeTriangle(b3Up, a1Up, a2Up));

    // bottom face
    vertices.push(...makeTriangle(a1Bt, b2Bt, b3Bt));
    vertices.push(...makeTriangle(a1Bt, a4Bt, b2Bt));
    vertices.push(...makeQuad(b1Bt, b2Bt, a4Bt, a3Bt));
    vertices.push(...makeTriangle(b1Bt, a2Bt, b3Bt));
    vertices.push(...makeTriangle(a3Bt, a2Bt, b1Bt));
    vertices.push(...makeTriangle(b3Bt, a2Bt, a1Bt));

    this.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(vertices), 3),
    );
    this.calculateNormals();
  }
}
