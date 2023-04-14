import React, { type FunctionComponent, type PropsWithChildren } from "react";
import { type ViewProps, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  type AnimateProps,
  type AnimatedStyleProp,
} from "react-native-reanimated";
import { useDraggable, type UseDroppableOptions } from "../hooks";

type AnimatedStyleWorklet = <T extends AnimatedStyleProp<ViewStyle>>(style: T, isActive: boolean) => T;

export type DraggableProps = AnimateProps<ViewProps> &
  UseDroppableOptions & {
    animatedStyleWorklet?: AnimatedStyleWorklet;
  };

export const Draggable: FunctionComponent<PropsWithChildren<DraggableProps>> = ({
  children,
  id,
  data,
  disabled,
  style,
  animatedStyleWorklet,
  ...otherProps
}) => {
  const { setNodeRef, setNodeLayout, activeId, offset } = useDraggable({
    id,
    data,
    disabled,
  });

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === id;
    const style = {
      opacity: isActive ? 0.9 : 1,
      zIndex: isActive ? 999 : 1,
      transform: [
        {
          translateX: offset.x.value,
        },
        {
          translateY: offset.y.value,
        },
      ],
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
