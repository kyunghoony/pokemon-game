export const animationTokens = {
  duration: {
    instant: 90,
    short: 180,
    medium: 320,
    long: 520,
    suspense: 700,
  },
  easing: {
    attack: 'cubic-bezier(.18,.8,.18,1)',
    impact: 'cubic-bezier(.22,.96,.33,.99)',
    float: 'cubic-bezier(.45,.05,.55,.95)',
  },
};

export type AnimationTokenKey = keyof typeof animationTokens.duration;
