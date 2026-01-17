/**
 * Storefront Auth Library
 * 
 * Provides Firebase authentication for generated storefronts.
 * Includes both a class for React usage and injectable scripts for static pages.
 */

import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { app } from '@/lib/firebaseConfig';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

type AuthListener = (user: User | null) => void;

export class StorefrontAuth {
    private storefrontId: string;
    private listeners: AuthListener[] = [];
    private currentUser: User | null = null;

    constructor(storefrontId: string) {
        this.storefrontId = storefrontId;
        this.init();
    }

    private init() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.emit(user);
        });
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle(): Promise<User | null> {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Register as customer
            await this.registerCustomer(user);

            return user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    }

    /**
     * Register user as customer
     */
    private async registerCustomer(user: User): Promise<void> {
        try {
            const token = await user.getIdToken();
            await fetch('/api/auth/register-customer', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName,
                    storefrontId: this.storefrontId
                })
            });
        } catch (error) {
            console.error('Failed to register customer:', error);
        }
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        await signOut(auth);
    }

    /**
     * Get current user
     */
    getUser(): User | null {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    /**
     * Get ID token for API calls
     */
    async getToken(): Promise<string | null> {
        if (!this.currentUser) return null;
        return this.currentUser.getIdToken();
    }

    /**
     * Subscribe to auth state changes
     */
    onAuthChange(listener: AuthListener): () => void {
        this.listeners.push(listener);
        // Immediately call with current state
        listener(this.currentUser);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private emit(user: User | null): void {
        this.listeners.forEach(listener => listener(user));
    }
}

/**
 * Generate injectable Firebase auth script for storefront pages
 */
export function generateAuthScript(storefrontId: string, firebaseConfig: object): string {
    const configJson = JSON.stringify(firebaseConfig);

    return `
<!-- Firebase Auth CDN -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>

<script>
(function() {
  // Initialize Firebase
  const firebaseConfig = ${configJson};
  
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  const StorefrontAuth = {
    user: null,
    listeners: [],
    storefrontId: '${storefrontId}',
    
    init() {
      firebase.auth().onAuthStateChanged((user) => {
        this.user = user;
        this.emit(user);
        
        // Update UI elements
        this.updateUI(user);
      });
    },
    
    async signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        const result = await firebase.auth().signInWithPopup(provider);
        
        // Register as customer
        if (result.user) {
          const token = await result.user.getIdToken();
          await fetch('/api/auth/register-customer', {
            method: 'POST',
            headers: { 
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: result.user.email,
              name: result.user.displayName,
              storefrontId: this.storefrontId
            })
          });
        }
        
        return result.user;
      } catch (error) {
        console.error('Sign-in error:', error);
        throw error;
      }
    },
    
    async signOut() {
      await firebase.auth().signOut();
    },
    
    getUser() { return this.user; },
    isAuthenticated() { return this.user !== null; },
    
    async getToken() {
      if (!this.user) return null;
      return this.user.getIdToken();
    },
    
    onAuthChange(fn) {
      this.listeners.push(fn);
      fn(this.user);
      return () => { this.listeners = this.listeners.filter(l => l !== fn); };
    },
    
    emit(user) {
      this.listeners.forEach(fn => fn(user));
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user } }));
    },
    
    updateUI(user) {
      // Update user avatar/name elements
      document.querySelectorAll('[data-auth-user]').forEach(el => {
        if (user) {
          el.innerHTML = '<img src="' + (user.photoURL || '') + '" class="w-8 h-8 rounded-full" alt="' + user.displayName + '"/>';
        } else {
          el.innerHTML = '<span>Sign In</span>';
        }
      });
      
      // Show/hide elements based on auth state
      document.querySelectorAll('[data-auth-show="authenticated"]').forEach(el => {
        el.style.display = user ? '' : 'none';
      });
      document.querySelectorAll('[data-auth-show="anonymous"]').forEach(el => {
        el.style.display = user ? 'none' : '';
      });
    }
  };
  
  StorefrontAuth.init();
  window.StorefrontAuth = StorefrontAuth;
})();
</script>
`;
}

/**
 * Create auth instance (for React)
 */
export function createStorefrontAuth(storefrontId: string): StorefrontAuth {
    return new StorefrontAuth(storefrontId);
}
