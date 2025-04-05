export interface Tween {
  object: any;
  property: string;
  propertyBeginValue: number;
  target: number;
  easing: (t: number) => number;
  time: number;
  change?: (t: Tween) => void;
  complete?: (t: Tween) => void;
  start: number;
}

const tweening: Tween[] = [];

export function tweenTo(
  object: any,
  property: string,
  target: number,
  time: number,
  easing: (t: number) => number,
  onchange: ((t: Tween) => void) | null,
  oncomplete: ((t: Tween) => void) | null
): Tween {
  const tween: Tween = {
    object,
    property,
    propertyBeginValue: object[property],
    target,
    easing,
    time,
    change: onchange || undefined,
    complete: oncomplete || undefined,
    start: Date.now(),
  };
  tweening.push(tween);
  return tween;
}

export function updateTweening(): void {
  const now = Date.now();
  const remove: Tween[] = [];

  tweening.forEach((t) => {
    const phase = Math.min(1, (now - t.start) / t.time);
    t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
    if (t.change) t.change(t);
    if (phase === 1) {
      t.object[t.property] = t.target;
      if (t.complete) t.complete(t);
      remove.push(t);
    }
  });
  remove.forEach((r) => {
    const index = tweening.indexOf(r);
    if (index > -1) {
      tweening.splice(index, 1);
    }
  });
}

export function lerp(a1: number, a2: number, t: number): number {
  return a1 * (1 - t) + a2 * t;
}

export function backout(amount: number): (t: number) => number {
  return (t: number): number => --t * t * ((amount + 1) * t + amount) + 1;
}
