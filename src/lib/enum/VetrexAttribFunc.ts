export type TypeVertexAttribFv = (index: number, v: Float32Array) => void | any;
export type TypeVertexAttrib = (index: number, ...values: any[]) => void | any;

export interface WebGLRenderingContextWithMethod extends WebGLRenderingContext {
  [key: string]: any;
}
