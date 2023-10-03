import { DependencyList, useCallback, useEffect, useRef, useState } from "react";

/** Acts like `React.useCallback` but debounces its callback
 * @returns callback and cleanup functions
 */

export default function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  wait: number,
  deps: DependencyList,
  fromSecondCall?: boolean, // Starting to debounce after second call
): [(...args: A) => void, () => void] {
  const [firstTimeFired, setFirstTimeFired] = useState<boolean>(false);
  const argsRef = useRef<A>();
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const cb = useCallback(callback, [callback, ...deps]);

  const cleanup = (): void => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  };

  // make sure our timeout gets cleared if
  // our consuming component gets unmounted
  useEffect(() => cleanup, []);

  const debouncedCallback = useCallback(
    function (...args: A): void {
      // capture latest args
      argsRef.current = args;

      // clear debounce timer
      cleanup();

      if (firstTimeFired || !fromSecondCall) {
        // start waiting again
        timeout.current = setTimeout(() => {
          if (argsRef.current) {
            setFirstTimeFired(false);
            cb(...argsRef.current);
          }
        }, wait);
      } else {
        setFirstTimeFired(true);
        cb(...argsRef.current);
      }
    },
    [cb, firstTimeFired, fromSecondCall, wait],
  );

  return [debouncedCallback, cleanup];
}