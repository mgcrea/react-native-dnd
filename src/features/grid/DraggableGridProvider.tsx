import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { DraggableGridContext, type DraggableGridContextValue } from "./DraggableGridContext";
import { DraggableGrid } from "./components/DraggableGrid";

type DraggableGridProviderProps = {
  mode: number;
  width: number;
  height: number;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export const DraggableGridProvider: FunctionComponent<PropsWithChildren<DraggableGridProviderProps>> = ({
  children,
  width,
  height,
  mode,
  containerStyle,
  style,
}) => {
  const [value, setValue] = useState<DraggableGridContextValue>({
    gridWidth: width,
    gridHeight: height,
    gridMode: mode,
  });
  useEffect(() => {
    setValue((value) => ({ ...value, gridMode: mode }));
  }, [mode]);
  return (
    <DraggableGridContext.Provider value={value}>
      <View style={[styles.container, containerStyle]}>
        <DraggableGrid style={style}>{children}</DraggableGrid>
      </View>
    </DraggableGridContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
    justifyContent: "center",
    aspectRatio: 1,
    width: "100%",
  },
});
