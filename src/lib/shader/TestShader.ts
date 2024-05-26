import { Shader } from "./Shader";

export class TestShader extends Shader {
  // Vertex shader
  private static _vertexShader = `
    // an attribute will receive data from a buffer
    attribute vec4 a_position;

    // all shaders have a main function
    void main() {
      // gl_Position is a special variable a vertex shader
      // is responsible for setting
      gl_Position = a_position;
    }
  `;

  // Fragment shader
  private static _fragmentShader = `
    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default
    precision mediump float;

    void main() {
      // gl_FragColor is a special variable a fragment shader
      // is responsible for setting
      gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
    }
  `;

  get vertexShader(): string {
    return TestShader._vertexShader;
  }

  get fragmentShader(): string {
    return TestShader._fragmentShader;
  }
}
