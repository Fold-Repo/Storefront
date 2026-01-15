/**
 * Returns a debounced version of the given function.
 * 
 * The function will only be called after the specified delay
 * has passed since the last call.
 * 
 * @param func - Function to debounce.
 * @param delay - Delay in milliseconds.
 * @returns A debounced function.
 */
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}