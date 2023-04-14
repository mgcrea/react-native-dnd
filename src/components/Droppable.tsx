import React, { type FunctionComponent, type PropsWithChildren } from "react";
import { type ViewProps, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  type AnimateProps,
  type AnimatedStyleProp,
} from "react-native-reanimated";
import { useDroppable, type UseDraggableOptions } from "../hooks";

type AnimatedStyleWorklet = <T extends AnimatedStyleProp<ViewStyle>>(style: T, isActive: boolean) => T;

export type DroppableProps = AnimateProps<ViewProps> &
  UseDraggableOptions & {
    animatedStyleWorklet?: AnimatedStyleWorklet;
  };

export const Droppable: FunctionComponent<PropsWithChildren<DroppableProps>> = ({
  children,
  id,
  disabled,
  data,
  style,
  animatedStyleWorklet,
  ...otherProps
}) => {
  const { setNodeRef, setNodeLayout, activeId } = useDroppable({
    id,
    disabled,
    data,
  });

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === id;
    const style = {
      opacity: isActive ? 0.9 : 1,
    };
    if (animatedStyleWorklet) {
      animatedStyleWorklet(style, isActive);
    }
    return style;
  }, [id]);

  return (
    <Animated.View ref={setNodeRef} onLayout={setNodeLayout} style={[style, animatedStyle]} {...otherProps}>
      {children}
    </Animated.View>
  );
};
