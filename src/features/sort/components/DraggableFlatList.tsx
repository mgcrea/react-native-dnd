import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  type ComponentPropsWithoutRef,
} from "react";
import { type FlexStyle, type ViewProps } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { runOnUI } from "react-native-reanimated";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { useDraggableStack, type UseDraggableStackOptions } from "../hooks/useDraggableStack";

export type DraggableFlatListProps = Pick<ViewProps, "style"> &
  Pick<UseDraggableStackOptions, "onOrderChange" | "onOrderUpdate" | "shouldSwapWorklet"> & {
    direction?: FlexStyle["flexDirection"];
    gap?: number;
    data: ArrayLike<unknown>;
    keyExtractor: (item: unknown, index: number) => string;
  } & Omit<
    ComponentPropsWithoutRef<typeof FlatList>,
    "onScroll" | "ItemSeparatorComponent" | "data" | "keyExtractor"
  >;

export type DraggableFlatListHandle = Pick<ReturnType<typeof useDraggableStack>, "refreshOffsets">;

export const DraggableFlatList = forwardRef<DraggableFlatListHandle, DraggableFlatListProps>(
  function DraggableFlatList(
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
    },
    ref,
  ) {
    const childrenIds = useMemo(() => {
      const ids = Array.from(data).map((value, index) => keyExtractor(value, index));

      return ids ? ids.filter(Boolean) : [];
    }, [data]);

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
          return <View style={{ height: gap }}></View>;
        }}
        onScroll={(event) => {
          scrollOffset.x.value = event.nativeEvent.contentOffset.x;
          scrollOffset.y.value = event.nativeEvent.contentOffset.y;
        }}
        {...props}
      />
    );
  },
);
