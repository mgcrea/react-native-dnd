import React, { FunctionComponent, PropsWithChildren } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import Animated, {
  Layout,
  WithSpringConfig,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useActiveDragReaction, useDraggable } from "src/hooks";
import type { Data, UniqueIdentifier } from "src/types";
import { getRandomInt } from "src/utils";
import { useDraggableGridContext } from "../DraggableGridContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type DraggableGridItemProps = Omit<PressableProps, "id"> & {
  id: UniqueIdentifier;
  value: string | number;
  data?: Data;
  springConfig?: WithSpringConfig;
};

export const DraggableGridItem: FunctionComponent<PropsWithChildren<DraggableGridItemProps>> = ({
  children,
  id,
  style,
  data,
  ...otherPressableProps
}) => {
  const { setNodeRef, setNodeLayout, activeId, offset } = useDraggable({
    id,
    data,
  });
  const { gridWidth, gridHeight } = useDraggableGridContext();

  const rotateZ = useSharedValue(0);
  const pressCount = useSharedValue(1);
  useActiveDragReaction(id, (isActive) => {
    "worklet";
    // pressCount.value++;
    rotateZ.value = withSpring(isActive ? getRandomInt(-15 * pressCount.value, 15 * pressCount.value) : 0);
  });

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === id;
    return {
      opacity: isActive ? 0.9 : 1,
      zIndex: isActive ? 999 : 1,
      transform: [
        {
          translateX: isActive ? offset.x.value : withSpring(offset.x.value),
        },
        {
          translateY: isActive ? offset.y.value : withSpring(offset.y.value),
        },
        {
          rotateZ: `${rotateZ.value}deg`,
        },
      ],
    };
  }, [id]);

  return (
    <AnimatedPressable
      ref={setNodeRef}
      onLayout={setNodeLayout}
      entering={ZoomIn}
      layout={Layout.springify()}
      style={[
        styles.item,
        {
          width: `${Math.floor(100 / gridWidth)}%`,
          height: `${Math.floor(100 / gridHeight)}%`,
        },
        animatedStyle,
        style,
      ]}
      {...otherPressableProps}
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
});
