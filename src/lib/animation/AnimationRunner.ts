import { Vector3 } from "../math/Vector3";
import { ObjectTreeNode } from "../object/ObjectTreeNode";
import { AnimationClip, AnimationPath, my_keyframes } from "./Animation";
import { interpolateKeyFrame } from "./AnimationInterpolation";

export default class AnimationRunner {
  isPlaying: boolean = false;
  isReverse: boolean = false;
  fps: number = 30;
  // currentAnimationFile: string;
  public root: ObjectTreeNode;
  private currentFrame: number = 0;
  private deltaFrame: number = 0;
  private initAnimation?: AnimationClip;
  private currentAnimation?: AnimationClip;

  constructor(root: ObjectTreeNode, { fps = 60 } = {}) {
    // this.currentAnimation = this.load(animFile);
    this.fps = fps;
    this.root = root;
  }

  get CurrentFrame() {
    return this.currentFrame;
  }

  public setCurrentFrame(frame: number) {
    this.currentFrame = frame;
  }

  get length() {
    return this.currentAnimation!.frames.length;
  }

  private get frame() {
    return this.currentAnimation!.frames[this.currentFrame];
  }

  update(deltaSecond: number) {
    if (this.isPlaying) {
      this.deltaFrame += deltaSecond * this.fps;
      if (this.deltaFrame >= 1) {
        // 1 frame
        // this.currentFrame =
        // (this.currentFrame + Math.floor(this.deltaFrame)) % this.length;
        const frameIncrement = Math.floor(this.deltaFrame);
        this.currentFrame = this.isReverse
          ? (this.currentFrame - frameIncrement + this.length) % this.length
          : (this.currentFrame + frameIncrement) % this.length;
        this.deltaFrame %= 1;
        this.updateSceneGraph();
      }
    }
  }

  public start() {
    this.currentFrame = 0;
    this.updateSceneGraph();
  }

  public next() {
    this.currentFrame = (this.currentFrame + 1) % this.length;
    this.updateSceneGraph();
  }

  public prev() {
    this.currentFrame =
      this.currentFrame - 1 < 0 ? this.length - 1 : this.currentFrame - 1;
    this.updateSceneGraph();
  }

  public end() {
    this.currentFrame = this.length - 1;
    this.updateSceneGraph();
  }

  public updateSceneGraph() {
    // Update scene graph with current frame
    const frame = this.frame;
    // Use root as the parent and traverse according to the frame
    this.traverse(this.root, frame);
  }

  private traverse(node: ObjectTreeNode, path: AnimationPath) {
    if (path.keyframe) {
      if (path.keyframe.position) {
        node.position = new Vector3().setFromArray(path.keyframe.position);
      }
      if (path.keyframe.rotation) {
        node.rotation = new Vector3().setFromArray(path.keyframe.rotation);
      }
      if (path.keyframe.scale) {
        node.scale = new Vector3().setFromArray(path.keyframe.scale);
      }
    }
    if (path.children) {
      for (const childName in path.children) {
        const childPath = path.children[childName];
        const childNode = node.children.find(
          (child) => child.name === childName,
        );
        if (childNode) {
          this.traverse(childNode, childPath);
        }
      }
    }
  }

  public setInterpolation(ease: string, variant: string) {
    this.unsetInterpolation();
    if (this.currentAnimation && this.initAnimation) {
      this.currentAnimation.frames = interpolateKeyFrame(
        this.initAnimation.frames,
        ease,
        variant,
        5,
      );
    } else {
      console.error("Current Animation is Null");
    }
  }

  public unsetInterpolation() {
    if (this.currentAnimation && this.initAnimation) {
      this.currentAnimation.frames = Array.from(this.initAnimation.frames);
    }
  }

  public isAnimationEnable() {
    return this.currentAnimation !== undefined;
  }

  public setAnimationClip(animation: AnimationClip) {
    this.initAnimation = { ...animation };
    this.currentAnimation = { ...animation };
  }

  public dummyAnimClip() {
    const testAnim: AnimationClip = {
      name: "Anim",
      frames: interpolateKeyFrame(my_keyframes, "bounce", "in", 7),
    };
    return testAnim;
  }
}
