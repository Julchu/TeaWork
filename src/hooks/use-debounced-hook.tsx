import { useEffect, useState } from 'react';

// Prevent value from changing (debounce) if value is changed within the delay period; timeout gets cleared and restarted
// Ex: if user is typing in search box, we don't want the value to update until they've stopped typing for more than 500ms
const useDebouncedState = <T,>(value: T, delay: number = 1000) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set debouncedValue to value (passed in) after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Return a cleanup function that will be called every time useEffect is re-called
      return () => {
        clearTimeout(handler);
      };
    },
    // Only re-call effect if value changes; can also add the "delay" variable to inputs array changing delay dynamically
    [delay, value],
  );

  return debouncedValue;
};

export default useDebouncedState;
