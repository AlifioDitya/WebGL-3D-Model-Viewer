import { AnimationPath, AnimationTRS } from "./Animation";
import { EaseFunc } from "./AnimationTweening";

function interpolateKeyframes(
  keyframe1: AnimationTRS,
  keyframe2: AnimationTRS,
  t: number,
): AnimationTRS {
  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  function lerpArray(
    arr1: [number, number, number],
    arr2: [number, number, number],
    t: number,
  ): [number, number, number] {
    return [
      lerp(arr1[0], arr2[0], t),
      lerp(arr1[1], arr2[1], t),
      lerp(arr1[2], arr2[2], t),
    ];
  }

  return {
    position:
      keyframe1.position && keyframe2.position
        ? lerpArray(keyframe1.position, keyframe2.position, t)
        : undefined,
    rotation:
      keyframe1.rotation && keyframe2.rotation
        ? lerpArray(keyframe1.rotation, keyframe2.rotation, t)
        : undefined,
    scale:
      keyframe1.scale && keyframe2.scale
        ? lerpArray(keyframe1.scale, keyframe2.scale, t)
        : undefined,
  };
}

function interpolateAnimationPaths(
  path1: AnimationPath,
  path2: AnimationPath,
  t: number,
): AnimationPath {
  const interpolatedPath: AnimationPath = {
    keyframe:
      path1.keyframe && path2.keyframe
        ? interpolateKeyframes(path1.keyframe, path2.keyframe, t)
        : undefined,
    children: {},
  };

  if (path1.children && path2.children) {
    for (const childName in path1.children) {
      if (path2.children[childName]) {
        if (!interpolatedPath.children) {
          interpolatedPath.children = {};
        }
        interpolatedPath.children[childName] = interpolateAnimationPaths(
          path1.children[childName],
          path2.children[childName],
          t,
        );
      }
    }
  }

  return interpolatedPath;
}
export function interpolateKeyFrame(
  oldKeyFrames: AnimationPath[],
  easeFunc: string,
  easeVariant: string,
  mul: number = 3,
) {
  const newKeyFrames: AnimationPath[] = [];
  for (let i = 0; i < oldKeyFrames.length - 1; i++) {
    const startKeyFrame = oldKeyFrames[i];
    const endKeyFrame = oldKeyFrames[i + 1];
    newKeyFrames.push(startKeyFrame);

    for (let j = 1; j <= mul; j++) {
      const t = j / (mul + 1);
      const eased = EaseFunc[easeFunc][easeVariant](t);
      // console.warn(`Eased ${EaseFunc[easeFunc][easeVariant]} ${eased}`);
      const interpolateKeyFrame = interpolateAnimationPaths(
        startKeyFrame,
        endKeyFrame,
        eased,
      );
      newKeyFrames.push(interpolateKeyFrame);
    }
  }
  newKeyFrames.push(oldKeyFrames[oldKeyFrames.length - 1]);

  return newKeyFrames;
}
