import React, { useMemo, type FunctionComponent, type PropsWithChildren } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { getGridModeStyle } from "src/hooks";
import { useDraggableGridContext } from "../DraggableGridContext";

export type DraggableGridProps = Pick<ViewProps, "style">;

export const DraggableGrid: FunctionComponent<PropsWithChildren<DraggableGridProps>> = ({
  children,
  style,
}) => {
  const { gridMode } = useDraggableGridContext();
  const gridStyle = useMemo(() => getGridModeStyle(gridMode), [gridMode]);
  return <View style={[styles.container, gridStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    flexDirection: "column",
    flexWrap: "wrap",
  },
});
