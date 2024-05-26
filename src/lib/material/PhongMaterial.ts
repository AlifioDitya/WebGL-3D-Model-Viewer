import { Color } from "../light/Color";
import { Vector3 } from "../math/Vector3";
import { PhongShader } from "../shader/PhongShader";
import { ShaderMaterial } from "./ShaderMaterial";

export class PhongMaterial extends ShaderMaterial {
  ambient: Color;
  diffuse: Color;
  specular: Color;
  shininess: number;
  lightCoordinates: Vector3;

  constructor(
    _ambient: Color = Color.white,
    _diffuse: Color = Color.white,
    _specular: Color = Color.white,
    _shininess: number = 30,
    _lightCoordinates: Vector3 = new Vector3(3, 3, 3),
  ) {
    super(new PhongShader(), {
      ambient: _ambient,
      diffuse: _diffuse,
      specular: _specular,
      shininess: _shininess,
      lightCoordinates: _lightCoordinates,
    });
    this.ambient = _ambient;
    this.diffuse = _diffuse;
    this.specular = _specular;
    this.shininess = _shininess;
    this.lightCoordinates = _lightCoordinates;
  }
  get _ambient() {
    return this.ambient;
  }
  get _diffuse() {
    return this.diffuse;
  }
  get _specular() {
    return this.specular;
  }
  get _shininess() {
    return this.shininess;
  }
  get _lightCoordinates() {
    return this.lightCoordinates;
  }

  set _ambient(_color: Color) {
    this.ambient = _color;
  }

  set _diffuse(_color: Color) {
    this.diffuse = _color;
  }

  set _specular(_color: Color) {
    this.specular = _color;
  }
  set _shininess(_shininess: number) {
    this.shininess = _shininess;
  }
  set _lightCoordinates(_lightCoordinates: Vector3) {
    this.lightCoordinates = _lightCoordinates;
  }
}
