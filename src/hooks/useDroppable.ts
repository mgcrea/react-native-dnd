/* eslint-disable @typescript-eslint/no-dynamic-delete */

import { useLayoutEffect, useMemo, useRef } from "react";
import { View, type LayoutRectangle, type ViewProps } from "react-native";
import { runOnUI, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { useDndContext } from "../DndContext";
import { useEvent, useLatestSharedValue } from "../hooks";
import type { Data, UniqueIdentifier } from "../types";
import { isReanimatedSharedValue } from "../utils";

export type UseDroppableOptions = { id: UniqueIdentifier; data?: Data; disabled?: boolean };

/**
 * useDroppable is a custom hook that provides functionality for making a component droppable within a drag and drop context.
 *
 * @function
 * @example
 * const { setNodeRef, setNodeLayout, activeId, panGestureState } = useDroppable({ id: 'droppable-1' });
 *
 * @param {object} options - The options that define the behavior of the droppable component.
 * @param {string} options.id - A unique identifier for the droppable component.
 * @param {object} [options.data={}] - Optional data associated with the droppable component.
 * @param {boolean} [options.disabled=false] - A flag that indicates whether the droppable component is disabled.
 */
export const useDroppable = ({ id, data = {}, disabled = false }: UseDroppableOptions) => {
  const { containerRef, droppableLayouts, droppableOptions, droppableActiveId, panGestureState } =
    useDndContext();
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

  useLayoutEffect(() => {
    const runLayoutEffect = () => {
      "worklet";
      droppableLayouts.value[id] = layout;
      droppableOptions.value[id] = { id, data: sharedData, disabled };
    };

    runOnUI(runLayoutEffect)();

    return () => {
      const cleanupLayoutEffect = () => {
        "worklet";
        requestAnimationFrame(() => {
          delete droppableLayouts.value[id];
          delete droppableOptions.value[id];
        });
      };
      runOnUI(cleanupLayoutEffect)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onLayout: ViewProps["onLayout"] = useEvent(() => {
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
      if (next !== prev && droppableOptions.value[id]) {
        droppableOptions.value[id].disabled = disabled;
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

  return { props, activeId: droppableActiveId, panGestureState };
};
