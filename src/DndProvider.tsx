import React, { forwardRef, Key, PropsWithChildren, useImperativeHandle, useMemo, useRef } from "react";
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
  runOnUI,
  useAnimatedReaction,
  useSharedValue,
  type WithSpringConfig,
} from "react-native-reanimated";
import {
  animatePointWithSpring,
  applyOffset,
  getDistance,
  includesPoint,
  overlapsRectangle,
  Point,
} from "src/utils";
import {
  DndContext,
  type DndContextValue,
  type DraggableOptions,
  type DroppableOptions,
  type ItemOptions,
  type Layouts,
  type Offsets,
} from "./DndContext";
import { useSharedPoint } from "./hooks";
import type { UniqueIdentifier } from "./types";

export type DndProviderProps = {
  springConfig?: WithSpringConfig;
  activationDelay?: number;
  minDistance?: number;
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
  debug?: boolean;
};

export type DndProviderHandle = Pick<
  DndContextValue,
  "draggableLayouts" | "draggableOffsets" | "draggableActiveId" | "draggableRestingOffset"
>;

export const DndProvider = forwardRef<DndProviderHandle, PropsWithChildren<DndProviderProps>>(
  function DndProvider(
    {
      children,
      springConfig = {},
      minDistance = 0,
      activationDelay = 0,
      disabled,
      hapticFeedback,
      onDragEnd,
      onBegin,
      onUpdate,
      onFinalize,
      style,
      debug,
    },
    ref
  ) {
    const containerRef = useRef<View | null>(null);
    const draggableLayouts = useSharedValue<Layouts>({});
    const droppableLayouts = useSharedValue<Layouts>({});
    const draggableOptions = useSharedValue<DraggableOptions>({});
    const droppableOptions = useSharedValue<DroppableOptions>({});
    const draggableOffsets = useSharedValue<Offsets>({});
    const draggableActiveId = useSharedValue<UniqueIdentifier | null>(null);
    const draggableActingId = useSharedValue<UniqueIdentifier | null>(null);
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
      draggableActingId,
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

      // Helpers for delayed activation (eg. long press)
      let timeout: number | null = null;
      const clearActiveId = () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
      const setActiveId = (id: UniqueIdentifier, delay: number) => {
        timeout = setTimeout(() => {
          runOnUI(() => {
            "worklet";
            console.log("draggableActiveId.value = id");
            draggableActiveId.value = id;
          })();
        }, delay);
      };

      const panGesture = Gesture.Pan()
        .onBegin((event) => {
          const { state, x, y } = event;
          debug && console.log("begin", { state, x, y });
          // Gesture is globally disabled
          if (disabled) {
            return;
          }
          // console.log("begin", { state, x, y });
          // Track current state for cancellation purposes
          draggableState.value = state;
          const { value: layouts } = draggableLayouts;
          const { value: offsets } = draggableOffsets;
          const { value: options } = draggableOptions;
          const { value: lastActingId } = draggableActingId;
          // Find the active layout key under {x, y}
          const activeId = findActiveLayoutId({ x, y });
          // Update shared state
          draggableActingId.value = activeId;
          // Check if an item was actually selected
          if (activeId !== null) {
            // Update activeId directly or with an optional delay
            const { activationDelay } = options[activeId];
            activationDelay > 0
              ? runOnJS(setActiveId)(activeId, activationDelay)
              : (draggableActiveId.value = activeId);
            // Record any ongoing current offset as our initial offset for the gesture
            const activeOffset = offsets[activeId];
            draggableActiveOffset.x.value = activeOffset.x.value;
            draggableActiveOffset.y.value = activeOffset.y.value;
            // Cancel the ongoing animation if we just reactivated the same item
            if (activeId === lastActingId) {
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
          debug && console.log("update", { state, translationX, translationY });
          // Track current state for cancellation purposes
          draggableState.value = state;
          const { value: activeId } = draggableActiveId;
          const { value: actingId } = draggableActingId;
          const { value: options } = draggableOptions;
          const { value: layouts } = draggableLayouts;
          const { value: offsets } = draggableOffsets;
          if (activeId === null) {
            // Check if we are currently waiting for activation delay
            if (actingId !== null) {
              const { activationTolerance } = options[actingId];
              // Check if we've moved beyond the activation tolerance
              const distance = getDistance(translationX, translationY);
              if (distance > activationTolerance) {
                runOnJS(clearActiveId)();
                draggableActingId.value = null;
              }
            }
            // Ignore item-free interactions
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
          debug && console.log("finalize", { state, velocityX, velocityY });
          // Track current state for cancellation purposes
          draggableState.value = state; // can be `FAILED` or `ENDED`
          const { value: activeId } = draggableActiveId;
          const { value: actingId } = draggableActingId;
          const { value: layouts } = draggableLayouts;
          const { value: offsets } = draggableOffsets;
          // Ignore item-free interactions
          if (activeId === null) {
            // Check if we were currently waiting for activation delay
            if (actingId !== null) {
              runOnJS(clearActiveId)();
              draggableActingId.value = null;
            }
            return;
          }
          // Reset interaction-related shared state for styling purposes
          draggableActiveId.value = null;
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
              if (
                draggableState.value !== State.END &&
                draggableState.value !== State.FAILED &&
                draggableActingId.value !== null
              ) {
                return;
              }
              // Cancel if we are not the last interaction
              if (draggableActingId.value !== activeId) {
                return;
              }
              // Track active "acting" item as long as possible for handling consecutive interactions
              draggableActingId.value = null;
            }
          );
        })
        .withTestId("DndProvider.pan");

      // Duration in milliseconds of the LongPress gesture before Pan is allowed to activate.
      // If the finger is moved during that period, the gesture will fail.
      if (activationDelay > 0) {
        panGesture.activateAfterLongPress(activationDelay);
      }

      // Minimum distance the finger (or multiple finger) need to travel before the gesture activates. Expressed in points.
      if (minDistance > 0) {
        panGesture.minDistance(minDistance);
      }

      return panGesture;
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
