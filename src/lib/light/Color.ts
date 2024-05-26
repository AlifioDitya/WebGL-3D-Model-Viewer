export class Color {
  r: number;
  g: number;
  b: number;
  a: number = 1;
  constructor(r: number, g: number, b: number, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  copy(color: Color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
    return this;
  }

  set(_r: number, _g: number, _b: number, _a: number = 1) {
    this.r = _r;
    this.g = _g;
    this.b = _b;
    this.a = _a;
  }

  // Static colors
  public static white: Color = new Color(255, 255, 255, 1);
  public static black: Color = new Color(0, 0, 0, 1);
  public static red: Color = new Color(255, 0, 0, 1);
  public static green: Color = new Color(0, 255, 0, 1);
  public static blue: Color = new Color(0, 0, 255, 1);
  public static transparent: Color = new Color(0, 0, 0, 0);

  private static randomColorBit() {
    const rand = Math.floor(Math.random() * 256);

    if (rand === 256) {
      return 255;
    }
    return rand;
  }

  static genRandomColor() {
    return new Color(
      Color.randomColorBit(),
      Color.randomColorBit(),
      Color.randomColorBit(),
      Math.random() * 0.8 + 0.4 >= 1 ? 1 : Math.random() * 0.8 + 0.4,
    );
  }

  toArray() {
    return [this.r / 255, this.g / 255, this.b / 255, this.a];
  }
}
