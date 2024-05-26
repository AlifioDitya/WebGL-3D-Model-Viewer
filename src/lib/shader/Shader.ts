export abstract class Shader {
  abstract get fragmentShader(): string;
  abstract get vertexShader(): string;
}
