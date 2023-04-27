import { useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicEffect = import.meta.env.SSR ? useEffect : useLayoutEffect;

export const useDidMount = (): boolean => {
  const [didMount, setDidMount] = useState(false);

  useIsomorphicEffect(() => {
    setDidMount(true);
  }, []);

  return didMount;
};
