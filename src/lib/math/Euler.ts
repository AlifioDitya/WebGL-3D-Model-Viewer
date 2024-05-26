export class Euler {
  x: number;
  y: number;
  z: number;
  order: string;
  constructor(_x: number, _y: number, _z: number, _order = "XYZ") {
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.order = _order;
  }
  copy(e: Euler) {
    this.x = e.x;
    this.y = e.y;
    this.z = e.z;
    this.order = e.order;
    return this;
  }

  equals(e: Euler) {
    return (
      this.x === e.x &&
      this.y === e.y &&
      this.z === e.z &&
      this.order === e.order
    );
  }

  set(x: number, y: number, z: number, order: string) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.order = order;
    return this;
  }
}
