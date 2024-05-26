import { Camera } from "../camera/Camera";
import { ShaderType } from "../enum/ShaderType";
import { ShaderMaterial } from "../material/ShaderMaterial";
import { Mesh } from "../object/Mesh";
import { ObjectTreeNode } from "../object/ObjectTreeNode";
import { Light, LightType } from "../light/Light";
import { ProgramInfo, UniformMap } from "../types/ProgramInfo";
import WebGLUtils from "./WebGLUtils";
import { BufferAttribute } from "../geometry/BufferAttribute";
import { Vector3 } from "../math/Vector3";

class WebGLRenderer {
  public canvas: HTMLCanvasElement;
  public gl: WebGLRenderingContext;
  public createdShaders: { [cache: string]: ProgramInfo } = {};
  public currProgram: ProgramInfo | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas =
      canvas != null
        ? canvas
        : (document.getElementsByTagName("canvas")[0] as HTMLCanvasElement);
    this.gl = this.canvas.getContext("webgl") as WebGLRenderingContext;

    this.setViewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    this.adjustCanvas();

    const ro = new ResizeObserver(this.adjustCanvas.bind(this));
    ro.observe(this.canvas, { box: "content-box" });
  }

  private setViewport(x: number, y: number, width: number, height: number) {
    this.gl.viewport(x, y, width, height);
  }

  public adjustCanvas() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    if (this.canvas.height !== h || this.canvas.width !== w) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      this.canvas.width = w * devicePixelRatio;
      this.canvas.height = h * devicePixelRatio;
      this.setViewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private upsertMaterial(material: ShaderMaterial) {
    const programId = material._id;
    if (!(programId in this.createdShaders)) {
      this.createdShaders[programId] = WebGLUtils.createProgram(
        this.gl,
        WebGLUtils.createShader(
          this.gl,
          material._vertexShader,
          ShaderType.VERTEX,
        ),
        WebGLUtils.createShader(
          this.gl,
          material._fragmentShader,
          ShaderType.FRAGMENT,
        ),
      ) as ProgramInfo;
    }
    return this.createdShaders[programId];
  }

  private setProgramInfo(programInfo: ProgramInfo) {
    if (this.currProgram !== programInfo) {
      this.gl.useProgram(programInfo.program);
      this.currProgram = programInfo;
    }
  }

  private bindIndicesBuffer(indices: BufferAttribute) {
    const buffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      indices.data,
      this.gl.STATIC_DRAW,
    );
  }

  private renderNode(object: ObjectTreeNode, uniforms: UniformMap) {
    if (!object || !object.enable) {
      return;
    }

    object.computeWorldTransform(false, false);
    if (object instanceof Mesh) {
      const attribs = object.geometry.attributes;
      const indices = object.geometry.indices;
      const material = object.material;
      const progInfo = this.upsertMaterial(material);

      this.setProgramInfo(progInfo);

      if (!this.currProgram) {
        throw new Error("No program set");
      }

      WebGLUtils.setAttributes(this.currProgram, attribs);
      WebGLUtils.setUniforms(this.currProgram, {
        ...object.material.uniforms,
        ...uniforms,
        worldTransform: object.worldTransform.elements,
      });

      if (indices) {
        this.bindIndicesBuffer(indices);
        this.gl.drawElements(
          this.gl.TRIANGLES,
          indices.count,
          indices.data instanceof Uint16Array
            ? this.gl.UNSIGNED_SHORT
            : this.gl.UNSIGNED_BYTE,
          0,
        );
      } else {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, attribs.position.count);
      }
    }

    if (object.children.length === 0) {
      return;
    }

    for (let key in object.children) {
      this.renderNode(object.children[key], uniforms);
    }
  }

  public render(node: ObjectTreeNode, camera: Camera) {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    if (!camera || !node) {
      return;
    }

    // Find the first light in the scene
    const light = node.children.find((obj) => obj instanceof Light) as Light;

    if (!light) {
      throw new Error("No light found in the scene");
    }

    const lightPosition =
      light.type === LightType.Directional
        ? new Vector3(400, 400, 400).normalize() // Arbitrary far away direction
        : light.worldPosition;

    const uniforms: UniformMap = {
      cameraPosition: camera.worldPosition.toArray(),
      projectionMatrix: camera.viewProjectionMatrix.elements,
      lightPosition: lightPosition.toArray(),
      lightColor: light.color.toArray(),
      lightIntensity: [light.intensity],
      lightType: light.type === LightType.Directional ? [0] : [1],
    };

    this.renderNode(node, uniforms);
  }
}

export default WebGLRenderer;
