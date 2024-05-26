import { BufferAttribute } from "../geometry/BufferAttribute";

export type AttributeSingleDataType = BufferAttribute | Float32Array | number[];
export type AttributeDataType = [AttributeSingleDataType] | number[];
export type AttributeSetters = (...v: AttributeDataType) => void;
export type AttributeMapSetters = { [key: string]: AttributeSetters };

export type UniformSingleDataType = Float32Array | number[];
export type UniformDataType = [UniformSingleDataType] | number[];
export type UniformSetters = (v: UniformDataType) => void;
export type UniformMapSetters = { [key: string]: UniformSetters };
export type UniformMap = { [uniformName: string]: UniformSingleDataType };

export type ProgramInfo = {
  program: WebGLProgram;
  uniformSetters: UniformMapSetters;
  attributeSetters: AttributeMapSetters;
};
