import { Vector3 } from "../math/Vector3";
import { BufferAttribute } from "./BufferAttribute";

export class BufferGeometry {
  private _attributes: { [name: string]: BufferAttribute };
  private _indices?: BufferAttribute;

  constructor() {
    this._attributes = {};
  }

  copy(geometry: BufferGeometry) {
    this._indices = geometry.indices?.clone();
    this._attributes = {};
    for (const key in geometry.attributes) {
      this._attributes[key] = geometry.attributes[key].clone();
    }
    return this;
  }

  get attributes(): { [name: string]: BufferAttribute } {
    return this._attributes;
  }

  get indices(): BufferAttribute | undefined {
    return this._indices;
  }

  setIndices(indices: BufferAttribute) {
    this._indices = indices;
    return this;
  }

  removeIndices() {
    this._indices = undefined;
    return this;
  }

  setAttribute(name: string, attribute: BufferAttribute) {
    this._attributes[name] = attribute;
    return this;
  }

  getAttribute(name: string): BufferAttribute | undefined {
    return this._attributes[name];
  }

  deleteAttribute(name: string) {
    delete this._attributes[name];
    return this;
  }

  calculateNormals(forceNewAttribute = false) {
    const position = this.getAttribute("position");
    if (!position) {
      return;
    }
    let normal = this.getAttribute("normal");
    if (forceNewAttribute || !normal) {
      normal = new BufferAttribute(
        new Float32Array(position.length),
        position.size,
      );
    }
    // Calculate normals here.
    let a = new Vector3(0, 0, 0);
    let b = new Vector3(0, 0, 0);
    let c = new Vector3(0, 0, 0);
    for (let i = 0; i < position.count; i += 3) {
      a.fromBufferAttribute(position, i);
      b.fromBufferAttribute(position, i + 1);
      c.fromBufferAttribute(position, i + 2);
      c.sub(b);
      b.sub(a);
      b.cross(c);
      const n = b.normalize().toArray();
      normal.set(i, n);
      normal.set(i + 1, n);
      normal.set(i + 2, n);
    }

    this.setAttribute("normal", normal);
  }
}
