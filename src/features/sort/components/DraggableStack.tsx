import React, { useEffect, useMemo, type FunctionComponent, type PropsWithChildren } from "react";
import { type FlexStyle, type ViewProps } from "react-native";
import Animated, { runOnUI } from "react-native-reanimated";
import { useChildrenIds } from "../../../hooks";
import { useDraggableStack, type UseDraggableStackOptions } from "../hooks/useDraggableStack";

export type DraggableStackProps = Pick<ViewProps, "style"> &
  Pick<UseDraggableStackOptions, "onOrderChange" | "onOrderUpdate" | "shouldSwapWorklet"> & {
    direction?: FlexStyle["flexDirection"];
    gap?: number;
  };

export const DraggableStack: FunctionComponent<PropsWithChildren<DraggableStackProps>> = ({
  children,
  direction = "row",
  gap = 0,
  onOrderChange,
  onOrderUpdate,
  shouldSwapWorklet,
  style: styleProp,
}) => {
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

  useEffect(() => {
    // Refresh offsets when children change
    runOnUI(refreshOffsets)();
  }, [initialOrder, refreshOffsets]);

  return <Animated.View style={style}>{children}</Animated.View>;
};
