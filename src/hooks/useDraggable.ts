import { useLayoutEffect } from "react";
import { LayoutRectangle, ViewProps } from "react-native";
import Animated, { runOnUI, useSharedValue } from "react-native-reanimated";
import { useLatestValue, useNodeRef } from "src/hooks";
import { assert } from "src/utils";
import { useDndContext } from "../DndContext";
import { Data, UniqueIdentifier } from "../types";
import { useSharedPoint } from "./useSharedPoint";

export type UseDraggableOptions = { id: UniqueIdentifier; data?: Data; disabled?: boolean };

export const useDraggable = ({ id, data = {}, disabled = false }: UseDraggableOptions) => {
  const {
    draggableLayouts,
    draggableOffsets,
    draggableOptions,
    draggableActiveId,
    containerRef,
    draggableState,
  } = useDndContext();
  const [node, setNodeRef] = useNodeRef<Animated.View>();
  // const key = useUniqueId("Draggable");
  const dataRef = useLatestValue(data);

  const layout = useSharedValue<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const offset = useSharedPoint(0, 0);

  useLayoutEffect(() => {
    const runLayoutEffect = () => {
      "worklet";
      draggableLayouts.value[id] = layout;
      draggableOffsets.value[id] = offset;
      draggableOptions.value[id] = { id, data: dataRef, disabled };
    };
    runOnUI(runLayoutEffect)();
    return () => {
      const runLayoutEffect = () => {
        "worklet";
        delete draggableLayouts.value[id];
        delete draggableOffsets.value[id];
        delete draggableOptions.value[id];
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

  return { offset, setNodeRef, activeId: draggableActiveId, setNodeLayout: onLayout, draggableState };
};
