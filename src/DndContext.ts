import { createContext, useContext, type RefObject } from "react";
import type { LayoutRectangle, View } from "react-native";
import type { GestureEventPayload } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import type { DraggableConstraints, SharedPoint } from "./hooks";
import type { SharedData, UniqueIdentifier } from "./types";

export type ItemOptions = { id: UniqueIdentifier; data: SharedData; disabled: boolean };
export type DraggableItemOptions = ItemOptions & DraggableConstraints;
export type DraggableOptions = Record<UniqueIdentifier, DraggableItemOptions>;
export type DroppableOptions = Record<UniqueIdentifier, ItemOptions>;
export type Layouts = Record<UniqueIdentifier, SharedValue<LayoutRectangle>>;
export type Offsets = Record<UniqueIdentifier, SharedPoint>;

export type DndContextValue = {
  containerRef: RefObject<View>;
  draggableLayouts: SharedValue<Layouts>;
  droppableLayouts: SharedValue<Layouts>;
  draggableOptions: SharedValue<DraggableOptions>;
  droppableOptions: SharedValue<DroppableOptions>;
  draggableOffsets: SharedValue<Offsets>;
  draggableActiveId: SharedValue<UniqueIdentifier | null>;
  draggableActingId: SharedValue<UniqueIdentifier | null>;
  droppableActiveId: SharedValue<UniqueIdentifier | null>;
  draggableState: SharedValue<GestureEventPayload["state"]>;
  draggableActiveOffset: SharedPoint;
  draggableActingOffset: SharedPoint;
  draggableRestingOffset: SharedPoint;
  draggableContentOffset: SharedPoint;
};

// @ts-expect-error ignore detached state
export const DndContext = createContext<DndContextValue>(null);

export const useDndContext = () => {
  return useContext(DndContext);
};
