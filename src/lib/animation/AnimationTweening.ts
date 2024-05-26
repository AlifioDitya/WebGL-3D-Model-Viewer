export type EaseType =
  | "linear"
  | "sine"
  | "cubic"
  | "elastic"
  | "bounce"
  | "quint"
  | "back";
export const easeType: EaseType[] = [
  "linear",
  "sine",
  "cubic",
  "elastic",
  "bounce",
  "quint",
  "back",
];

export type EaseVariant = "in" | "out" | "inout";
export const easeVariant: EaseVariant[] = ["in", "out", "inout"];

export const EaseFunc: {
  [key: string]: { [key: string]: (t: number) => number };
} = {
  linear: {
    in: (t: number) => t,
    out: (t: number) => t,
    inout: (t: number) => t,
  },
  sine: {
    in: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
    out: (t: number) => Math.sin((t * Math.PI) / 2),
    inout: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  },
  cubic: {
    in: (t: number) => t * t * t,
    out: (t: number) => 1 - Math.pow(1 - t, 3),
    inout: (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  },
  elastic: {
    in: (t: number) =>
      t === 0
        ? 0
        : t === 1
          ? 1
          : -Math.pow(2, 10 * t - 10) *
            Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
    out: (t: number) =>
      t === 0
        ? 0
        : t === 1
          ? 1
          : Math.pow(2, -10 * t) *
              Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) +
            1,
    inout: (t: number) =>
      t === 0
        ? 0
        : t === 1
          ? 1
          : t < 0.5
            ? -(
                Math.pow(2, 20 * t - 10) *
                Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))
              ) / 2
            : (Math.pow(2, -20 * t + 10) *
                Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) /
                2 +
              1,
  },
  bounce: {
    in: (t: number) => 1 - EaseFunc.bounce.out(1 - t),
    out: (t: number) => {
      const n1 = 7.5625,
        d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
    inout: (t: number) =>
      t < 0.5
        ? (1 - EaseFunc.bounce.out(1 - 2 * t)) / 2
        : (1 + EaseFunc.bounce.out(2 * t - 1)) / 2,
  },
  quint: {
    in: (t: number) => t * t * t * t * t,
    out: (t: number) => 1 - Math.pow(1 - t, 5),
    inout: (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  },
  back: {
    in: (t: number) => {
      const c1 = 1.70158,
        c3 = c1 + 1;
      return c3 * t * t * t - c1 * t * t;
    },
    out: (t: number) => {
      const c1 = 1.70158,
        c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    inout: (t: number) => {
      const c1 = 1.70158,
        c2 = c1 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
  },
};
