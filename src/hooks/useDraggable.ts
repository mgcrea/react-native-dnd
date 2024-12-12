/* eslint-disable @typescript-eslint/no-dynamic-delete */

import { useLayoutEffect, useMemo, useRef } from "react";
import { LayoutRectangle, View, ViewProps } from "react-native";
import { runOnUI, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { DraggableState, useDndContext } from "../DndContext";
import { useEvent, useLatestSharedValue } from "../hooks";
import { Data, UniqueIdentifier } from "../types";
import { isReanimatedSharedValue } from "../utils";
import { useSharedPoint } from "./useSharedPoint";

export type DraggableConstraints = {
  activationDelay: number;
  activationTolerance: number;
};

export type UseDraggableOptions = Partial<DraggableConstraints> & {
  id: UniqueIdentifier;
  data?: Data;
  disabled?: boolean;
};

/**
 * useDraggable is a custom hook that provides functionality for making a component draggable within a drag and drop context.
 *
 * @function
 * @example
 * const { offset, setNodeRef, activeId, setNodeLayout, draggableState } = useDraggable({ id: 'draggable-1' });
 *
 * @param {object} options - The options that define the behavior of the draggable component.
 * @param {string} options.id - A unique identifier for the draggable component.
 * @param {object} [options.data={}] - Optional data associated with the draggable component.
 * @param {boolean} [options.disabled=false] - A flag that indicates whether the draggable component is disabled.
 * @param {number} [options.activationDelay=0] - A number representing the duration, in milliseconds, that this draggable item needs to be held for before allowing a drag to start.
 * @param {number} [options.activationTolerance=Infinity] - A number representing the distance, in points, of motion that is tolerated before the drag operation is aborted.
 */
export const useDraggable = ({
  id,
  data = {},
  disabled = false,
  activationDelay = 0,
  activationTolerance = Infinity,
}: UseDraggableOptions) => {
  const {
    draggableLayouts,
    draggableOffsets,
    draggableRestingOffsets,
    draggableOptions,
    draggableStates,
    draggableActiveId,
    draggablePendingId,
    containerRef,
    panGestureState,
  } = useDndContext();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ref = useRef<View>(null!);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sharedData = isReanimatedSharedValue(data) ? data : useLatestSharedValue(data);

  const layout = useSharedValue<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const offset = useSharedPoint(0, 0);
  const restingOffset = useSharedPoint(0, 0);
  const state = useSharedValue<DraggableState>("resting");
  // Register early to allow proper referencing in useDraggableStyle
  draggableStates.value[id] = state;

  useLayoutEffect(() => {
    const runLayoutEffect = () => {
      "worklet";
      requestAnimationFrame(() => {
        draggableLayouts.value[id] = layout;
        draggableOffsets.value[id] = offset;
        draggableRestingOffsets.value[id] = restingOffset;
        draggableStates.value[id] = state;
        draggableOptions.value[id] = {
          id,
          data: sharedData,
          disabled,
          activationDelay,
          activationTolerance,
        };
      });
    };

    runOnUI(runLayoutEffect)();

    return () => {
      const cleanupLayoutEffect = () => {
        "worklet";
        requestAnimationFrame(() => {
          delete draggableLayouts.value[id];
          delete draggableOffsets.value[id];
          delete draggableRestingOffsets.value[id];
          delete draggableOptions.value[id];
          delete draggableStates.value[id];
        });
      };
      runOnUI(cleanupLayoutEffect)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onLayout: ViewProps["onLayout"] = useEvent((_event) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!ref.current || !containerRef.current) {
      return;
    }
    ref.current.measureLayout(containerRef.current, (x, y, width, height) => {
      layout.value = { x, y, width, height };
    });
  });

  // Track disabled prop changes
  useAnimatedReaction(
    () => disabled,
    (next, prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (next !== prev && draggableOptions.value[id]) {
        draggableOptions.value[id].disabled = disabled;
      }
    },
    [disabled],
  );

  const props = useMemo(
    () => ({
      ref,
      onLayout,
    }),
    [onLayout],
  );

  return {
    offset,
    state,
    activeId: draggableActiveId,
    pendingId: draggablePendingId,
    setNodeLayout: onLayout,
    panGestureState,
    props,
  };
};
