import { ObjectTreeNode } from "../object/ObjectTreeNode";
import { Color } from "./Color";

export enum LightType {
  Directional = "Directional",
  Point = "Point",
}

export class Light extends ObjectTreeNode {
  color: Color;
  intensity: number;
  type: LightType;

  constructor(
    color: Color = new Color(255, 255, 255),
    intensity: number = 1,
    type: LightType = LightType.Point,
  ) {
    super();
    if (type === LightType.Directional) {
      this.position.set(400, 400, 400); // Directional light is infinitely far away
    } else {
      this.position.set(3, 3, 3);
    }
    this.color = color;
    this.intensity = intensity;
    this.type = type;
  }

  set _color(_color: Color) {
    this.color = _color;
  }

  copy(light: Light, copyChildren: boolean = true) {
    super.copy(light, copyChildren);
    this.color.copy(light.color);
    this.intensity = light.intensity;
    this.type = light.type;
    return this;
  }

  clone(copyChildren: boolean = true) {
    const cloned = new Light().copy(this, copyChildren);
    cloned.uuid = this.uuid;
    return cloned;
  }
}
