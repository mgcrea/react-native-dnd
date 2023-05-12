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

/**
 * Draggable is a React functional component that can be used to create elements that can be dragged within a Drag and Drop context.
 *
 * @component
 * @example
 * <Draggable id="draggable-1" data={{ label: "Example" }}>
 *   <Text>Drag me!</Text>
 * </Draggable>
 *
 * @param {object} props - The properties that define the Draggable component.
 * @param {string} props.id - A unique identifier for the Draggable component.
 * @param {object} props.data - An object that contains data associated with the Draggable component.
 * @param {boolean} props.disabled - A flag that indicates whether the Draggable component is disabled.
 * @param {object} props.style - An object that defines the style of the Draggable component.
 * @param {Function} props.animatedStyleWorklet - A worklet function that modifies the animated style of the Draggable component.
 * @returns {React.Component} Returns a Draggable component that can be moved by the user within a Drag and Drop context.
 */
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
