/* eslint-disable @typescript-eslint/no-dynamic-delete */

import { useLayoutEffect } from "react";
import { type LayoutRectangle, type ViewProps } from "react-native";
import { runOnUI, useAnimatedReaction, useAnimatedRef, useSharedValue } from "react-native-reanimated";
import { useDndContext } from "../DndContext";
import { useLatestSharedValue } from "../hooks";
import type { Data, UniqueIdentifier } from "../types";
import { isReanimatedSharedValue, updateLayoutValue, waitForLayout } from "../utils";

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
 *
 * @returns {object} Returns an object with properties and methods related to the droppable component.
 * @property {Function} setNodeRef - A function that can be used to set the ref of the droppable component.
 * @property {Function} setNodeLayout - A function that handles the layout event of the droppable component.
 * @property {string} activeId - The unique identifier of the currently active droppable component.
 * @property {object} panGestureState - An object representing the current state of the draggable component within the context.
 */
export const useDroppable = ({ id, data = {}, disabled = false }: UseDroppableOptions) => {
  const { droppableLayouts, droppableOptions, droppableActiveId, panGestureState } = useDndContext();
  const animatedRef = useAnimatedRef();
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
      waitForLayout(() => {
        // Try to recover the layout from the ref if it's not available yet
        if (layout.value.width === 0 || layout.value.height === 0) {
          console.log(`Recovering layout for ${id} from ref`);
          updateLayoutValue(layout, animatedRef);
        }
        droppableLayouts.value[id] = layout;
        // Options
        droppableOptions.value[id] = { id, data: sharedData, disabled };
      });
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

  const onLayout: ViewProps["onLayout"] = (_event) => {
    // console.log(`onLayout: ${id}`, event.nativeEvent.layout);
    updateLayoutValue(layout, animatedRef);
  };

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

  return { animatedRef, setNodeLayout: onLayout, activeId: droppableActiveId, panGestureState };
};
