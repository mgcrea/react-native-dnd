import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type Ref,
} from "react";
import { View, type FlexStyle, type ViewProps } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { runOnUI } from "react-native-reanimated";
import { useDraggableStack, type UseDraggableStackOptions } from "../hooks/useDraggableStack";

export type DraggableFlatListProps<T> = Pick<ViewProps, "style"> &
  Pick<UseDraggableStackOptions, "onOrderChange" | "onOrderUpdate" | "shouldSwapWorklet"> & {
    direction?: FlexStyle["flexDirection"];
    gap?: number;
    keyExtractor: (item: T, index: number) => string;
  } & Omit<
    ComponentPropsWithoutRef<typeof FlatList<T>>,
    "onScroll" | "ItemSeparatorComponent" | "keyExtractor"
  >;

export type DraggableFlatListHandle = Pick<ReturnType<typeof useDraggableStack>, "refreshOffsets">;

export const DraggableFlatList = forwardRef<DraggableFlatListHandle, DraggableFlatListProps<unknown>>(
  function DraggableFlatList<T>(
    {
      data,
      keyExtractor,
      direction = "row",
      gap = 0,
      onOrderChange,
      onOrderUpdate,
      shouldSwapWorklet,
      style: styleProp,
      ...props
    }: DraggableFlatListProps<T>,
    ref: React.Ref<DraggableFlatListHandle>,
  ) {
    const childrenIds = useMemo(() => {
      const ids = data ? Array.from(data).map((value, index) => keyExtractor(value, index)) : [];

      return ids ? ids.filter(Boolean) : [];
    }, [data, keyExtractor]);

    const style = useMemo(
      () =>
        Object.assign(
          {
            flexDirection: direction,
            gap,
          },
          styleProp,
        ),
      [gap, direction, styleProp],
    );

    const horizontal = ["row", "row-reverse"].includes(style.flexDirection);

    const { refreshOffsets, resetSortOrder, scrollOffset } = useDraggableStack({
      gap: style.gap,
      horizontal,
      childrenIds,
      onOrderChange,
      onOrderUpdate,
      shouldSwapWorklet,
    });

    useImperativeHandle(ref, () => {
      return {
        refreshOffsets,
        resetSortOrder,
      };
    }, [refreshOffsets, resetSortOrder]);

    useEffect(() => {
      // Refresh offsets when children change
      runOnUI(refreshOffsets)();
    }, [childrenIds, refreshOffsets]);

    return (
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={() => {
          return <View style={horizontal ? { width: gap } : { height: gap }}></View>;
        }}
        onScroll={(event) => {
          scrollOffset.x.value = event.nativeEvent.contentOffset.x;
          scrollOffset.y.value = event.nativeEvent.contentOffset.y;
        }}
        horizontal={horizontal}
        {...props}
      />
    );
  },
) as <T>(props: DraggableFlatListProps<T> & { ref?: Ref<DraggableFlatListHandle> }) => ReactElement;
