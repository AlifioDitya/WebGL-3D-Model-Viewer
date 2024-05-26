import { Vector3 } from "./Vector3";

export class Matrix4 {
  elements: number[];
  constructor(
    n11: number = 1,
    n12: number = 0,
    n13: number = 0,
    n14: number = 0,
    n21: number = 0,
    n22: number = 1,
    n23: number = 0,
    n24: number = 0,
    n31: number = 0,
    n32: number = 0,
    n33: number = 1,
    n34: number = 0,
    n41: number = 0,
    n42: number = 0,
    n43: number = 0,
    n44: number = 1,
  ) {
    this.elements = [
      n11,
      n21,
      n31,
      n41,
      n12,
      n22,
      n32,
      n42,
      n13,
      n23,
      n33,
      n43,
      n14,
      n24,
      n34,
      n44,
    ];
  }

  set(
    n11: number,
    n12: number,
    n13: number,
    n14: number,
    n21: number,
    n22: number,
    n23: number,
    n24: number,
    n31: number,
    n32: number,
    n33: number,
    n34: number,
    n41: number,
    n42: number,
    n43: number,
    n44: number,
  ) {
    const temp = this.elements;
    temp[0] = n11;
    temp[1] = n21;
    temp[2] = n31;
    temp[3] = n41;
    temp[4] = n12;
    temp[5] = n22;
    temp[6] = n32;
    temp[7] = n42;
    temp[8] = n13;
    temp[9] = n23;
    temp[10] = n33;
    temp[11] = n43;
    temp[12] = n14;
    temp[13] = n24;
    temp[14] = n34;
    temp[15] = n44;
    return this;
  }

  static identity() {
    return new Matrix4();
  }

  copy(m: Matrix4) {
    const mTemp = m.elements;
    const temp = this.elements;
    for (let i = 0; i < 16; i++) {
      temp[i] = mTemp[i];
    }
    return this;
  }

  copyPosition(m: Matrix4) {
    const temp = this.elements;
    const toCopy = m.elements;
    temp[12] = toCopy[12];
    temp[13] = toCopy[13];
    temp[14] = toCopy[14];
    return this;
  }

  determinant() {
    const temp = this.elements;
    const n11 = temp[0],
      n12 = temp[4],
      n13 = temp[8],
      n14 = temp[12];
    const n21 = temp[1],
      n22 = temp[5],
      n23 = temp[9],
      n24 = temp[13];
    const n31 = temp[2],
      n32 = temp[6],
      n33 = temp[10],
      n34 = temp[14];
    const n41 = temp[3],
      n42 = temp[7],
      n43 = temp[11],
      n44 = temp[15];

    return (
      n41 *
        (+n14 * n23 * n32 -
          n13 * n24 * n32 -
          n14 * n22 * n33 +
          n12 * n24 * n33 +
          n13 * n22 * n34 -
          n12 * n23 * n34) +
      n42 *
        (+n11 * n23 * n34 -
          n11 * n24 * n33 +
          n14 * n21 * n33 -
          n13 * n21 * n34 +
          n13 * n24 * n31 -
          n14 * n23 * n31) +
      n43 *
        (+n11 * n24 * n32 -
          n11 * n22 * n34 -
          n14 * n21 * n32 +
          n12 * n21 * n34 +
          n14 * n22 * n31 -
          n12 * n24 * n31) +
      n44 *
        (-n13 * n22 * n31 -
          n11 * n23 * n32 +
          n11 * n22 * n33 +
          n13 * n21 * n32 -
          n12 * n21 * n33 +
          n12 * n23 * n31)
    );
  }

  equals(m: Matrix4) {
    let res = true;
    for (let i = 0; i < 16; i++) {
      if (this.elements[i] !== m.elements[i]) {
        res = false;
        return res;
      }
    }
    return res;
  }

  transpose() {
    const temp = this.elements;
    let tmp: number;

    tmp = temp[1];
    temp[1] = temp[4];
    temp[4] = tmp;
    tmp = temp[2];
    temp[2] = temp[8];
    temp[8] = tmp;
    tmp = temp[3];
    temp[3] = temp[12];
    temp[12] = tmp;
    tmp = temp[6];
    temp[6] = temp[9];
    temp[9] = tmp;
    tmp = temp[7];
    temp[7] = temp[13];
    temp[13] = tmp;
    tmp = temp[11];
    temp[11] = temp[14];
    temp[14] = tmp;

    return this;
  }

