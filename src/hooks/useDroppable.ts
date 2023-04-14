import { useLayoutEffect } from "react";
import { type LayoutRectangle, type ViewProps } from "react-native";
import Animated, { runOnUI, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { useLatestValue, useNodeRef } from "src/hooks";
import { assert } from "src/utils";
import { useDndContext } from "../DndContext";
import type { Data, UniqueIdentifier } from "../types";

export type UseDroppableOptions = { id: UniqueIdentifier; data?: Data; disabled?: boolean };

export const useDroppable = ({ id, data = {}, disabled = false }: UseDroppableOptions) => {
  const { droppableLayouts, droppableOptions, droppableActiveId, containerRef, draggableState } =
    useDndContext();
  const [node, setNodeRef] = useNodeRef<Animated.View>();
  const dataRef = useLatestValue(data);

  const layout = useSharedValue<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useAnimatedReaction(
    () => disabled,
    (next, prev) => {
      if (next !== prev) {
        droppableOptions.value[id].disabled = disabled;
      }
    },
    [disabled]
  );

  useLayoutEffect(() => {
    const runLayoutEffect = () => {
      "worklet";
      droppableLayouts.value[id] = layout;
      droppableOptions.value[id] = { id, data: dataRef, disabled };
    };
    runOnUI(runLayoutEffect)();
    return () => {
      const runLayoutEffect = () => {
        "worklet";
        delete droppableLayouts.value[id];
        delete droppableOptions.value[id];
      };
      // if(node && node.key === key)
      runOnUI(runLayoutEffect)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLayout: ViewProps["onLayout"] = () => {
    assert(containerRef.current);
    node.current?.measureLayout(containerRef.current, (x, y, width, height) => {
      layout.value = { x, y, width, height };
    });
  };

  return { setNodeRef, setNodeLayout: onLayout, activeId: droppableActiveId, draggableState };
};
