import { type Component } from "react";
import { type LayoutRectangle } from "react-native";
import {
  measure,
  runOnUI,
  withSpring,
  type AnimatableValue,
  type AnimatedRef,
  type AnimationCallback,
  type MeasuredDimensions,
  type SharedValue,
  type WithSpringConfig,
} from "react-native-reanimated";
import type { SharedPoint } from "../hooks";
import type { AnyData } from "../types";

export const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  damping: 10, // Defines how the spring’s motion should be damped due to the forces of friction. Default 10.
  mass: 1, // The mass of the object attached to the end of the spring. Default 1.
  stiffness: 100, // The spring stiffness coefficient. Default 100.
  overshootClamping: false, // Indicates whether the spring should be clamped and not bounce. Default false.
  restSpeedThreshold: 0.001, // The speed at which the spring should be considered at rest in pixels per second. Default 0.001.
  restDisplacementThreshold: 0.2, // The threshold of displacement from rest below which the spring should be considered at rest. Default 0.001.
};
export const FAST_SPRING_CONFIG: WithSpringConfig = {
  damping: 20, // Defines how the spring’s motion should be damped due to the forces of friction. Default 10.
  mass: 0.5, // The mass of the object attached to the end of the spring. Default 1.
  stiffness: 100, // The spring stiffness coefficient. Default 100.
  overshootClamping: false, // Indicates whether the spring should be clamped and not bounce. Default false.
  restSpeedThreshold: 0.2, // The speed at which the spring should be considered at rest in pixels per second. Default 0.001.
  restDisplacementThreshold: 0.2, // The threshold of displacement from rest below which the spring should be considered at rest. Default 0.001.
};
export const DEFAULT_SPRING_CONFIG_3: WithSpringConfig = {
  damping: 20, // Defines how the spring’s motion should be damped due to the forces of friction. Default 10.
  mass: 0.5, // The mass of the object attached to the end of the spring. Default 1.
  stiffness: 100, // The spring stiffness coefficient. Default 100.
  overshootClamping: false, // Indicates whether the spring should be clamped and not bounce. Default false.
  restSpeedThreshold: 0.01, // The speed at which the spring should be considered at rest in pixels per second. Default 0.001.
  restDisplacementThreshold: 0.2, // The threshold of displacement from rest below which the spring should be considered at rest. Default 0.001.
};
export const SLOW_SPRING_CONFIG: WithSpringConfig = {
  damping: 20, // Defines how the spring’s motion should be damped due to the forces of friction. Default 10.
  mass: 1, // The mass of the object attached to the end of the spring. Default 1.
  stiffness: 10, // The spring stiffness coefficient. Default 100.
  overshootClamping: false, // Indicates whether the spring should be clamped and not bounce. Default false.
  restSpeedThreshold: 0.01, // The speed at which the spring should be considered at rest in pixels per second. Default 0.001.
  restDisplacementThreshold: 0.2, // The threshold of displacement from rest below which the spring should be considered at rest. Default 0.001.
};

/**
 * @summary Waits for n-callbacks
 * @worklet
 */
export const waitForAll = <T extends unknown[]>(callback: (...args: T) => void, count = 2) => {
  "worklet";
  const status = new Array(count).fill(false);
  const result = new Array(count).fill(undefined);
  return status.map((_v, index) => {
    return (...args: unknown[]) => {
      status[index] = true;
      result[index] = args;
      if (status.every(Boolean)) {
        callback(...(result as T));
      }
    };
  });
};

type AnimationCallbackParams = Parameters<AnimationCallback>;

export type AnimationPointCallback = (
  finished: [boolean | undefined, boolean | undefined],
  current: [AnimatableValue | undefined, AnimatableValue | undefined],
) => void;

export const withDefaultSpring: typeof withSpring = (toValue, userConfig: WithSpringConfig = {}, callback) => {
  "worklet";
  const config: WithSpringConfig = Object.assign({}, SLOW_SPRING_CONFIG, userConfig);
  return withSpring(toValue, config, callback);
};

/**
 * @summary Easily animate a `SharePoint`
 * @worklet
 */
export const animatePointWithSpring = (
  point: SharedPoint,
  [toValueX, toValueY]: [number, number],
  [configX, configY]: [WithSpringConfig | undefined, WithSpringConfig | undefined] = [undefined, undefined],
  callback?: AnimationPointCallback,
) => {
  "worklet";
  const [waitForX, waitForY] = waitForAll<[AnimationCallbackParams, AnimationCallbackParams]>(
    ([finishedX, currentX], [finishedY, currentY]) => {
      if (!callback) {
        return;
      }
      callback([finishedX, finishedY], [currentX, currentY]);
    },
  );
  point.x.value = withSpring(toValueX, configX, waitForX);
  point.y.value = withSpring(toValueY, configY, waitForY);
};

export const moveArrayIndex = <T>(input: T[], from: number, to: number) => {
  "worklet";
  const output = input.slice();
  output.splice(to, 0, output.splice(from, 1)[0]);
  return output;
};

/*
damping: 10
mass: 1
stiffness: 100
overshootClamping: false
restDisplacementThreshold: 0.01
restSpeedThreshold: 2
*/

export const stringifySharedPoint = ({ x, y }: SharedPoint) => {
  "worklet";
  return `{"x": ${Math.floor(x.value)}, "y": ${Math.floor(y.value)}}`;
};

export const stringifyLayout = ({ x, y, width, height }: LayoutRectangle) => {
  "worklet";
  return `{"x": ${Math.floor(x)}, "y": ${Math.floor(y)}, "width": ${Math.floor(width)}, "height": ${Math.floor(
    height,
  )}}`;
};

export const floorLayout = ({ x, y, width, height }: LayoutRectangle) => {
  "worklet";
  return {
    x: Math.floor(x),
    y: Math.floor(y),
    width: Math.floor(width),
    height: Math.floor(height),
  };
};

/**
 * @summary Checks if a value is a `Reanimated` shared value
 * @param {object} value - The value to check
 * @returns {boolean} Whether the value is a `Reanimated` shared value
 */
export const isReanimatedSharedValue = (value: unknown): value is SharedValue<AnyData> =>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  typeof value === "object" && (value as { _isReanimatedSharedValue: boolean })?._isReanimatedSharedValue;

export const getLayoutFromMeasurement = (measurement: MeasuredDimensions): LayoutRectangle => {
  "worklet";
  return {
    x: measurement.pageX,
    y: measurement.pageY,
    width: measurement.width,
    height: measurement.height,
  };
};

export const updateLayoutValue = (
  layout: SharedValue<LayoutRectangle>,
  animatedRef: AnimatedRef<Component>,
) => {
  "worklet";
  const measurement = measure(animatedRef);
  if (measurement === null) {
    return;
  }
  layout.value = getLayoutFromMeasurement(measurement);
};

export const waitForLayout = (fn: (lastTime: number, time: number) => void) => {
  "worklet";
  let lastTime = 0;

  function loop() {
    requestAnimationFrame((time) => {
      if (lastTime > 0) {
        fn(lastTime, time);
        return;
      }
      lastTime = time;
      requestAnimationFrame(loop);
    });
  }

  loop();
};

/*

function loopAnimationFrame(fn: (lastTime: number, time: number) => void) {
  let lastTime = 0;

  function loop() {
    requestAnimationFrame((time) => {
      if (lastTime > 0) {
        fn(lastTime, time);
      }
      lastTime = time;
      requestAnimationFrame(loop);
    });
  }

  loop();
}

*/
