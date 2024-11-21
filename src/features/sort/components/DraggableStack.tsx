import React, { Children, useMemo, type FunctionComponent, type PropsWithChildren } from "react";
import { View, type FlexStyle, type ViewProps } from "react-native";
import type { UniqueIdentifier } from "../../../types";
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
  const initialOrder = useMemo(
    () =>
      Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return (child.props as { id?: UniqueIdentifier }).id;
        }
        return null;
      })?.filter(Boolean),
    [children],
  );

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

  useDraggableStack({
    gap: style.gap,
    horizontal,
    initialOrder,
    onOrderChange,
    onOrderUpdate,
    shouldSwapWorklet,
  });

  return <View style={style}>{children}</View>;
};
