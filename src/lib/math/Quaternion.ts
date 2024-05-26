import { Matrix4 } from "./Matrix4";
import { Vector3 } from "./Vector3";

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(_x: number = 0, _y: number = 0, _z: number = 0, _w: number = 1) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.w = _w;
  }

  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  set(_x: number = 0, _y: number = 0, _z: number = 0, _w: number = 1) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.w = _w;
  }

  copy(quaternion: Quaternion) {
    this.x = quaternion.x;
    this.y = quaternion.y;
    this.z = quaternion.z;
    this.w = quaternion.w;
    return this;
  }

  multiply(quaternion: Quaternion): Quaternion {
    const qax = this.x,
      qay = this.y,
      qaz = this.z,
      qaw = this.w;
    const qbx = quaternion.x,
      qby = quaternion.y,
      qbz = quaternion.z,
      qbw = quaternion.w;

    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  }

  multiplyQuaternions(a: Quaternion, b: Quaternion): Quaternion {
    const qax = a.x,
      qay = a.y,
      qaz = a.z,
      qaw = a.w;
    const qbx = b.x,
      qby = b.y,
      qbz = b.z,
      qbw = b.w;

    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  }

  invert() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    return this;
  }

  toMatrix4(): Matrix4 {
    const x = this.x,
      y = this.y,
      z = this.z,
      w = this.w;

    return new Matrix4(
      1 - 2 * (y * y + z * z),
      2 * (x * y - w * z),
      2 * (x * z + w * y),
      0,
      2 * (x * y + w * z),
      1 - 2 * (x * x + z * z),
      2 * (y * z - w * x),
      0,
      2 * (x * z - w * y),
      2 * (y * z + w * x),
      1 - 2 * (x * x + y * y),
      0,
      0,
      0,
      0,
      1,
    );
  }

  toEulerAngles(): Vector3 {
    const x = this.x,
      y = this.y,
      z = this.z,
      w = this.w;

    const t0 = 2 * (w * x + y * z);
    const t1 = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(t0, t1);

    const t2 = 2 * (w * y - z * x);
    const pitch = Math.asin(Math.max(-1, Math.min(1, t2))); // Clamp value to avoid NaN

    const t3 = 2 * (w * z + x * y);
    const t4 = 1 - 2 * (y * y + z * z);
    const yaw = Math.atan2(t3, t4);

    return new Vector3(roll, pitch, yaw);
  }

  setFromEulerAngles(euler: Vector3): Quaternion {
    const c1 = Math.cos(euler.x / 2);
    const c2 = Math.cos(euler.y / 2);
    const c3 = Math.cos(euler.z / 2);
    const s1 = Math.sin(euler.x / 2);
    const s2 = Math.sin(euler.y / 2);
    const s3 = Math.sin(euler.z / 2);

    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 + s1 * s2 * c3;
    this.w = c1 * c2 * c3 - s1 * s2 * s3;

    return this;
  }

  toArray() {
    return [this.x, this.y, this.z, this.w];
  }

  setFromArray(array: number[]) {
    this.x = array[0];
    this.y = array[1];
    this.z = array[2];
    this.w = array[3];
    return this;
  }

  setFromRotationMatrix(m: Matrix4): Quaternion {
    const te = m.elements;
    const m11 = te[0],
      m12 = te[4],
      m13 = te[8];
    const m21 = te[1],
      m22 = te[5],
      m23 = te[9];
    const m31 = te[2],
      m32 = te[6],
      m33 = te[10];
    const trace = m11 + m22 + m33;

    let s, qw, qx, qy, qz;

    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1.0);
      qw = 0.25 / s;
      qx = (m32 - m23) * s;
      qy = (m13 - m31) * s;
      qz = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
      qw = (m32 - m23) / s;
      qx = 0.25 * s;
      qy = (m12 + m21) / s;
      qz = (m13 + m31) / s;
    } else if (m22 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
      qw = (m13 - m31) / s;
      qx = (m12 + m21) / s;
      qy = 0.25 * s;
      qz = (m23 + m32) / s;
    } else {
      s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
      qw = (m21 - m12) / s;
      qx = (m13 + m31) / s;
      qy = (m23 + m32) / s;
      qz = 0.25 * s;
    }

    this.set(qx, qy, qz, qw);
    return this;
  }

  static Euler(vector: Vector3) {
    const c1 = Math.cos(vector.x / 2);
    const c2 = Math.cos(vector.y / 2);
    const c3 = Math.cos(vector.z / 2);
    const s1 = Math.sin(vector.x / 2);
    const s2 = Math.sin(vector.y / 2);
    const s3 = Math.sin(vector.z / 2);

    const w = c1 * c2 * c3 - s1 * s2 * s3;
    const x = s1 * c2 * c3 + c1 * s2 * s3;
    const y = c1 * s2 * c3 - s1 * c2 * s3;
    const z = c1 * c2 * s3 + s1 * s2 * c3;

    return new Quaternion(x, y, z, w);
  }

  static identity() {
    return new Quaternion(0, 0, 0, 1);
  }
}
