"use client"

import { useEffect } from "react"

/**
 * Detects clicks outside a referenced element and triggers a callback.
 *
 * @param ref - A React ref to the element to detect outside clicks on.
 * @param callback - Function to call when a click occurs outside the ref element.
 *
 * @example
 * const ref = useRef(null);
 * useClickOutside(ref, () => setOpen(false));
 */
export function useClickOutside(
    ref: React.RefObject<HTMLElement | null>,
    callback: () => void
) {
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [ref, callback]);
}