import { TestShader } from "../shader/TestShader";
import { ShaderMaterial } from "./ShaderMaterial";

export class TestMaterial extends ShaderMaterial {
  constructor() {
    super(new TestShader());
  }
}
