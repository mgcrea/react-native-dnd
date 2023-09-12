import { RefCallback, useMemo, useRef } from "react";
import { LayoutRectangle, ViewStyle } from "react-native";
import { runOnJS, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { DndProviderHandle, DndProviderProps } from "../DndProvider";
import { UniqueIdentifier } from "../types";
import { applyOffset, centerPoint, includesPoint, moveArrayIndex } from "../utils";
import { useLatestSharedValue } from "./useLatestSharedValue";
import { SharedPoint } from "./useSharedPoint";

export type GridItem = Record<string, unknown> & { [s: string]: UniqueIdentifier };

export enum GridMode {
  Row,
  Column,
  RowReverse,
  ColumnReverse,
}

export const getGridModeStyle = (mode: GridMode): ViewStyle => {
  switch (mode) {
    case GridMode.Row:
      return { flexDirection: "row" };
    case GridMode.RowReverse:
      return { flexDirection: "row-reverse" };
    case GridMode.Column:
      return { flexDirection: "column" };
    case GridMode.ColumnReverse:
      return { flexDirection: "column-reverse" };
  }
};

export type UseDraggableGridOptions<ItemT> = {
  initialOrder?: UniqueIdentifier[];
  gridWidth?: number;
  gridHeight?: number;
  gridMode?: GridMode;
  idExtractor?: ((item: ItemT, index: number) => string) | undefined;
  onBegin?: DndProviderProps["onBegin"];
  onUpdate?: DndProviderProps["onUpdate"];
  onFinalize?: DndProviderProps["onFinalize"];
  onOrderUpdate?: (next: UniqueIdentifier[], prev: UniqueIdentifier[]) => void;
  onOrderChange?: (next: UniqueIdentifier[], prev: UniqueIdentifier[]) => void;
};

export const useDraggableGrid = <ItemT extends GridItem>(
  items: ItemT[],
  {
    gridWidth = items.length,
    // gridHeight = 1,
    gridMode = GridMode.Row,
    initialOrder: initialOrderProp,
    idExtractor,
    onBegin: onBeginProp,
    onUpdate: onUpdateProp,
    onFinalize: onFinalizeProp,
    onOrderUpdate,
    onOrderChange,
  }: UseDraggableGridOptions<ItemT> = {},
) => {
  // Compute initial order
  const initialOrder = useMemo(
    () =>
      initialOrderProp ??
      items.map((item, index) => (idExtractor ? idExtractor(item, index) : item.id || item.key)),
    [idExtractor, items, initialOrderProp],
  );
  // Draggable related state
  const draggableRef = useRef<DndProviderHandle | null>(null);
  const draggablePlaceholderIndex = useSharedValue(-1);
  const draggableSortOrder = useSharedValue<UniqueIdentifier[]>(initialOrder);
  const lastDraggableSortOrder = useSharedValue<UniqueIdentifier[]>(initialOrder);
  const draggableActiveStatus = useSharedValue<Record<UniqueIdentifier, boolean>>({});
  const latestItems = useLatestSharedValue(items);
  const latestGridWidth = useLatestSharedValue(gridWidth);

  // Core placeholder index logic
  const findlaceholderIndex = (activeLayout: LayoutRectangle): number => {
    "worklet";
    if (!draggableRef.current) {
      return -1;
    }
    const { draggableLayouts, draggableOffsets, draggableActiveId } = draggableRef.current;
    const { value: activeId } = draggableActiveId;
    const { value: layouts } = draggableLayouts;
    const { value: offsets } = draggableOffsets;
    const { value: sortOrder } = draggableSortOrder;
    const activeIndex = sortOrder.findIndex((id) => id === activeId);
    const activeCenterPoint = centerPoint(activeLayout);
    for (let itemOrder = 0; itemOrder < sortOrder.length; itemOrder++) {
      const itemId = sortOrder[itemOrder];
      if (itemId === activeId) {
        continue;
      }
      if (!layouts[itemId]) {
        console.warn(`Unexpected missing layout ${itemId} in layouts!`);
        continue;
      }
      if (draggableActiveStatus.value[itemId] === false) {
        continue;
      }
      const itemLayout = applyOffset(layouts[itemId].value, {
        x: offsets[itemId].x.value,
        y: offsets[itemId].y.value,
      });
      if (includesPoint(itemLayout, activeCenterPoint)) {
        // console.log({ itemId, itemOrder, itemLayout, activeCenterPoint });
        return itemOrder;
      }
    }
    // Fallback to current index
    return activeIndex;
  };

  // Update the draggable offset for a given item id at a given index
  const updateOffsetForItemIdAtIndex = (
    offset: SharedPoint,
    itemId: UniqueIdentifier,
    index: number,
    width: number,
    height: number,
  ) => {
    "worklet";
    const { value: gridWidth } = latestGridWidth;
    const { value: items } = latestItems;
    const initIndex = items.findIndex((item, index) =>
      idExtractor ? idExtractor(item, index) : item.id === itemId,
    );
    const initRow = Math.floor(initIndex / gridWidth);
    const initCol = initIndex % gridWidth;
    const nextRow = Math.floor(index / gridWidth);
    const nextCol = index % gridWidth;
    const moveCol = nextCol - initCol;
    const moveRow = nextRow - initRow;
    switch (gridMode) {
      case GridMode.Row:
        offset.x.value = moveCol * width;
        offset.y.value = moveRow * height;
        break;
      case GridMode.RowReverse:
        offset.x.value = moveCol * -1 * width;
        offset.y.value = moveRow * height;
        break;
      case GridMode.Column:
        offset.y.value = moveCol * width;
        offset.x.value = moveRow * height;
        break;
      case GridMode.ColumnReverse:
        offset.y.value = moveCol * -1 * width;
        offset.x.value = moveRow * height;
        break;
      default:
        break;
    }
  };

  // Update draggable offsets when grid mode changes
  useAnimatedReaction(
    () => gridMode,
    (_next, prev) => {
      // Ignore initial reaction or non-ready ref
      if (prev === null || !draggableRef.current) {
        return;
      }
      const { draggableLayouts, draggableOffsets, draggableActiveId, draggableRestingOffset } =
        draggableRef.current;
      const { value: activeId } = draggableActiveId;
      const { value: layouts } = draggableLayouts;
      const { value: offsets } = draggableOffsets;
      const { value: sortOrder } = draggableSortOrder;
      for (let index = 0; index < sortOrder.length; index++) {
        const itemId = sortOrder[index];
        if (!layouts[itemId]) {
          // Can happen on hot reload
          console.warn(`Unexpected missing layouts[itemId]`);
          continue;
        }
        const itemLayout = layouts[itemId].value;
        const offset = itemId === activeId ? draggableRestingOffset : offsets[itemId];
        updateOffsetForItemIdAtIndex(offset, itemId, index, itemLayout.width, itemLayout.height);
      }
    },
    [gridMode],
  );

  // Update draggable offsets when placeholder index changes
  useAnimatedReaction(
    () => draggablePlaceholderIndex.value,
    (next, prev) => {
      // Ignore initial reaction or non-ready ref
      if (prev === null || !draggableRef.current) {
        return;
      }
      // Ignore tail moves
      if (prev === -1 || next === -1) {
        return;
      }
      // console.log(`placeholder: ${prev} -> ${next}`);
      const { draggableLayouts, draggableOffsets, draggableActiveId, draggableRestingOffset } =
        draggableRef.current;
      const { value: activeId } = draggableActiveId;
      const { value: layouts } = draggableLayouts;
      const { value: offsets } = draggableOffsets;
      const { value: sortOrder } = draggableSortOrder;
      if (activeId === null) {
        return;
      }
      const nextOrder = moveArrayIndex(sortOrder, prev, next);
      for (let prevIndex = 0; prevIndex < sortOrder.length; prevIndex++) {
        const itemId = sortOrder[prevIndex];
        const itemLayout = layouts[itemId].value;
        const nextIndex = nextOrder.findIndex((id) => id === itemId);
        if (nextIndex !== prevIndex) {
          const offset = itemId === activeId ? draggableRestingOffset : offsets[itemId];
          updateOffsetForItemIdAtIndex(offset, itemId, nextIndex, itemLayout.width, itemLayout.height);
        }
      }
      // Finally update the sort order
      draggableSortOrder.value = nextOrder;
    },
    [gridMode],
  );

  // Reset offsets and order when items change
  useAnimatedReaction(
    () => items,
    (_next, prev) => {
      // Ignore initial reaction or non-ready ref
      if (prev === null || !draggableRef.current) {
        return;
      }
      // Reset sort order
      draggableSortOrder.value = initialOrder;
      // Reset offsets
      const { draggableOffsets } = draggableRef.current;
      const { value: offsets } = draggableOffsets;
      for (const [, offset] of Object.entries(offsets)) {
        offset.x.value = 0;
        offset.y.value = 0;
      }
    },
    [items],
  );

  // Propagate order changes
  useAnimatedReaction(
    () => draggableSortOrder.value,
    (next, prev) => {
      // Ignore initial reaction or non-ready ref
      if (prev === null || !draggableRef.current) {
        return;
      }
      if (onOrderUpdate) {
        runOnJS(onOrderUpdate)(next, prev);
      }
    },
    [],
  );

  const onBegin: DndProviderProps["onBegin"] = (event, meta) => {
    "worklet";
    const { activeId } = meta;
    const { value: sortOrder } = draggableSortOrder;
    draggablePlaceholderIndex.value = sortOrder.findIndex((id) => id === activeId);
    if (onBeginProp) {
      onBeginProp(event, meta);
    }
  };

  const onUpdate: DndProviderProps["onUpdate"] = (event, meta) => {
    "worklet";
    const { activeLayout } = meta;
    draggablePlaceholderIndex.value = findlaceholderIndex(activeLayout);
    if (onUpdateProp) {
      onUpdateProp(event, meta);
    }
  };

  const onFinalize: DndProviderProps["onFinalize"] = (event, meta) => {
    "worklet";
    draggablePlaceholderIndex.value = -1;
    if (onFinalizeProp) {
      onFinalizeProp(event, meta);
    }
    if (onOrderChange && lastDraggableSortOrder.value.toString() !== draggableSortOrder.value.toString()) {
      runOnJS(onOrderChange)(draggableSortOrder.value, lastDraggableSortOrder.value);
      lastDraggableSortOrder.value = draggableSortOrder.value;
    }
  };

  const props: DndProviderProps & { ref: RefCallback<DndProviderHandle> } = {
    onBegin,
    onUpdate,
    onFinalize,
    ref: (value) => {
      draggableRef.current = value;
    },
  };

  return {
    draggableRef,
    draggablePlaceholderIndex,
    draggableSortOrder,
    findlaceholderIndex,
    updateOffsetForItemIdAtIndex,
    props,
  };
};
