import { BufferAttribute } from "../geometry/BufferAttribute";
import { Quaternion } from "./Quaternion";

export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(_x: number = 0, _y: number = 0, _z: number = 0) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
  }

  set(_x: number, _y: number, _z: number) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(val: Vector3 | number) {
    if (typeof val === "object" && val instanceof Vector3) {
      return this.set(this.x + val.x, this.y + val.y, this.z + val.z);
    } else if (typeof val === "number") {
      return this.set(this.x + val, this.y + val, this.z + val);
    } else {
      throw new Error("Invalid type");
    }
  }

  sub(val: Vector3 | number) {
    if (typeof val === "object" && val instanceof Vector3) {
      return this.set(this.x - val.x, this.y - val.y, this.z - val.z);
    } else if (typeof val === "number") {
      return this.set(this.x - val, this.y - val, this.z - val);
    } else {
      throw new Error("Invalid type");
    }
  }

  multiply(val: Vector3 | number) {
    if (typeof val === "object" && val instanceof Vector3) {
      return this.set(this.x * val.x, this.y * val.y, this.z * val.z);
    } else if (typeof val === "number") {
      return this.set(this.x * val, this.y * val, this.z * val);
    } else {
      throw new Error("Invalid type!");
    }
  }

  divide(val: Vector3 | number) {
    if (typeof val === "object" && val instanceof Vector3) {
      return this.set(this.x / val.x, this.y / val.y, this.z / val.z);
    } else if (typeof val === "number") {
      return this.set(this.x / val, this.y / val, this.z / val);
    } else {
      throw new Error("Invalid type!");
    }
  }

  dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3) {
    return this.set(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }

  distanceTo(v: Vector3) {
    const x = this.x - v.x;
    const y = this.y - v.y;
    const z = this.z - v.z;
    return Math.sqrt(x * x + y * y + z * z);
  }

  equals(v: Vector3) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }

  lengthSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length() {
    return Math.sqrt(this.lengthSquared());
  }

  angleTo(v: Vector3) {
    const lengthThis = this.length();
    const lengthV = v.length();
    return Math.acos(this.dot(v) / (lengthThis * lengthV));
  }

  normalize() {
    return this.divide(this.length() || 1);
  }

  projectOnVector(v: Vector3): Vector3 {
    const lengthSqV = v.lengthSquared();
    if (lengthSqV === 0) {
      return this.set(0, 0, 0);
    }
    const s = v.dot(this) / lengthSqV;
    return this.copy(v).multiply(s);
  }

  projectOnPlane(planeNormal: Vector3) {
    // planeNormal - A vector representing a plane normal.
    // Projects this vector onto a plane by subtracting this vector projected onto the plane's normal from this vector.
    const temp: Vector3 = this.clone().projectOnPlane(planeNormal);
    return this.sub(temp);
  }

  reflect(normal: Vector3) {
    //     normal - the normal to the reflecting plane
    // Reflect this vector off of plane orthogonal to normal. Normal is assumed to have unit length.
    let temp = this.clone();
    return this.sub(temp.multiply(2 * this.dot(normal)));
  }

  setLength(l: number) {
    return this.normalize().multiply(l);
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  fromBufferAttribute(attribute: BufferAttribute, index: number) {
    const val = attribute.get(index, attribute.size);
    if (val.length === 1) {
      return this.set(val[0], 0, 0);
    } else if (val.length === 2) {
      return this.set(val[0], val[1], 0);
    } else if (val.length === 3) {
      return this.set(val[0], val[1], val[2]);
    }
  }

  // Used in JSON load
  setFromArray(array: number[], offset: number = 0) {
    return this.set(array[offset], array[offset + 1], array[offset + 2]);
  }

  // Cross vector product
  crossVectors(a: Vector3, b: Vector3) {
    const x = a.y * b.z - a.z * b.y;
    const y = a.z * b.x - a.x * b.z;
    const z = a.x * b.y - a.y * b.x;
    return this.set(x, y, z);
  }

  // Subtract vectors
  subVectors(a: Vector3, b: Vector3) {
    return this.set(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  // Look at target
  lookAt(target: Vector3): Quaternion {
    const forward = new Vector3().subVectors(this, target).normalize();
    const up = new Vector3(0, 1, 0);
    const right = new Vector3().crossVectors(up, forward).normalize();
    up.crossVectors(forward, right);

    const m00 = right.x,
      m01 = right.y,
      m02 = right.z;
    const m10 = up.x,
      m11 = up.y,
      m12 = up.z;
    const m20 = forward.x,
      m21 = forward.y,
      m22 = forward.z;

    const trace = m00 + m11 + m22;
    let s = 0;
    let qw, qx, qy, qz;

    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1.0);
      qw = 0.25 / s;
      qx = (m21 - m12) * s;
      qy = (m02 - m20) * s;
      qz = (m10 - m01) * s;
    } else if (m00 > m11 && m00 > m22) {
      s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);
      qw = (m21 - m12) / s;
      qx = 0.25 * s;
      qy = (m01 + m10) / s;
      qz = (m02 + m20) / s;
    } else if (m11 > m22) {
      s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);
      qw = (m02 - m20) / s;
      qx = (m01 + m10) / s;
      qy = 0.25 * s;
      qz = (m12 + m21) / s;
    } else {
      s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);
      qw = (m10 - m01) / s;
      qx = (m02 + m20) / s;
      qy = (m12 + m21) / s;
      qz = 0.25 * s;
    }

    return new Quaternion(qx, qy, qz, qw);
  }

  // Apply a quaternion rotation to the vector
  applyQuaternion(q: Quaternion) {
    const x = this.x,
      y = this.y,
      z = this.z;
    const qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w;

    // Calculate quaternion * vector
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // Calculate result * inverse quaternion
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return this;
  }

  setFromQuaternion(q: Quaternion) {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
  }

  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }
}
