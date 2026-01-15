import InternetCheck from "./internetCheck";
import { debounce } from "./debounce";
import { deleteCookie } from "./cookies";
import { AUTH_TOKEN_KEY } from "@/types";

export { InternetCheck, debounce };
export * from "./domain";

/**
 * Logout function - clears auth token and user data
 */
export const logout = async (): Promise<void> => {
  // Clear auth token cookie
  deleteCookie(AUTH_TOKEN_KEY);
  
  // Clear any other auth-related storage if needed
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    sessionStorage.clear();
  }
};