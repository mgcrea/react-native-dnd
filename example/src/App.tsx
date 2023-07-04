import {
  DndProvider,
  DndProviderProps,
  Draggable,
  DraggableProps,
  Droppable,
  DroppableProps,
} from "@mgcrea/react-native-dnd";
import React, { useState, type FunctionComponent } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView, State } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";

export const App: FunctionComponent = () => {
  const [count, setCount] = useState(0);
  // const data = useRef({ count: 0 });
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

  const handleFinalize: DndProviderProps["onFinalize"] = ({ state }) => {
    "worklet";
    console.log("onFinalize");
    if (state !== State.FAILED) {
      //
    }
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
    <SafeAreaView>
      <GestureHandlerRootView>
        <DndProvider onBegin={handleBegin} onFinalize={handleFinalize} onDragEnd={handleDragEnd}>
          <Droppable id="drop" style={styles.box} animatedStyleWorklet={droppableStyle} activeOpacity={1}>
            <Text>DROP</Text>
          </Droppable>
          <Draggable
            id="drag"
            data={dynamicData}
            style={styles.box}
            animatedStyleWorklet={draggableStyle}
            delay={0}
            tolerance={0}
          >
            <Text>DRAG</Text>
          </Draggable>
          {/* <DraggablePressable
            id="drag-pressable"
            data={dynamicData}
            style={styles.box}
            animatedStyleWorklet={draggableStyle}
          >
            <Text>Pressable</Text>
          </DraggablePressable> */}
          <Text testID="button">count is {count}</Text>
        </DndProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    margin: 24,
    padding: 24,
    height: 128,
    width: 128,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "darkseagreen",
  },
});
