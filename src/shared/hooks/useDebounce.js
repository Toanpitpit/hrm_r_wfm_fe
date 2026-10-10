import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a fast-changing value.
 * @param {any} value - The input value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default 400ms)
 * @returns {any} - The debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
