type TypedArray =
  | Float32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array;

export class BufferAttribute {
  private _data: TypedArray;
  private _size: number;
  private _dtype: number;
  private _normalize = false;
  private _stride = 0;
  private _offset = 0;

  /**
   * Creates an instance of BufferAttribute.
   * @param {TypedArray} data Typed array data.
   * @param {number} size Size of each element in the buffer.
   * @param {object} options Options for attribute.
   * @memberof BufferAttribute
   */
  constructor(
    data: TypedArray,
    size: number,
    options: {
      dtype?: number;
      normalize?: boolean;
      stride?: number;
      offset?: number;
    } = {},
  ) {
    this._data = data;
    this._size = size;
    this._dtype = options.dtype || WebGLRenderingContext.FLOAT;
    this._normalize = options.normalize || false;
    this._stride = options.stride || 0;
    this._offset = options.offset || 0;
  }

  get data() {
    return this._data;
  }
  get size() {
    return this._size;
  }
  get dtype() {
    return this._dtype;
  }
  get normalize() {
    return this._normalize;
  }
  get stride() {
    return this._stride;
  }
  get offset() {
    return this._offset;
  }

  // Public set accessor to private properties.
  set data(data: TypedArray) {
    this._data = data;
  }
  set size(size: number) {
    this._size = size;
  }
  set dtype(dtype: number) {
    this._dtype = dtype;
  }
  set normalize(normalize: boolean) {
    this._normalize = normalize;
  }
  set stride(stride: number) {
    this._stride = stride;
  }
  set offset(offset: number) {
    this._offset = offset;
  }

  /**
   * Jumlah elemen dalam buffer (elemen = data.length / size).
   */
  get count() {
    return this._data.length / this._size;
  }

  /**
   * Panjang dari buffer (data.length = elemen * size).
   */
  get length() {
    return this._data.length;
  }

  set(index: number, data: number[]) {
    // Set elemen[index] dengan data (data.length == this._size)
    // Jangan lupa untuk menyesuaikan dengan offset dan stride.
    for (let i = 0; i < this._size; i++) {
      this._data[index * (this._stride + this._size) + i + this._offset] =
        data[i];
    }
  }

  get(index: number, size?: number) {
    index *= this._size;
    if (!size) {
      size = this._size;
    }
    const data: number[] = [];
    // Ambil elemen[index] ke data (data.length == size)
    // Jangan lupa untuk menyesuaikan dengan offset dan stride.
    for (let i = 0; i < size; i++) {
      data.push(this._data[index + i]);
    }
    return data;
  }

  clone() {
    return new BufferAttribute(this._data.slice(), this._size, {
      dtype: this._dtype,
      normalize: this._normalize,
      stride: this._stride,
      offset: this._offset,
    });
  }
}
