import { useAnimatedReaction, useSharedValue, type DependencyList } from "react-native-reanimated";

export function useLatestSharedValue<T>(value: T, dependencies: DependencyList = [value]) {
  const sharedValue = useSharedValue<T>(value);

  useAnimatedReaction(
    () => value,
    (next, prev) => {
      // Ignore initial reaction
      if (prev === null) {
        return;
      }
      sharedValue.value = next;
    },
    dependencies
  );

  return sharedValue;
}
