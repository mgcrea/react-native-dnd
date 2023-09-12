import type { HostComponent, ViewProps, ViewStyle } from "react-native";
import type { AnimatedStyleProp, SharedValue, useAnimatedStyle } from "react-native-reanimated";

export type UniqueIdentifier = string | number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyData = Record<string, any>;
export type Data<T = AnyData> = T | SharedValue<T>;
export type SharedData<T = AnyData> = SharedValue<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NativeElement = InstanceType<HostComponent<ViewProps>>;

export type AnimatedStyle = ReturnType<typeof useAnimatedStyle>;
export type AnimatedViewStyle = ReturnType<typeof useAnimatedStyle<AnimatedStyleProp<ViewStyle>>>;
export type AnimatedStyleWorklet<T extends AnimatedStyle = AnimatedViewStyle> = (
  style: Readonly<T>,
  options: { isActive: boolean; isDisabled: boolean; isActing?: boolean },
) => T;
