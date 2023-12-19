import { useLayoutEffect } from "react";
import { LayoutRectangle, ViewProps } from "react-native";
import { runOnUI, useSharedValue } from "react-native-reanimated";
import { DraggableState, useDndContext } from "../DndContext";
import { useLatestSharedValue, useNodeRef } from "../hooks";
import { Data, NativeElement, UniqueIdentifier } from "../types";
import { assert, isReanimatedSharedValue } from "../utils";
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
 *
 * @returns {object} Returns an object with properties and methods related to the draggable component.
 * @property {object} offset - An object representing the current offset of the draggable component.
 * @property {Function} setNodeRef - A function that can be used to set the ref of the draggable component.
 * @property {string} activeId - The unique identifier of the currently active draggable component.
 * @property {string} actingId - The unique identifier of the currently interacti draggable component.
 * @property {Function} setNodeLayout - A function that handles the layout event of the draggable component.
 * @property {object} draggableState - An object representing the current state of the draggable component.
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
  const restingOffset = useSharedPoint(0, 0);
  const state = useSharedValue<DraggableState>("resting");
  // Register early to allow proper referencing in useDraggableStyle
  draggableStates.value[id] = state;

  useLayoutEffect(() => {
    const runLayoutEffect = () => {
      "worklet";
      draggableLayouts.value[id] = layout;
      draggableOffsets.value[id] = offset;
      draggableRestingOffsets.value[id] = restingOffset;
      draggableOptions.value[id] = { id, data: sharedData, disabled, activationDelay, activationTolerance };
      draggableStates.value[id] = state;
    };
    runOnUI(runLayoutEffect)();
    return () => {
      const cleanupLayoutEffect = () => {
        "worklet";
        delete draggableLayouts.value[id];
        delete draggableOffsets.value[id];
        delete draggableRestingOffsets.value[id];
        delete draggableOptions.value[id];
        delete draggableStates.value[id];
      };
      // if(node && node.key === key)
      runOnUI(cleanupLayoutEffect)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onLayout: ViewProps["onLayout"] = () => {
    assert(containerRef.current);
    node.current?.measureLayout(containerRef.current, (x, y, width, height) => {
      layout.value = { x, y, width, height };
    });
  };

  // const setDisabled = useCallback(
  //   (disabled: boolean) => {
  //     const updateDisabled = () => {
  //       "worklet";
  //       console.log("disabled", disabled);
  //       draggableOptions.value[id] = { ...draggableOptions.value[id], disabled };
  //     };
  //     runOnUI(updateDisabled)();
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [id]
  // );

  return {
    offset,
    state,
    setNodeRef,
    activeId: draggableActiveId,
    pendingId: draggablePendingId,
    setNodeLayout: onLayout,
    panGestureState,
    // setDisabled,
  };
};
