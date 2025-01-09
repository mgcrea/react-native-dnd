import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type ReactElement,
} from "react";
import { View, type FlexStyle, type ViewProps } from "react-native";
import Animated, {
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useDraggableActiveId } from "src/hooks/useDraggableActiveId";
import { useDraggableStack, type UseDraggableStackOptions } from "../hooks/useDraggableStack";

export type DraggableFlatListProps<T> = Pick<ViewProps, "style"> &
  Pick<UseDraggableStackOptions, "onOrderChange" | "onOrderUpdate" | "shouldSwapWorklet"> & {
    direction?: FlexStyle["flexDirection"];
    gap?: number;
    data: ArrayLike<T> | null | undefined;
    keyExtractor: (item: T, index: number) => string;
  } & Omit<
    ComponentPropsWithoutRef<typeof Animated.FlatList<T>>,
    "onScroll" | "ItemSeparatorComponent" | "keyExtractor" | "data"
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
    const listRef = useAnimatedRef<Animated.FlatList<T>>();

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

    const { refreshOffsets, resetSortOrder, scrollOffset, draggableActiveLayout } = useDraggableStack({
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

    const draggableId = useDraggableActiveId();
    const containerSize = useSharedValue(0);

    const scrollDifference = useDerivedValue(() => {
      const offset = horizontal ? scrollOffset.x.value : scrollOffset.y.value;
      // console.log(`DraggableFlatList: offset`, offset);
      const size = horizontal ? draggableActiveLayout.value?.width : draggableActiveLayout.value?.height;
      // console.log(`DraggableFlatList: size`, size);
      const position = horizontal ? draggableActiveLayout.value?.x : draggableActiveLayout.value?.y;
      // console.log(`DraggableFlatList: position`, position);
      if (draggableId && position && size) {
        // console.log(`DraggableFlatList: draggableId`, draggableId);
        const draggableStartPosition = position - size;
        const draggableEndPosition = position + size;

        const containerEdgePosition = containerSize.value + offset;
        if (draggableEndPosition > containerEdgePosition) {
          console.log(`DraggableFlatList: draggable end position`, draggableEndPosition);
          console.log(`DraggableFlatList: container edge`, containerEdgePosition);
          const scrollDifference = draggableEndPosition - containerEdgePosition;
          console.log(`DraggableFlatList: scrollDifference`, scrollDifference);
          return scrollDifference;
        }
        if (draggableStartPosition < offset) {
          console.log(`DraggableFlatList: draggable start position`, draggableStartPosition);
          console.log(`DraggableFlatList: scroll offset`, scrollOffset);
          const scrollDifference = draggableStartPosition - offset;
          console.log(`DraggableFlatList: scrollDifference`, scrollDifference);
          return scrollDifference;
        }
      }
      return 0;
    });

    useDerivedValue(() => {
      if (scrollDifference.value !== 0) {
        console.log(
          `DraggableFlatList: scrollTo`,
          (horizontal ? scrollOffset.x.value : scrollOffset.y.value) + scrollDifference.value,
        );
        scrollTo(
          listRef,
          horizontal ? scrollOffset.x.value + scrollDifference.value : 0,
          !horizontal ? scrollOffset.y.value + scrollDifference.value : 0,
          true,
        );
      }
    });

    return (
      <Animated.FlatList
        ref={listRef}
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
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          console.log(`DraggableFlatList: FlatList container width `, width);
          console.log(`DraggableFlatList: FlatList container height`, height);
          containerSize.value = horizontal ? width : height;
        }}
        {...props}
      />
    );
  },
) as <T>(
  props: DraggableFlatListProps<T> & {
    ref?: ForwardedRef<DraggableFlatListHandle>;
  },
) => ReactElement;
