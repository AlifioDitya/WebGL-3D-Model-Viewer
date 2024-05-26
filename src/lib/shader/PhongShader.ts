import { Shader } from "./Shader";

export class PhongShader extends Shader {
  // Vertex shader
  private static _vertexShader = `
    attribute vec4 a_position;
    attribute vec3 a_normal;
    attribute vec4 a_color;

    uniform mat4 u_worldTransform;
    uniform mat4 u_projectionMatrix;

    varying vec3 v_position;
    varying vec3 v_normal;

    void main() {
      gl_Position = u_projectionMatrix * u_worldTransform * a_position;

      v_position = (u_worldTransform * a_position).xyz;
      v_normal = mat3(u_worldTransform) * a_normal;
    }
  `;

  // Fragment shader
  private static _fragmentShader = `
    precision mediump float;

    uniform float u_shininess;
    uniform vec3 u_cameraPosition;
    uniform vec4 u_ambient;
    uniform vec4 u_diffuse;
    uniform vec4 u_specular;
    uniform vec3 u_lightPosition;
    uniform vec4 u_lightColor;
    uniform float u_lightIntensity;
    uniform int u_lightType;

    varying vec3 v_position;
    varying vec3 v_normal;

    float ambientStrength = 0.1;

    void main() {
      vec3 normalVec = normalize(v_normal);
      vec3 lightVec;
      
      if (u_lightType == 0) { // Directional
        lightVec = normalize(u_lightPosition);
      } else { // Point
        lightVec = normalize(u_lightPosition - v_position);
      }
      
      vec3 viewVec = normalize(u_cameraPosition - v_position);

      vec3 halfwayVec = normalize(lightVec + viewVec);

      vec3 ambientComp = ambientStrength * u_ambient.rgb * u_ambient.a;
      vec3 diffuseComp = u_diffuse.rgb * u_diffuse.a * max(dot(lightVec, normalVec), 0.0);
      vec3 specularComp = u_specular.rgb * u_specular.a * pow(max(dot(normalVec, halfwayVec), 0.0), u_shininess);

      vec3 color = ambientComp + diffuseComp + specularComp;
      color *= u_lightColor.rgb * u_lightColor.a * u_lightIntensity;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  get vertexShader(): string {
    return PhongShader._vertexShader;
  }

  get fragmentShader(): string {
    return PhongShader._fragmentShader;
  }
}
