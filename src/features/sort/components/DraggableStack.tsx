import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  type FunctionComponent,
  type PropsWithChildren,
} from "react";
import { type FlexStyle, type ViewProps } from "react-native";
import Animated, { runOnUI } from "react-native-reanimated";
import { useChildrenIds } from "../../../hooks";
import { useDraggableStack, type UseDraggableStackOptions } from "../hooks/useDraggableStack";

export type DraggableStackProps = Pick<ViewProps, "style"> &
  Pick<UseDraggableStackOptions, "onOrderChange" | "onOrderUpdate" | "shouldSwapWorklet"> & {
    direction?: FlexStyle["flexDirection"];
    gap?: number;
  };

export type DraggableStackHandle = Pick<ReturnType<typeof useDraggableStack>, "refreshOffsets">;

export const DraggableStack = forwardRef<DraggableStackHandle, PropsWithChildren<DraggableStackProps>>(
  function DraggableStack(
    {
      children,
      direction = "row",
      gap = 0,
      onOrderChange,
      onOrderUpdate,
      shouldSwapWorklet,
      style: styleProp,
    },
    ref,
  ) {
    const initialOrder = useChildrenIds(children);

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

    const { refreshOffsets } = useDraggableStack({
      gap: style.gap,
      horizontal,
      initialOrder,
      onOrderChange,
      onOrderUpdate,
      shouldSwapWorklet,
    });

    useImperativeHandle(ref, () => {
      return {
        refreshOffsets,
      };
    }, [refreshOffsets]);

    useEffect(() => {
      // Refresh offsets when children change
      runOnUI(refreshOffsets)();
    }, [initialOrder, refreshOffsets]);

    return <Animated.View style={style}>{children}</Animated.View>;
  },
);
