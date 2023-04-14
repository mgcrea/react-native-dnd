import { createContext, useContext, type Key, type RefObject } from "react";
import type { LayoutRectangle, View } from "react-native";
import type { GestureEventPayload } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import type { SharedPoint } from "./hooks";
import type { DataRef, UniqueIdentifier } from "./types";

export type ItemOptions = { id: UniqueIdentifier; data: DataRef; disabled: boolean };
export type Options = Record<UniqueIdentifier, ItemOptions>;
export type Layouts = Record<UniqueIdentifier, SharedValue<LayoutRectangle>>;
export type Offsets = Record<UniqueIdentifier, SharedPoint>;

export type DndContextValue = {
  containerRef: RefObject<View>;
  draggableLayouts: SharedValue<Layouts>;
  droppableLayouts: SharedValue<Layouts>;
  draggableOptions: SharedValue<Options>;
  droppableOptions: SharedValue<Options>;
  draggableOffsets: SharedValue<Offsets>;
  draggableActiveId: SharedValue<Key | null>;
  droppableActiveId: SharedValue<Key | null>;
  draggableState: SharedValue<GestureEventPayload["state"]>;
  draggableRestingOffset: SharedPoint;
};

// @ts-expect-error ignore detached state
export const DndContext = createContext<DndContextValue>(null);

export const useDndContext = () => {
  return useContext(DndContext);
};
