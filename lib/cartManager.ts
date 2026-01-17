/**
 * Cart Manager for Storefront
 * 
 * Manages shopping cart state with localStorage persistence.
 * Can be used both as a module and injected into generated pages.
 */

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: string;
    sku?: string;
}

export interface CartState {
    items: CartItem[];
    storefrontId: string;
}

type CartEventType = 'update' | 'add' | 'remove' | 'clear';
type CartListener = (event: CartEventType, cart: CartManager) => void;

const STORAGE_KEY = 'storefront_cart';

export class CartManager {
    private items: CartItem[] = [];
    private storefrontId: string;
    private listeners: CartListener[] = [];

    constructor(storefrontId: string) {
        this.storefrontId = storefrontId;
        this.load();
    }

    /**
     * Load cart from localStorage
     */
    private load(): void {
        if (typeof window === 'undefined') return;

        try {
            const key = `${STORAGE_KEY}_${this.storefrontId}`;
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data) as CartState;
                this.items = parsed.items || [];
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            this.items = [];
        }
    }

    /**
     * Save cart to localStorage
     */
    private save(): void {
        if (typeof window === 'undefined') return;

        try {
            const key = `${STORAGE_KEY}_${this.storefrontId}`;
            const data: CartState = {
                items: this.items,
                storefrontId: this.storefrontId,
            };
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }

    /**
     * Add item to cart
     */
    add(product: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
        const existingIndex = this.items.findIndex(
            item => item.id === product.id && item.variant === product.variant
        );

        if (existingIndex >= 0) {
            this.items[existingIndex].quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }

        this.save();
        this.emit('add');
    }

    /**
     * Remove item from cart
     */
    remove(productId: string, variant?: string): void {
        this.items = this.items.filter(
            item => !(item.id === productId && item.variant === variant)
        );
        this.save();
        this.emit('remove');
    }

    /**
     * Update item quantity
     */
    updateQuantity(productId: string, quantity: number, variant?: string): void {
        const item = this.items.find(
            i => i.id === productId && i.variant === variant
        );

        if (item) {
            if (quantity <= 0) {
                this.remove(productId, variant);
            } else {
                item.quantity = quantity;
                this.save();
                this.emit('update');
            }
        }
    }

    /**
     * Clear all items from cart
     */
    clear(): void {
        this.items = [];
        this.save();
        this.emit('clear');
    }

    /**
     * Get all cart items
     */
    getItems(): CartItem[] {
        return [...this.items];
    }

    /**
     * Get total item count
     */
    getCount(): number {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Get cart subtotal
     */
    getSubtotal(): number {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    /**
     * Check if cart is empty
     */
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    /**
     * Subscribe to cart events
     */
    on(listener: CartListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Emit cart event
     */
    private emit(event: CartEventType): void {
        this.listeners.forEach(listener => listener(event, this));
    }

    /**
     * Get cart data for checkout
     */
    toCheckoutData() {
        return {
            items: this.items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                variant: item.variant,
                sku: item.sku,
            })),
            subtotal: this.getSubtotal(),
            itemCount: this.getCount(),
        };
    }
}

/**
 * Generate injectable cart script for storefront pages
 * This creates a standalone cart manager that works without React
 */
export function generateCartScript(storefrontId: string): string {
    return `
<script>
(function() {
  const STORAGE_KEY = 'storefront_cart_${storefrontId}';
  
  const StorefrontCart = {
    items: [],
    listeners: [],
    
    init() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          this.items = parsed.items || [];
        }
      } catch (e) { this.items = []; }
      this.emit('init');
    },
    
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: this.items, storefrontId: '${storefrontId}' }));
    },
    
    add(product, quantity) {
      quantity = quantity || 1;
      const existing = this.items.find(i => i.id === product.id && i.variant === product.variant);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({ ...product, quantity });
      }
      this.save();
      this.emit('add');
    },
    
    remove(productId, variant) {
      this.items = this.items.filter(i => !(i.id === productId && i.variant === variant));
      this.save();
      this.emit('remove');
    },
    
    updateQuantity(productId, quantity, variant) {
      const item = this.items.find(i => i.id === productId && i.variant === variant);
      if (item) {
        if (quantity <= 0) {
          this.remove(productId, variant);
        } else {
          item.quantity = quantity;
          this.save();
          this.emit('update');
        }
      }
    },
    
    clear() {
      this.items = [];
      this.save();
      this.emit('clear');
    },
    
    getItems() { return this.items; },
    getCount() { return this.items.reduce((s, i) => s + i.quantity, 0); },
    getSubtotal() { return this.items.reduce((s, i) => s + (i.price * i.quantity), 0); },
    isEmpty() { return this.items.length === 0; },
    
    on(fn) { 
      this.listeners.push(fn); 
      return () => { this.listeners = this.listeners.filter(l => l !== fn); };
    },
    emit(event) { this.listeners.forEach(fn => fn(event, this)); }
  };
  
  StorefrontCart.init();
  window.StorefrontCart = StorefrontCart;
  
  // Auto-attach to add-to-cart buttons
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-add-to-cart]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const product = {
          id: btn.dataset.productId,
          name: btn.dataset.productName,
          price: parseFloat(btn.dataset.productPrice),
          image: btn.dataset.productImage || '',
          variant: btn.dataset.productVariant || null,
          sku: btn.dataset.productSku || null
        };
        StorefrontCart.add(product, 1);
        
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { action: 'add', product } }));
      });
    });
  });
})();
</script>
`;
}

/**
 * Create cart manager instance (for use in React)
 */
export function createCartManager(storefrontId: string): CartManager {
    return new CartManager(storefrontId);
}
