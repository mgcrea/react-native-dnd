import { useLayoutEffect } from "react";
import { LayoutRectangle, ViewProps } from "react-native";
import { runOnUI, useSharedValue } from "react-native-reanimated";
import { useLatestSharedValue, useNodeRef } from "src/hooks";
import { assert, isReanimatedSharedValue } from "src/utils";
import { useDndContext } from "../DndContext";
import { Data, NativeElement, UniqueIdentifier } from "../types";
import { useSharedPoint } from "./useSharedPoint";

export type UseDraggableOptions = {
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
 *
 * @returns {object} Returns an object with properties and methods related to the draggable component.
 * @property {object} offset - An object representing the current offset of the draggable component.
 * @property {Function} setNodeRef - A function that can be used to set the ref of the draggable component.
 * @property {string} activeId - The unique identifier of the currently active draggable component.
 * @property {Function} setNodeLayout - A function that handles the layout event of the draggable component.
 * @property {object} draggableState - An object representing the current state of the draggable component.
 */
export const useDraggable = ({ id, data = {}, disabled = false }: UseDraggableOptions) => {
  const {
    draggableLayouts,
    draggableOffsets,
    draggableOptions,
    draggableActiveId,
    containerRef,
    draggableState,
  } = useDndContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [node, setNodeRef] = useNodeRef<NativeElement, any>();
  // const key = useUniqueId("Draggable");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sharedData = isReanimatedSharedValue(data) ? data : useLatestSharedValue(data);

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
      draggableOptions.value[id] = { id, data: sharedData, disabled };
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
