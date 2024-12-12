import { LayoutRectangle } from "react-native";
import { runOnJS, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { useDndContext } from "../../../DndContext";
import type { UniqueIdentifier } from "../../../types";
import {
  applyOffset,
  arraysEqual,
  type Direction,
  doesOverlapOnAxis,
  moveArrayIndex,
  type Rectangle,
} from "../../../utils";

export type ShouldSwapWorklet = (
  activeLayout: Rectangle,
  itemLayout: Rectangle,
  direction: Direction,
) => boolean;

export type UseDraggableSortOptions = {
  childrenIds: UniqueIdentifier[];
  horizontal?: boolean;
  onOrderChange?: (order: UniqueIdentifier[]) => void;
  onOrderUpdate?: (nextOrder: UniqueIdentifier[], prevOrder: UniqueIdentifier[]) => void;
  shouldSwapWorklet?: ShouldSwapWorklet;
};

export const useDraggableSort = ({
  horizontal = false,
  childrenIds,
  onOrderChange,
  onOrderUpdate,
  shouldSwapWorklet = doesOverlapOnAxis,
}: UseDraggableSortOptions) => {
  const { draggableActiveId, draggableActiveLayout, draggableOffsets, draggableLayouts } = useDndContext();
  const direction = horizontal ? "horizontal" : "vertical";

  const draggablePlaceholderIndex = useSharedValue(-1);
  const draggableLastOrder = useSharedValue<UniqueIdentifier[]>(childrenIds);
  const draggableSortOrder = useSharedValue<UniqueIdentifier[]>(childrenIds);

  // Core placeholder index logic
  const findPlaceholderIndex = (activeLayout: LayoutRectangle): number => {
    "worklet";
    const { value: activeId } = draggableActiveId;
    const { value: layouts } = draggableLayouts;
    const { value: offsets } = draggableOffsets;
    const { value: sortOrder } = draggableSortOrder;
    const activeIndex = sortOrder.findIndex((id) => id === activeId);
    // const activeCenterPoint = centerPoint(activeLayout);
    // console.log(`activeLayout: ${JSON.stringify(activeLayout)}`);
    for (let itemIndex = 0; itemIndex < sortOrder.length; itemIndex++) {
      const itemId = sortOrder[itemIndex];
      if (itemId === activeId) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!layouts[itemId]) {
        console.warn(`Unexpected missing layout ${itemId} in layouts!`);
        continue;
      }
      const itemLayout = applyOffset(layouts[itemId].value, {
        x: offsets[itemId].x.value,
        y: offsets[itemId].y.value,
      });

      if (shouldSwapWorklet(activeLayout, itemLayout, direction)) {
        // console.log(`Found placeholder index ${itemIndex} using custom shouldSwapWorklet!`);
        return itemIndex;
      }
      continue;
    }
    // Fallback to current index
    return activeIndex;
  };

  // Track added/removed draggable items and update the sort order
  useAnimatedReaction(
    () => childrenIds,
    (next, prev) => {
      if (prev === null || prev.length === 0) {
        return;
      }

      // Handle removed draggable items
      const removedIds = prev.filter((id) => !next.includes(id));
      if (removedIds.length > 0) {
        draggableSortOrder.value = draggableSortOrder.value.filter((itemId) => !removedIds.includes(itemId));
      }

      // Handle added draggable items by inserting them at the correct index
      const layouts = draggableLayouts.value;
      const addedIds = next.filter((id) => !prev.includes(id));
      addedIds.forEach((id) => {
        const positionEntries = Object.entries(layouts).map<[UniqueIdentifier, number]>(([key, layout]) => [
          key,
          layout.value[horizontal ? "x" : "y"],
        ]);
        positionEntries.sort((a, b) => a[1] - b[1]);
        const index = positionEntries.findIndex(([key]) => key === id);
        const nextOrder = draggableSortOrder.value.slice();
        nextOrder.splice(index, 0, id);
        // draggableLastOrder.value = draggableSortOrder.value.slice();
        draggableSortOrder.value = nextOrder;
      });

      // Broadcast the order change to the parent component
      if (onOrderChange && (removedIds.length > 0 || addedIds.length > 0)) {
        runOnJS(onOrderChange)(draggableSortOrder.value);
      }
    },
    [onOrderChange],
  );

  // Track active layout changes and update the placeholder index
  useAnimatedReaction(
    () => [draggableActiveId.value, draggableActiveLayout.value] as const,
    ([nextActiveId, nextActiveLayout], prev) => {
      // Ignore initial reaction
      if (prev === null) {
        return;
      }
      const [_prevActiveId, _prevActiveLayout] = prev;
      // No active layout
      if (nextActiveLayout === null) {
        return;
      }
      // Reset the placeholder index when the active id changes
      if (nextActiveId === null) {
        draggablePlaceholderIndex.value = -1;
        return;
      }
      // Only track our own children
      if (!childrenIds.includes(nextActiveId)) {
        return;
      }
      // const axis = direction === "row" ? "x" : "y";
      // const delta = prevActiveLayout !== null ? nextActiveLayout[axis] - prevActiveLayout[axis] : 0;
      draggablePlaceholderIndex.value = findPlaceholderIndex(nextActiveLayout);
    },
    [childrenIds],
  );

  // Track placeholder index changes and update the sort order
  useAnimatedReaction(
    () => [draggableActiveId.value, draggablePlaceholderIndex.value] as const,
    (next, prev) => {
      // Ignore initial reaction
      if (prev === null) {
        return;
      }
      const [_prevActiveId, prevPlaceholderIndex] = prev;
      const [nextActiveId, nextPlaceholderIndex] = next;
      const { value: prevOrder } = draggableSortOrder;
      // if (nextPlaceholderIndex !== prevPlaceholderIndex) {
      //   console.log(`Placeholder index changed from ${prevPlaceholderIndex} to ${nextPlaceholderIndex}`);
      // }
      if (prevPlaceholderIndex !== -1 && nextPlaceholderIndex === -1) {
        // Notify the parent component of the order change
        if (nextActiveId === null && onOrderChange) {
          if (!arraysEqual(prevOrder, draggableLastOrder.value)) {
            runOnJS(onOrderChange)(prevOrder);
          }
          draggableLastOrder.value = prevOrder;
        }
      }
      // Only update the sort order when the placeholder index changes between two valid values
      if (prevPlaceholderIndex === -1 || nextPlaceholderIndex === -1) {
        return;
      }
      // Finally update the sort order
      const nextOrder = moveArrayIndex(prevOrder, prevPlaceholderIndex, nextPlaceholderIndex);
      // Notify the parent component of the order update
      if (onOrderUpdate) {
        runOnJS(onOrderUpdate)(nextOrder, prevOrder);
      }

      draggableSortOrder.value = nextOrder;
    },
    [onOrderChange],
  );

  return { draggablePlaceholderIndex, draggableSortOrder };
};
