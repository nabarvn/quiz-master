"use client";

import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef } from "react";

const NAVIGATION_LATCH_TIMEOUT_MS = 5000;

interface UseNavigationLatchOptions {
  disabled?: boolean;
}

/*
  Latches same-tab link clicks until navigation completes
*/
export function useNavigationLatch({
  disabled = false,
}: UseNavigationLatchOptions = {}) {
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isNavigating, setIsNavigating] = useReducer(
    (_: boolean, next: boolean) => next,
    false,
  );

  const isDisabled = disabled || isNavigating;

  const clearNavigationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /*
    Release the navigation latch once `pathname` updates
  */
  useEffect(() => {
    setIsNavigating(false);
    clearNavigationTimeout();
  }, [pathname, clearNavigationTimeout]);

  /*
    Cancel pending latch timeout on unmount
  */
  useEffect(() => clearNavigationTimeout, [clearNavigationTimeout]);

  const onClick = useCallback(
    (event: MouseEvent<Element>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      const element = event.currentTarget;

      if (
        element instanceof HTMLAnchorElement &&
        ((element.target && element.target !== "_self") ||
          element.hasAttribute("download"))
      ) {
        return;
      }

      setIsNavigating(true);
      clearNavigationTimeout();

      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        timeoutRef.current = null;
      }, NAVIGATION_LATCH_TIMEOUT_MS);
    },
    [clearNavigationTimeout, isDisabled],
  );

  return { isDisabled, onClick };
}
