import { BufferAttribute } from "../geometry/BufferAttribute";
import {
  TypeVertexAttrib,
  TypeVertexAttribFv,
  WebGLRenderingContextWithMethod,
} from "../enum/VetrexAttribFunc";
import {
  AttributeDataType,
  AttributeMapSetters,
  AttributeSetters,
  AttributeSingleDataType,
  ProgramInfo,
  UniformDataType,
  UniformMap,
  UniformMapSetters,
  UniformSetters,
} from "../types/ProgramInfo";
import { UniformSetterWebGLType } from "../enum/UniformSetterWebGLType";

class WebGLUtils {
  /**
   *
   * @param {WebGLRenderingContext} gl gl context
   * @param {string} source source shader
   * @param {GLenum} type shader type
   * @returns {WebGLShader}
   *
   */
  public static createShader(
    gl: WebGLRenderingContext,
    source: string,
    type: GLenum,
  ): WebGLShader {
    let shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS) as boolean;
    if (!success) {
      gl.deleteShader(shader);
      console.error(gl.getShaderInfoLog(shader));
      throw new Error("Failed to compile shader!");
    }

    return shader;
  }

  /**
   *
   * @param {WebGLRenderingContext} gl gl context
   * @param {WebGLShader} vert vertex shader
   * @param {WebGLShader} frag fragment
   * @returns {WebGLProgram}
   *
   */
  public static createProgram(
    gl: WebGLRenderingContext,
    vert: WebGLShader,
    frag: WebGLShader,
  ): WebGLProgram | null {
    let program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS) as boolean;
    if (!success) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return {
      program,
      uniformSetters: WebGLUtils.createUniformSetters(gl, program),
      attributeSetters: WebGLUtils.createAttributeSetters(gl, program),
    };
  }

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   * @returns {ProgramInfo}
   */
  public static createProgramInfo(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
  ): ProgramInfo {
    return {
      program,
      attributeSetters: WebGLUtils.createAttributeSetters(gl, program),
      uniformSetters: WebGLUtils.createUniformSetters(gl, program),
    } as ProgramInfo;
  }

  /**
   *
   * @param {WebGLRenderingContext} gl gl context
   * @param {WebGLProgram} program gl program
   *
   */
  public static createAttributeSetters(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
  ) {
    const createAttributeSetter = (info: WebGLActiveInfo): AttributeSetters => {
      const location = gl.getAttribLocation(program, info.name);

      return (...values: AttributeDataType) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const v = values[0];
        if (v instanceof BufferAttribute) {
          gl.bufferData(gl.ARRAY_BUFFER, v.data, gl.STATIC_DRAW);
          gl.enableVertexAttribArray(location);
          gl.vertexAttribPointer(
            location,
            v.size,
            v.dtype,
            v.normalize,
            v.stride,
            v.offset,
          );
        } else {
          gl.disableVertexAttribArray(location);
          const _gl = gl as WebGLRenderingContextWithMethod;
          if (v instanceof Float32Array) {
            const method = `vertexAttrib${v.length}fv`;
            if (typeof _gl[method] === "function") {
              (_gl[method] as TypeVertexAttribFv)(location, v);
            }
          } else {
            const method = `vertexAttrib${values.length}f`;
            if (typeof _gl[method] === "function") {
              (_gl[method] as TypeVertexAttrib)(location, ...values);
            }
          }
        }
      };
    };

    const attributeSetters: AttributeMapSetters = {};
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; i++) {
      const info = gl.getActiveAttrib(program, i);
      if (info) {
        attributeSetters[info.name] = createAttributeSetter(info);
      }
    }

    return attributeSetters;
  }

  /**
   *
   * @param {ProgramInfo} programInfo
   * @param {string} attributeName
   * @param {AttributeDataType} data
   *
   */
  public static setAttribute(
    programInfo: ProgramInfo,
    attributeName: string,
    ...data: AttributeDataType
  ): void {
    const setters = programInfo.attributeSetters;
    const prefixedName = `a_${attributeName}`;

    if (prefixedName in setters) {
      setters[prefixedName](...data);
    }
  }

  /**
   *
   * @param {ProgramInfo} programInfo
   * @param {[attributeName: string]:AttributeSingleDataType} attributes
   *
   */
  public static setAttributes(
    programInfo: ProgramInfo,
    attributes: { [attributeName: string]: AttributeSingleDataType },
  ): void {
    for (let attributeName in attributes) {
      WebGLUtils.setAttribute(
        programInfo,
        attributeName,
        attributes[attributeName],
      );
    }
  }

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   * @returns
   */
  public static createUniformSetters(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
  ) {
    const createUniformSetter = (info: WebGLActiveInfo): UniformSetters => {
      const location = gl.getUniformLocation(program, info.name);
      const type =
        UniformSetterWebGLType[
          info.type as keyof typeof UniformSetterWebGLType
        ];
      const isArray = info.size > 1 && info.name.substring(-3) === "[0]";
      return (value: any) => {
        if (value && typeof value === "object" && "toArray" in value) {
          value = (value as { toArray: () => any[] }).toArray();
        }
        const _gl = gl as WebGLRenderingContextWithMethod;
        if (isArray) {
          const method = `uniform${type}v`;
          _gl[method](location, value);
        } else {
          if (type.substring(0, 6) === "Matrix") {
            const method = `uniform${type}`;
            _gl[method](location, false, value);
          } else {
            if (Array.isArray(value)) {
              const method = `uniform${type}`;
              _gl[method](location, ...value);
            } else {
              const method = `uniform${type}`;
              _gl[method](location, value);
            }
          }
        }
      };
    };

    const uniformSetters: UniformMapSetters = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (!info) {
        break;
      }
      let name =
        info.name.substring(-3) === "[0]"
          ? info.name.substring(0, info.name.length - 3)
          : info.name;
      uniformSetters[name] = createUniformSetter(info);
    }
    return uniformSetters;
  }

  public static setUniform(
    programInfo: ProgramInfo,
    uniformName: string,
    ...data: UniformDataType
  ): void {
    const setters = programInfo.uniformSetters;
    const prefixedName = `u_${uniformName}`;

    const uniformValue = data[0] as any[];

    if (prefixedName in setters) {
      setters[prefixedName](uniformValue);
    }
  }
  public static setUniforms(
    programInfo: ProgramInfo,
    uniforms: UniformMap,
  ): void {
    for (let uniformName in uniforms) {
      WebGLUtils.setUniform(programInfo, uniformName, uniforms[uniformName]);
    }
  }
}

export default WebGLUtils;
