"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

type QueryValue = string | number | boolean | null | undefined;
type QueryUpdates = Record<string, QueryValue>;

/**
 * Custom hook to manage URL query parameters in a Next.js app.
 *
 * @returns An object with helpers to get, update, remove, and reset query parameters.
 *
 * @example
 * const { updateQueryParams, removeQueryParams } = useQueryParams();
 * updateQueryParams({ page: 2, sort: 'desc' });
 * removeQueryParams('page');
 */
export const useQueryParams = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    /**
     * Updates the query parameters in the URL.
     *
     * @param newParams - An object of key-value pairs to add/update.
     * @param options - Optional settings.
     *        - clearAll: If true, clears existing query params before applying new ones.
     */
    const updateQueryParams = useCallback(
        (newParams: QueryUpdates = {}, options?: { clearAll?: boolean }) => {
            const currentParams = options?.clearAll
                ? new URLSearchParams()
                : new URLSearchParams(searchParams.toString());

            let changed = false;

            Object.entries(newParams).forEach(([key, value]) => {
                if (value === null || value === undefined || value === "") {
                    if (currentParams.has(key)) {
                        currentParams.delete(key);
                        changed = true;
                    }
                } else {
                    const stringValue = String(value);
                    if (currentParams.get(key) !== stringValue) {
                        currentParams.set(key, stringValue);
                        changed = true;
                    }
                }
            });

            const newQuery = currentParams.toString();
            const newPath = newQuery ? `${pathname}?${newQuery}` : pathname;

            if (changed || options?.clearAll) {
                router.push(newPath, { scroll: false });
            }
        },
        [searchParams, pathname, router]
    );

    /**
     * Removes one or more query parameters from the URL.
     *
     * @param keys - A single key or array of keys to remove.
     */
    const removeQueryParams = useCallback(
        (keys: string | string[]) => {
            const currentParams = new URLSearchParams(searchParams.toString());
            const keysToRemove = Array.isArray(keys) ? keys : [keys];

            let changed = false;

            keysToRemove.forEach((key) => {
                if (currentParams.has(key)) {
                    currentParams.delete(key);
                    changed = true;
                }
            });

            const newQuery = currentParams.toString();
            const newPath = newQuery ? `${pathname}?${newQuery}` : pathname;

            if (changed) {
                router.push(newPath, { scroll: false });
            }
        },
        [searchParams, pathname, router]
    );

    /**
     * Resets (clears) all query parameters from the URL.
     */
    const resetQueryParams = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    return {
        searchParams,
        updateQueryParams,
        removeQueryParams,
        resetQueryParams,
    };
};