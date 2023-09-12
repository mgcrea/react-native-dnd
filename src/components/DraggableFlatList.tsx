import React, { ComponentProps, ReactElement, useCallback, useRef, useState } from "react";
import { CellRendererProps, FlatListProps, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, {
  AnimatedProps,
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useDndContext } from "../DndContext";
import type { GridItem } from "../hooks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimatedFlatListProps<ItemT = any> = AnimatedProps<ComponentProps<typeof FlatList<ItemT>>>;

export type ViewableRange = {
  first: number | null;
  last: number | null;
};

export type DraggableFlatListProps<T extends GridItem> = AnimatedFlatListProps<T> & {
  placeholderIndex: SharedValue<number>;
};
export const DraggableFlatList = <T extends GridItem>({
  data,
  renderItem,
  placeholderIndex,
  ...otherProps
}: DraggableFlatListProps<T>): ReactElement => {
  const {
    draggableActiveId: activeId,
    draggableActingId: actingId,
    draggableContentOffset,
    draggableActiveOffset,
  } = useDndContext();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const animatedFlatListRef = useAnimatedRef<FlatList<T>>();
  const { current: AnimatedFlatlist } = useRef(Animated.createAnimatedComponent(FlatList<T>));

  const scrollToIndex = useCallback(
    (index: number) => {
      animatedFlatListRef.current?.scrollToIndex({
        index,
        viewPosition: 0,
        animated: true,
      });
    },
    [animatedFlatListRef],
  );

  const viewableRange = useSharedValue<ViewableRange>({
    first: null,
    last: null,
  });

  useAnimatedReaction(
    () => placeholderIndex.value,
    (next, prev) => {
      if (!Array.isArray(data)) {
        return;
      }
      console.log(`placeholderIndex: ${prev} -> ${next}}, last visible= ${viewableRange.value.last}`);
      const {
        value: { first, last },
      } = viewableRange;
      if (last !== null && next >= last && last < data.length - 1) {
        if (next < data.length) {
          runOnJS(scrollToIndex)(next + 1);
        }
      } else if (first !== null && first > 0 && next <= first) {
        if (next > 0) {
          runOnJS(scrollToIndex)(next - 1);
        }
      }
    },
  );

  const scrollHandler = useAnimatedScrollHandler((event) => {
    if (activeId.value === null) {
      draggableContentOffset.y.value = event.contentOffset.y;
    } else {
      draggableActiveOffset.y.value = event.contentOffset.y;
    }
  });

  useAnimatedReaction(
    () => actingId.value,
    (next, prev) => {
      console.log(`actingId: ${prev} -> ${next}}`);
      console.log(`translationY.value=${draggableContentOffset.y.value}`);
    },
    [],
  );
  useAnimatedReaction(
    () => activeId.value,
    (next, prev) => {
      console.log(`activeId: ${prev} -> ${next}}`);
    },
    [],
  );
  useAnimatedReaction(
    () => activeId.value !== null,
    (next, prev) => {
      if (prev !== null && next !== prev) {
        console.log("activeId.value", next);
        runOnJS(setScrollEnabled)(!next);
      }
    },
    [],
  );

  const onViewableItemsChanged = useCallback<NonNullable<FlatListProps<T>["onViewableItemsChanged"]>>(
    ({ viewableItems, changed: _changed }) => {
      // console.log("Visible items are", viewableItems);
      // console.log("Changed in this iteration", changed);
      viewableRange.value = {
        first: viewableItems[0].index,
        last: viewableItems[viewableItems.length - 1].index,
      };
      console.log(
        `First viewable item index: ${viewableItems[0].index}, last: ${
          viewableItems[viewableItems.length - 1].index
        }`,
      );
    },
    [viewableRange],
  );

  return (
    // @ts-expect-error mismatched types
    <AnimatedFlatlist
      data={data}
      renderItem={renderItem}
      ref={animatedFlatListRef}
      scrollEnabled={scrollEnabled}
      removeClippedSubviews={false}
      CellRendererComponent={DraggableFlatListCellRenderer}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
      onScroll={scrollHandler}
      {...otherProps}
    />
  );
};

export const DraggableFlatListCellRenderer = function DraggableFlatListCellRenderer<ItemT extends GridItem>(
  props: CellRendererProps<ItemT>,
) {
  const { item, index, children, style, ...rest } = props;
  const { draggableActingId: actingId } = useDndContext();
  const isActive = actingId.value === item.id;

  return (
    <View
      {...rest}
      style={[
        style,
        {
          zIndex: isActive ? 2 : 1,
        },
      ]}
    >
      {children}
    </View>
  );
};
