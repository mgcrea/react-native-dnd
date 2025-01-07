import { useCallback } from "react";
import { useAnimatedReaction } from "react-native-reanimated";
import { useDndContext } from "../../../DndContext";
import { UniqueIdentifier } from "../../../types";
import { arraysEqual, doesOverlapOnAxis } from "../../../utils";
import { useDraggableSort, type UseDraggableSortOptions } from "./useDraggableSort";

export type UseDraggableStackOptions = Pick<
  UseDraggableSortOptions,
  "childrenIds" | "onOrderChange" | "onOrderUpdate" | "shouldSwapWorklet"
> & {
  gap?: number;
  horizontal?: boolean;
};
export const useDraggableStack = ({
  childrenIds,
  onOrderChange,
  onOrderUpdate,
  gap = 0,
  horizontal = false,
  shouldSwapWorklet = doesOverlapOnAxis,
}: UseDraggableStackOptions) => {
  const {
    draggableStates,
    draggableActiveId,
    draggableOffsets,
    draggableRestingOffsets,
    draggableLayouts,
    scrollOffset,
  } = useDndContext();
  const axis = horizontal ? "x" : "y";
  const size = horizontal ? "width" : "height";

  const { draggablePlaceholderIndex, draggableSortOrder } = useDraggableSort({
    horizontal,
    childrenIds,
    onOrderChange,
    onOrderUpdate,
    shouldSwapWorklet,
  });

  const computeOffsetsForItem = useCallback(
    (id: UniqueIdentifier) => {
      "worklet";
      const size = horizontal ? "width" : "height";
      const { value: layouts } = draggableLayouts;
      const { value: sortOrder } = draggableSortOrder;

      const nextIndex = sortOrder.findIndex((itemId) => itemId === id);
      const prevIndex = childrenIds.findIndex((itemId) => itemId === id);

      let offset = 0;
      // Accumulate the directional offset for the current item accross its siblings in the stack
      for (let nextSiblingIndex = 0; nextSiblingIndex < sortOrder.length; nextSiblingIndex++) {
        const siblingId = sortOrder[nextSiblingIndex];
        // Skip the current item
        if (siblingId === id) {
          continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!layouts[siblingId]) {
          // Can happen if some items are being removed from the stack
          continue;
        }
        const prevSiblingIndex = childrenIds.findIndex((itemId) => itemId === siblingId);
        // Accummulate the directional offset for the active item
        if (nextSiblingIndex < nextIndex && prevSiblingIndex > prevIndex) {
          // console.log(
          //   `> ${siblingId} has moved to the left of ${id} (${prevSiblingIndex} -> ${nextSiblingIndex})`,
          // );
          offset += layouts[siblingId].value[size] + gap;
        } else if (nextSiblingIndex > nextIndex && prevSiblingIndex < prevIndex) {
          // console.log(
          //   `> ${siblingId} has moved to the right of ${id} (${prevSiblingIndex} -> ${nextSiblingIndex})`,
          // );
          offset -= layouts[siblingId].value[size] + gap;
        }
      }
      return offset;
    },
    [draggableLayouts, draggableSortOrder, gap, horizontal, childrenIds],
  );

  const refreshOffsets = useCallback(() => {
    "worklet";
    requestAnimationFrame(() => {
      const axis = horizontal ? "x" : "y";
      const { value: states } = draggableStates;
      const { value: offsets } = draggableOffsets;
      const { value: restingOffsets } = draggableRestingOffsets;
      const { value: sortOrder } = draggableSortOrder;
      for (const itemId of sortOrder) {
        // Can happen if we are asked to refresh the offsets before the layouts are available
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!offsets[itemId]) {
          continue;
        }
        states[itemId].value = "sleeping";
        offsets[itemId][axis].value = computeOffsetsForItem(itemId);
        restingOffsets[itemId][axis].value = offsets[itemId][axis].value;
      }
      requestAnimationFrame(() => {
        for (const itemId of sortOrder) {
          // Can happen if we are asked to refresh the offsets before the layouts are available
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!offsets[itemId]) {
            continue;
          }
          states[itemId].value = "resting";
        }
      });
    });
  }, [
    computeOffsetsForItem,
    draggableOffsets,
    draggableRestingOffsets,
    draggableSortOrder,
    draggableStates,
    horizontal,
  ]);

  const resetSortOrder = useCallback(() => {
    // Reset the expected sort order
    draggableSortOrder.value = childrenIds.slice();
    // Refresh all offsets
    refreshOffsets();
  }, [childrenIds, draggableSortOrder, refreshOffsets]);

  // Track items being added or removed from the stack
  useAnimatedReaction(
    () => childrenIds,
    (next, prev) => {
      // Ignore initial reaction
      if (prev === null) {
        return;
      }
      if (arraysEqual(next, prev)) {
        return;
      }
      // Refresh all offsets
      refreshOffsets();
    },
    [childrenIds],
  );

  // Track sort order changes and update the offsets
  useAnimatedReaction(
    () => draggableSortOrder.value,
    (nextOrder, prevOrder) => {
      // Ignore initial reaction
      if (prevOrder === null) {
        return;
      }
      const { value: activeId } = draggableActiveId;
      const { value: layouts } = draggableLayouts;
      const { value: offsets } = draggableOffsets;
      const { value: restingOffsets } = draggableRestingOffsets;

      if (!activeId) {
        return;
      }

      const activeLayout = layouts[activeId].value;
      const prevActiveIndex = prevOrder.findIndex((id) => id === activeId);
      const nextActiveIndex = nextOrder.findIndex((id) => id === activeId);
      const nextActiveOffset = { x: 0, y: 0 };
      const restingOffset = restingOffsets[activeId];
      // return;

      for (let nextIndex = 0; nextIndex < nextOrder.length; nextIndex++) {
        const itemId = nextOrder[nextIndex];
        // Skip the active item
        if (itemId === activeId) {
          continue;
        }

        // Skip items that haven't changed position
        const prevIndex = prevOrder.findIndex((id) => id === itemId);
        if (nextIndex === prevIndex) {
          continue;
        }
        // Calculate the directional offset
        const moveCol = nextIndex - prevIndex;
        // Apply the offset to the item from its resting position
        offsets[itemId][axis].value =
          restingOffsets[itemId][axis].value + moveCol * (activeLayout[size] + gap);
        // Reset resting offsets to new updated position
        restingOffsets[itemId][axis].value = offsets[itemId][axis].value;

        // Accummulate the directional offset for the active item
        if (nextIndex < nextActiveIndex && prevIndex > prevActiveIndex) {
          nextActiveOffset[axis] += layouts[itemId].value[size] + gap;
        } else if (nextIndex > nextActiveIndex && prevIndex < prevActiveIndex) {
          nextActiveOffset[axis] -= layouts[itemId].value[size] + gap;
        }
      }
      // Update the active item offset
      restingOffset[axis].value += nextActiveOffset[axis];
    },
    [horizontal],
  );

  return { draggablePlaceholderIndex, draggableSortOrder, resetSortOrder, refreshOffsets, scrollOffset };
};
