/// <reference types="node" />

declare const global: any;

const hasHirezNodeTimer =
  false &&
  typeof process === 'object' &&
  process &&
  process.hrtime &&
  typeof process.hrtime === 'function';

// the default timer
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultPerformanceNow = (started?: number) => Date.now();

// try to find the browser-based performance timer
const nativePerformance =
  // @ts-ignore
  typeof window !== 'undefined' &&
  // @ts-ignore
  window &&
  // @ts-ignore
  (window.performance ||
    // @ts-ignore
    (window as any).msPerformance ||
    // @ts-ignore
    (window as any).webkitPerformance);

// the function we're trying to assign
let performanceNow = defaultPerformanceNow;

// accepts an already started time and returns the number of milliseconds
let delta = (started: number) => performanceNow() - started;

if (hasHirezNodeTimer) {
  performanceNow = process.hrtime as any;
  // @ts-ignore
  delta = started => performanceNow(started)[1] / 1000000;
} else if (global.nativePerformanceNow) {
  // react native 47
  performanceNow = global.nativePerformanceNow;
} else if (nativePerformance) {
  // browsers + safely check for react native < 47
  performanceNow = () => nativePerformance.now && nativePerformance.now();
}

/**
 * Starts a lame, low-res timer.  Returns a function which when invoked,
 * gives you the number of milliseconds since passing.  ish.
 */
export const start = () => {
  //  record the start time
  const started = performanceNow();
  return () => delta(started);
};
