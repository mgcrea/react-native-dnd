import { forwardRef, Key, PropsWithChildren, useImperativeHandle, useMemo, useRef } from "react";
import { LayoutRectangle, StyleProp, View, ViewStyle } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureEventPayload,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  State,
} from "react-native-gesture-handler";
import ReactNativeHapticFeedback, { HapticFeedbackTypes } from "react-native-haptic-feedback";
import {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  WithSpringConfig,
} from "react-native-reanimated";
import { animatePointWithSpring, applyOffset, includesPoint, overlapsRectangle, Point } from "src/utils";
import {
  DndContext,
  type DndContextValue,
  type ItemOptions,
  type Layouts,
  type Offsets,
  type Options,
} from "./DndContext";
import { useSharedPoint } from "./hooks";
import type { UniqueIdentifier } from "./types";

export type DndProviderProps = {
  springConfig?: WithSpringConfig;
  disabled?: boolean;
  onDragEnd?: (ev: { active: ItemOptions; over: ItemOptions | null }) => void;
  onBegin?: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    meta: { activeId: UniqueIdentifier; activeLayout: LayoutRectangle }
  ) => void;
  onUpdate?: (
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>,
    meta: { activeId: UniqueIdentifier; activeLayout: LayoutRectangle }
  ) => void;
  onFinalize?: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    meta: { activeId: UniqueIdentifier; activeLayout: LayoutRectangle }
  ) => void;
  hapticFeedback?: HapticFeedbackTypes;
  style?: StyleProp<ViewStyle>;
};

export type DndProviderHandle = Pick<
  DndContextValue,
  "draggableLayouts" | "draggableOffsets" | "draggableActiveId" | "draggableRestingOffset"
>;

