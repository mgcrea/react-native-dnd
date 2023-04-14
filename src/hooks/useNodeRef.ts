import { useCallback, useRef } from "react";
import { useEvent } from "./useEvent";

type NodeChangeHandler<T> = (nextElement: T | null, prevElement: T | null) => void;

/**
 * Hook to receive a stable ref setter with an optional onChange handler
 */
export const useNodeRef = <T>(onChange?: NodeChangeHandler<T>) => {
  const onChangeHandler = useEvent(onChange);
  const nodeRef = useRef<T | null>(null);
  const setNodeRef = useCallback(
    (element: T | null) => {
      if (element !== nodeRef.current) {
        onChangeHandler?.(element, nodeRef.current);
      }
      nodeRef.current = element;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return [nodeRef, setNodeRef] as const;
};
