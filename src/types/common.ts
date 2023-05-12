import type { SharedValue } from "react-native-reanimated";

export type UniqueIdentifier = string | number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyData = Record<string, any>;
export type Data<T = AnyData> = T | SharedValue<T>;
export type SharedData<T = AnyData> = SharedValue<T>;
