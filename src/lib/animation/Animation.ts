export type AnimationTRS = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

export type AnimationPath = {
  keyframe?: AnimationTRS;
  children?: {
    [childName: string]: AnimationPath;
  };
};

export type AnimationClip = {
  name: string;
  frames: AnimationPath[];
};

export const my_keyframes: AnimationPath[] = [
  // 0
  {
    keyframe: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    children: {
      rarm: {
        keyframe: {
          position: [-1, 0.5, 0],
          rotation: [0, 0, 0],
        },
      },
      larm: {
        keyframe: {
          position: [1, 0.5, 0],
          rotation: [0, 0, 0],
        },
      },
      rleg: {
        keyframe: {
          position: [0.4, -0.5, 0],
          rotation: [0, 0, 0],
        },
      },
      lleg: {
        keyframe: {
          position: [-0.4, -0.5, 0],
          rotation: [0, 0, 0],
        },
      },
    },
  },
  // 1
  {
    keyframe: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    children: {
      rarm: {
        keyframe: {
          position: [-1, 0.4, 0],
          rotation: [0, 0, 0.2],
        },
      },
      larm: {
        keyframe: {
          position: [1, 0.4, 0],
          rotation: [0, 0, -0.2],
        },
      },
      rleg: {
        keyframe: {
          position: [0.4, -0.6, 0],
          rotation: [0, 0, 0.2],
        },
      },
      lleg: {
        keyframe: {
          position: [-0.4, -0.6, 0],
          rotation: [0, 0, -0.2],
        },
      },
    },
  },
  // 2
  {
    keyframe: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    children: {
      rarm: {
        keyframe: {
          position: [-1, 0.3, 0],
          rotation: [0, 0, 0.4],
        },
      },
      larm: {
        keyframe: {
          position: [1, 0.3, 0],
          rotation: [0, 0, -0.4],
        },
      },
      rleg: {
        keyframe: {
          position: [0.4, -0.5, 0],
          rotation: [0, 0, 0.4],
        },
      },
      lleg: {
        keyframe: {
          position: [-0.4, -0.5, 0],
          rotation: [0, 0, -0.4],
        },
      },
    },
  },
  // 3
  {
    keyframe: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    children: {
      rarm: {
        keyframe: {
          position: [-1, 0.4, 0],
          rotation: [0, 0, 0.2],
        },
      },
      larm: {
        keyframe: {
          position: [1, 0.4, 0],
          rotation: [0, 0, -0.2],
        },
      },
      rleg: {
        keyframe: {
          position: [0.4, -0.6, 0],
          rotation: [0, 0, 0.2],
        },
      },
      lleg: {
        keyframe: {
          position: [-0.4, -0.6, 0],
          rotation: [0, 0, -0.2],
        },
      },
    },
  },
  // 4
  {
    keyframe: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    children: {
      rarm: {
        keyframe: {
          position: [-1, 0.5, 0],
          rotation: [0, 0, 0],
        },
      },
      larm: {
        keyframe: {
          position: [1, 0.5, 0],
          rotation: [0, 0, 0],
        },
      },
      rleg: {
        keyframe: {
          position: [0.4, -0.5, 0],
          rotation: [0, 0, 0],
        },
      },
      lleg: {
        keyframe: {
          position: [-0.4, -0.5, 0],
          rotation: [0, 0, 0],
        },
      },
    },
  },
];