  invert() {
    const te = this.elements,
      n11 = te[0],
      n21 = te[1],
      n31 = te[2],
      n41 = te[3],
      n12 = te[4],
      n22 = te[5],
      n32 = te[6],
      n42 = te[7],
      n13 = te[8],
      n23 = te[9],
      n33 = te[10],
      n43 = te[11],
      n14 = te[12],
      n24 = te[13],
      n34 = te[14],
      n44 = te[15],
      t11 =
        n23 * n34 * n42 -
        n24 * n33 * n42 +
        n24 * n32 * n43 -
        n22 * n34 * n43 -
        n23 * n32 * n44 +
        n22 * n33 * n44,
      t12 =
        n14 * n33 * n42 -
        n13 * n34 * n42 -
        n14 * n32 * n43 +
        n12 * n34 * n43 +
        n13 * n32 * n44 -
        n12 * n33 * n44,
      t13 =
        n13 * n24 * n42 -
        n14 * n23 * n42 +
        n14 * n22 * n43 -
        n12 * n24 * n43 -
        n13 * n22 * n44 +
        n12 * n23 * n44,
      t14 =
        n14 * n23 * n32 -
        n13 * n24 * n32 -
        n14 * n22 * n33 +
        n12 * n24 * n33 +
        n13 * n22 * n34 -
        n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) {
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    const detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] =
      (n24 * n33 * n41 -
        n23 * n34 * n41 -
        n24 * n31 * n43 +
        n21 * n34 * n43 +
        n23 * n31 * n44 -
        n21 * n33 * n44) *
      detInv;
    te[2] =
      (n22 * n34 * n41 -
        n24 * n32 * n41 +
        n24 * n31 * n42 -
        n21 * n34 * n42 -
        n22 * n31 * n44 +
        n21 * n32 * n44) *
      detInv;
    te[3] =
      (n23 * n32 * n41 -
        n22 * n33 * n41 -
        n23 * n31 * n42 +
        n21 * n33 * n42 +
        n22 * n31 * n43 -
        n21 * n32 * n43) *
      detInv;

    te[4] = t12 * detInv;
    te[5] =
      (n13 * n34 * n41 -
        n14 * n33 * n41 +
        n14 * n31 * n43 -
        n11 * n34 * n43 -
        n13 * n31 * n44 +
        n11 * n33 * n44) *
      detInv;
    te[6] =
      (n14 * n32 * n41 -
        n12 * n34 * n41 -
        n14 * n31 * n42 +
        n11 * n34 * n42 +
        n12 * n31 * n44 -
        n11 * n32 * n44) *
      detInv;
    te[7] =
      (n12 * n33 * n41 -
        n13 * n32 * n41 +
        n13 * n31 * n42 -
        n11 * n33 * n42 -
        n12 * n31 * n43 +
        n11 * n32 * n43) *
      detInv;

    te[8] = t13 * detInv;
    te[9] =
      (n14 * n23 * n41 -
        n13 * n24 * n41 -
        n14 * n21 * n43 +
        n11 * n24 * n43 +
        n13 * n21 * n44 -
        n11 * n23 * n44) *
      detInv;
    te[10] =
      (n12 * n24 * n41 -
        n14 * n22 * n41 +
        n14 * n21 * n42 -
        n11 * n24 * n42 -
        n12 * n21 * n44 +
        n11 * n22 * n44) *
      detInv;
    te[11] =
      (n13 * n22 * n41 -
        n12 * n23 * n41 -
        n13 * n21 * n42 +
        n11 * n23 * n42 +
        n12 * n21 * n43 -
        n11 * n22 * n43) *
      detInv;

