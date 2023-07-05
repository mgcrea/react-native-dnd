import {
  DndProvider,
  DndProviderProps,
  Draggable,
  DraggableProps,
  Droppable,
  DroppableProps,
} from "@mgcrea/react-native-dnd";
import React, { useState, type FunctionComponent } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";

export const BasicExample: FunctionComponent = () => {
  const [count, setCount] = useState(0);
  const dynamicData = useSharedValue({ count: 0 });

  const onDragEnd = () => {
    setCount((count) => count + 1);
    // data.current = { ...data.current, count: data.current.count + 1 };
  };

  const handleDragEnd: DndProviderProps["onDragEnd"] = ({ active, over }) => {
    "worklet";
    if (over) {
      console.log(`Current count is ${active.data.value.count}`);
      dynamicData.value = { ...dynamicData.value, count: dynamicData.value.count + 1 };
      runOnJS(onDragEnd)();
    }
  };

  const handleBegin: DndProviderProps["onBegin"] = () => {
    "worklet";
    console.log("onBegin");
  };

  const handleFinalize: DndProviderProps["onFinalize"] = () => {
    "worklet";
    console.log("onFinalize");
  };

  const draggableStyle: DraggableProps["animatedStyleWorklet"] = (style, { isActive, isActing }) => {
    "worklet";
    return {
      opacity: isActing ? 0.5 : 1,
      backgroundColor: isActive ? "lightseagreen" : "seagreen",
    };
  };

  const droppableStyle: DroppableProps["animatedStyleWorklet"] = (style, { isActive }) => {
    "worklet";
    return {
      backgroundColor: isActive ? "lightsteelblue" : "steelblue",
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <DndProvider onBegin={handleBegin} onFinalize={handleFinalize} onDragEnd={handleDragEnd}>
          <View style={styles.view}>
            <Droppable id="drop" style={styles.box} animatedStyleWorklet={droppableStyle} activeOpacity={1}>
              <Text style={styles.text}>DROP</Text>
            </Droppable>
            <Draggable id="drag" data={dynamicData} style={styles.box} animatedStyleWorklet={draggableStyle}>
              <Text style={styles.text}>DRAG</Text>
            </Draggable>
            <Text testID="button">count is {count}</Text>
          </View>
        </DndProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  view: {
    alignItems: "center",
    marginTop: -128,
    borderColor: "black",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 32,
  },
  box: {
    margin: 24,
    padding: 24,
    height: 96,
    width: 96,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "darkseagreen",
  },
  text: {
    color: "white",
  },
});
