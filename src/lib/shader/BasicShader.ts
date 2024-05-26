import { Shader } from "./Shader";

export class BasicShader extends Shader {
  // Vertex shader
  private static _vertexShader = `
    attribute vec4 a_position;

    uniform mat4 u_worldTransform;
    uniform mat4 u_projectionMatrix;
    uniform vec4 u_color;

    varying vec4 v_color;

    void main() {
      gl_Position = u_projectionMatrix * u_worldTransform * a_position;

      v_color = u_color;
    }
  `;

  // Fragment shader
  private static _fragmentShader = `
    precision mediump float;
    varying vec4 v_color;

    void main() {
      gl_FragColor = v_color;
    }
  `;

  get vertexShader(): string {
    return BasicShader._vertexShader;
  }

  get fragmentShader(): string {
    return BasicShader._fragmentShader;
  }
}