export const DndProvider = forwardRef<DndProviderHandle, PropsWithChildren<DndProviderProps>>(
  function DndProvider(
    { children, springConfig = {}, disabled, hapticFeedback, onDragEnd, onBegin, onUpdate, onFinalize, style },
    ref
  ) {
    const containerRef = useRef<View | null>(null);
    const draggableLayouts = useSharedValue<Layouts>({});
    const droppableLayouts = useSharedValue<Layouts>({});
    const draggableOptions = useSharedValue<Options>({});
    const droppableOptions = useSharedValue<Options>({});
    const draggableOffsets = useSharedValue<Offsets>({});
    const draggableActiveId = useSharedValue<UniqueIdentifier | null>(null);
    const droppableActiveId = useSharedValue<UniqueIdentifier | null>(null);
    const draggableActiveOffset = useSharedPoint(0, 0);
    const draggableRestingOffset = useSharedPoint(0, 0);
    const draggableState = useSharedValue<GestureEventPayload["state"]>(0);

    const runFeedback = () => {
      if (hapticFeedback) {
        ReactNativeHapticFeedback.trigger(hapticFeedback);
      }
    };
    useAnimatedReaction(
      () => draggableActiveId.value,
      (next, prev) => {
        if (next !== prev) {
          // runOnJS(setActiveId)(next);
        }
        if (next !== null) {
          runOnJS(runFeedback)();
        }
      },
      []
    );

    const contextValue = useRef<DndContextValue>({
      containerRef,
      draggableLayouts,
      droppableLayouts,
      draggableOptions,
      droppableOptions,
      draggableOffsets,
      draggableActiveId,
      droppableActiveId,
      draggableState,
      draggableRestingOffset,
    });

    useImperativeHandle(
      ref,
      () => {
        return {
          draggableLayouts,
          draggableOffsets,
          draggableActiveId,
          draggableRestingOffset,
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const panGesture = useMemo(() => {
      const findActiveLayoutId = ({ x, y }: Point): Key | null => {
        "worklet";
        const { value: layouts } = draggableLayouts;
        const { value: offsets } = draggableOffsets;
        const { value: options } = draggableOptions;
        for (const [id, layout] of Object.entries(layouts)) {
          // console.log({ [id]: floorLayout(layout.value) });
          const offset = offsets[id];
          const isDisabled = options[id].disabled;
          if (
            !isDisabled &&
            includesPoint(layout.value, {
              x: x - offset.x.value,
              y: y - offset.y.value,
            })
          ) {
            return id;
          }
        }
        return null;
      };

      const findDroppableLayoutId = (activeLayout: LayoutRectangle): Key | null => {
        "worklet";
        const { value: layouts } = droppableLayouts;
        const { value: options } = droppableOptions;
        for (const [id, layout] of Object.entries(layouts)) {
          // console.log({ [id]: floorLayout(layout.value) });
          const isDisabled = options[id].disabled;
          if (!isDisabled && overlapsRectangle(activeLayout, layout.value)) {
            return id;
          }
        }
        return null;
      };

      return Gesture.Pan()
        .onBegin((event) => {
          const { state, x, y } = event;
          // Gesture is globally disabled
          if (disabled) {
            return;
          }
          // console.log("begin", { state, x, y });
          // Track current state for cancellation purposes
          draggableState.value = state;
          const { value: layouts } = draggableLayouts;
          const { value: offsets } = draggableOffsets;
          const { value: lastActiveId } = draggableActiveId;
          // Find the active layout key under {x, y}
          const activeId = findActiveLayoutId({ x, y });
          // Update shared state
          draggableActiveId.value = activeId;
          // Check if an item was actually selected
          if (activeId !== null) {
            // Record any ongoing current offset as our initial offset for the gesture
            const activeOffset = offsets[activeId];
            draggableActiveOffset.x.value = activeOffset.x.value;
            draggableActiveOffset.y.value = activeOffset.y.value;
            // Cancel the ongoing animation if we just reactivated the same item
            if (activeId === lastActiveId) {
              cancelAnimation(activeOffset.x);
              cancelAnimation(activeOffset.y);
              // If not we should reset the resting offset to the current offset value
            } else {
              draggableRestingOffset.x.value = activeOffset.x.value;
              draggableRestingOffset.y.value = activeOffset.y.value;
            }
            if (onBegin) {
              const activeLayout = layouts[activeId].value;
              onBegin(event, { activeId, activeLayout });
            }
          }
        })
        .onUpdate((event) => {
          const { state, translationX, translationY } = event;
          // console.log("update", { state, translationX, translationY });
          // Track current state for cancellation purposes
          draggableState.value = state;
          const { value: activeId } = draggableActiveId;
          const { value: layouts } = draggableLayouts;
          const { value: offsets } = draggableOffsets;
          // Ignore item-free interactions
          if (activeId === null) {
            return;
          }
          // Update our active offset to pan the active item
          const activeOffset = offsets[activeId];
          activeOffset.x.value = translationX + draggableActiveOffset.x.value;
          activeOffset.y.value = translationY + draggableActiveOffset.y.value;
          // Check potential droppable candidates
          const activeLayout = layouts[activeId].value;
          const updatedLayout = applyOffset(activeLayout, {
            x: activeOffset.x.value,
            y: activeOffset.y.value,
          });
          droppableActiveId.value = findDroppableLayoutId(updatedLayout);
          if (onUpdate) {
            onUpdate(event, { activeId, activeLayout: updatedLayout });
          }
        })
        .onFinalize((event) => {
          const { state, velocityX, velocityY } = event;
          // console.log("finalize", { state, velocityX, velocityY });
          // Track current state for cancellation purposes
          draggableState.value = state; // can be `FAILED` or `ENDED`
          const { value: activeId } = draggableActiveId;
          const { value: layouts } = draggableLayouts;
          const { value: offsets } = draggableOffsets;
          // Ignore item-free interactions
          if (activeId === null) {
            return;
          }
          if (onFinalize) {
            const activeLayout = layouts[activeId].value;
            const activeOffset = offsets[activeId];
            const updatedLayout = applyOffset(activeLayout, {
              x: activeOffset.x.value,
              y: activeOffset.y.value,
            });
            onFinalize(event, { activeId, activeLayout: updatedLayout });
          }
          // Callback
          if (state !== State.FAILED && onDragEnd) {
            const { value: dropActiveId } = droppableActiveId;
            onDragEnd({
              active: draggableOptions.value[activeId],
              over: dropActiveId !== null ? droppableOptions.value[dropActiveId] : null,
            });
          }
          // Reset droppable
          droppableActiveId.value = null;
          // Move back to initial position
          const activeOffset = offsets[activeId];
          animatePointWithSpring(
            activeOffset,
            [draggableRestingOffset.x.value, draggableRestingOffset.y.value],
            [
              { ...springConfig, velocity: velocityX },
              { ...springConfig, velocity: velocityY },
            ],
            () => {
              // Cancel if we are interacting again with an item
              if (draggableState.value !== State.END && draggableActiveId.value !== null) {
                return;
              }
              // Cancel if we are not the last interaction
              if (draggableActiveId.value !== activeId) {
                return;
              }
              // Keep item active as long as possible for handling new interactions
              draggableActiveId.value = null;
            }
          );
        })
        .withTestId("DndProvider.pan");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled]);

    return (
      <DndContext.Provider value={contextValue.current}>
        <GestureDetector gesture={panGesture}>
          <View ref={containerRef} collapsable={false} style={style} testID="view">
            {children}
          </View>
        </GestureDetector>
      </DndContext.Provider>
    );
  }
);