    te[12] = t14 * detInv;
    te[13] =
      (n13 * n24 * n31 -
        n14 * n23 * n31 +
        n14 * n21 * n33 -
        n11 * n24 * n33 -
        n13 * n21 * n34 +
        n11 * n23 * n34) *
      detInv;
    te[14] =
      (n14 * n22 * n31 -
        n12 * n24 * n31 -
        n14 * n21 * n32 +
        n11 * n24 * n32 +
        n12 * n21 * n34 -
        n11 * n22 * n34) *
      detInv;
    te[15] =
      (n12 * n23 * n31 -
        n13 * n22 * n31 +
        n13 * n21 * n32 -
        n11 * n23 * n32 -
        n12 * n21 * n33 +
        n11 * n22 * n33) *
      detInv;

    return this;
  }

  lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
    const z = new Vector3().subVectors(eye, target).normalize();
    const x = new Vector3().crossVectors(up, z).normalize();
    const y = new Vector3().crossVectors(z, x).normalize();

    this.set(
      x.x,
      y.x,
      z.x,
      eye.x,
      x.y,
      y.y,
      z.y,
      eye.y,
      x.z,
      y.z,
      z.z,
      eye.z,
      0,
      0,
      0,
      1,
    );

    return this;
  }

  static orthographic(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
  ) {
    const rl = right - left;
    const tb = top - bottom;
    const nf = near - far;

    return new Matrix4(
      2 / rl,
      0,
      0,
      -(left + right) / rl,
      0,
      2 / tb,
      0,
      -(bottom + top) / tb,
      0,
      0,
      2 / nf,
      (near + far) / nf,
      0,
      0,
      0,
      1,
    );
  }

  static perspective(fovy: number, aspect: number, near: number, far: number) {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return new Matrix4(
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) * nf,
      2 * far * near * nf,
      0,
      0,
      -1,
      0,
    );
  }

  static oblique(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
    theta: number,
    ratio: number,
  ) {
    const shearMat = new Matrix4(
      1,
      0,
      ratio / Math.tan(theta),
      0,
      0,
      1,
      -ratio / Math.tan(theta),
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    );

    return Matrix4.multiplyMatrices(
      Matrix4.orthographic(left, right, top, bottom, near, far),
      shearMat,
    );
  }

  static makeRotationFromEuler(euler: Vector3) {
    const xAxis = new Vector3(1, 0, 0);
    const yAxis = new Vector3(0, 1, 0);
    const zAxis = new Vector3(0, 0, 1);

    const pitchMatrix = new Matrix4().makeRotationAxis(xAxis, euler.x);
    const yawMatrix = new Matrix4().makeRotationAxis(yAxis, euler.y);
    const rollMatrix = new Matrix4().makeRotationAxis(zAxis, euler.z);

    // Combine the rotations: roll, then pitch, then yaw
    return Matrix4.multiplyMatrices(yawMatrix, pitchMatrix, rollMatrix);
  }

  makeRotationAxis(axis: Vector3, thetaRad: number) {
    const c = Math.cos(thetaRad);
    const s = Math.sin(thetaRad);
    const t = 1 - c;
    const x = axis.x,
      y = axis.y,
      z = axis.z;
    const tx = t * x,
      ty = t * y;

    this.set(
      tx * x + c,
      tx * y - s * z,
      tx * z + s * y,
      0,
      tx * y + s * z,
      ty * y + c,
      ty * z - s * x,
      0,
      tx * z - s * y,
      ty * z + s * x,
      t * z * z + c,
      0,
      0,
      0,
      0,
      1,
    );

    return this;
  }

  makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) {
    this.set(
      xAxis.x,
      yAxis.x,
      zAxis.x,
      0,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      0,
      xAxis.z,
      yAxis.z,
      zAxis.z,
      0,
      0,
      0,
      0,
      1,
    );
    return this;
  }

  static makeRotationX(thetaRad: number) {
    const cosTheta = Math.cos(thetaRad);
    const sinTheta = Math.sin(thetaRad);
    return new Matrix4(
      1,
      0,
      0,
      0,
      0,
      cosTheta,
      -sinTheta,
      0,
      0,
      sinTheta,
      cosTheta,
      0,
      0,
      0,
      0,
      1,
    );
  }

  static makeRotationY(thetaRad: number) {
    const cosTheta = Math.cos(thetaRad);
    const sinTheta = Math.sin(thetaRad);
    return new Matrix4(
      cosTheta,
      0,
      sinTheta,
      0,
      0,
      1,
      0,
      0,
      -sinTheta,
      0,
      cosTheta,
      0,
      0,
      0,
      0,
      1,
    );
  }

  static makeRotationZ(thetaRad: number) {
    const cosTheta = Math.cos(thetaRad);
    const sinTheta = Math.sin(thetaRad);
    return new Matrix4(
      cosTheta,
      -sinTheta,
      0,
      0,
      sinTheta,
      cosTheta,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    );
  }

  static makeScale(x: number, y: number, z: number) {
    return new Matrix4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
  }

  static makeShear(
    xy: number,
    xz: number,
    yx: number,
    yz: number,
    zx: number,
    zy: number,
  ) {
    return new Matrix4(1, yx, zx, 0, xy, 1, zy, 0, xz, yz, 1, 0, 0, 0, 0, 1);
  }

  static makeTranslation(x: number | Vector3, y?: number, z?: number) {
    if (typeof x === "object" && x instanceof Vector3) {
      return new Matrix4(1, 0, 0, x.x, 0, 1, 0, x.y, 0, 0, 1, x.z, 0, 0, 0, 1);
    } else if (
      typeof x === "number" &&
      typeof y === "number" &&
      typeof z === "number"
    ) {
      return new Matrix4(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
    } else {
      throw new Error("Invalid type");
    }
  }

  private static _multiplyMatrices(a: Matrix4, b: Matrix4) {
    const ae = a.elements;
    const be = b.elements;
    const temp = new Matrix4();
    for (let i = 0; i < 4; i++) {
      const a0 = ae[i],
        a1 = ae[i + 4],
        a2 = ae[i + 8],
        a3 = ae[i + 12];
      for (let j = 0; j < 4; j++) {
        const bj = j * 4;
        temp.elements[i + bj] =
          a0 * be[bj] + a1 * be[bj + 1] + a2 * be[bj + 2] + a3 * be[bj + 3];
      }
    }
    return temp;
  }

  static multiplyMatrices(...matrices: Matrix4[]) {
    const result = matrices.reduce((accumulator, currentValue) =>
      Matrix4._multiplyMatrices(accumulator, currentValue),
    );

    return result;
  }

  multiply(m: Matrix4) {
    return Matrix4.multiplyMatrices(this, m);
  }

  multiplyScalar(s: number) {
    const temp = this.elements;
    for (let i = 0; i < 16; i++) {
      temp[i] *= s;
    }
    return this;
  }

  scale(v: Vector3) {
    const temp = this.elements;
    const x = v.x,
      y = v.y,
      z = v.z;
    for (let i = 0; i < 4; i++) {
      temp[i] *= x;
      temp[i + 4] *= y;
      temp[i + 8] *= z;
    }
  }

  setPosition(x: number | Vector3, y?: number, z?: number) {
    const temp = this.elements;
    if (typeof x === "object" && x instanceof Vector3) {
      temp[12] = x.x;
      temp[13] = x.y;
      temp[14] = x.z;
    } else if (
      typeof x === "number" &&
      typeof y === "number" &&
      typeof z === "number"
    ) {
      temp[12] = x;
      temp[13] = y;
      temp[14] = z;
    } else {
      throw new Error("Invalid type!");
    }
  }

  extractPosition() {
    const temp = this.elements;
    return new Vector3(temp[12], temp[13], temp[14]);
  }

  to2DArray() {
    const temp = this.elements;
    return [
      [temp[0], temp[4], temp[8], temp[12]],
      [temp[1], temp[5], temp[9], temp[13]],
      [temp[2], temp[6], temp[10], temp[14]],
      [temp[3], temp[7], temp[11], temp[15]],
    ];
  }

  toString() {
    return `[
      ${this.elements[0]}, ${this.elements[4]}, ${this.elements[8]}, ${this.elements[12]},
      ${this.elements[1]}, ${this.elements[5]}, ${this.elements[9]}, ${this.elements[13]},
      ${this.elements[2]}, ${this.elements[6]}, ${this.elements[10]}, ${this.elements[14]},
      ${this.elements[3]}, ${this.elements[7]}, ${this.elements[11]}, ${this.elements[15]},
    ]`;
  }
}
