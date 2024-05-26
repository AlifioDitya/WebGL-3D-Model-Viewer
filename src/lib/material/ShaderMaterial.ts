import { Shader } from "../shader/Shader";

type UniformType = Iterable<number>;
type UniformSet<T = UniformType> = { [key: string]: T };

export abstract class ShaderMaterial {
  static counter: number = 0;
  private id: number = ShaderMaterial.counter++;
  private shader: Shader;
  uniforms: UniformSet = {};
  constructor(_shader: Shader, _uniforms: any = {}) {
    this.shader = _shader;
    this.uniforms = _uniforms;
  }
  get _id() {
    return this.id;
  }
  get _shader() {
    return this.shader;
  }
  get _fragmentShader() {
    return this.shader.fragmentShader;
  }
  get _vertexShader() {
    return this.shader.vertexShader;
  }
  get _uniforms() {
    return this.uniforms;
  }

  set _uniforms(_uniforms: any) {
    this.uniforms = _uniforms;
  }

  copy(material: ShaderMaterial) {
    this.shader = material.shader;
    this.uniforms = material.uniforms;
    this.id = material.id;
    return this;
  }

  equals(material: ShaderMaterial) {
    return this.id === material.id;
  }
}
