import { Color } from "../light/Color";
import { BasicShader } from "../shader/BasicShader";
import { ShaderMaterial } from "./ShaderMaterial";

export class BasicMaterial extends ShaderMaterial {
  color: Color;

  constructor(_color: Color = Color.white) {
    super(new BasicShader(), {
      color: _color,
    });
    this.color = _color;
  }

  get _color() {
    return this.color;
  }
  set _color(_color: Color) {
    this.color = _color;
  }
}
