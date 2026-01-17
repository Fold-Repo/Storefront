/**
 * Product Filter UI Generator
 * 
 * Generates a non-editable product filter UI that integrates with the products API.
 * This UI is rendered as actual HTML (not placeholders) for visual preview in editors.
 */

interface FilterConfig {
    storefrontId: string;
    primaryColor: string;
    categories?: Array<{ id: string; name: string; slug: string }>;
}

/**
 * Generate the product filter HTML with search and category filters
 * This is designed to be injected into pages and is NOT editable in GrapesJS
 */
export function generateProductFilterHTML(config: FilterConfig): string {
    const { storefrontId, primaryColor, categories = [] } = config;

    const categoryOptions = categories
        .map(cat => `<option value="${cat.id}">${cat.name}</option>`)
        .join('');

    return `
<!-- Product Filter Section - Non-Editable Dynamic Content -->
<div 
  class="product-filter-container bg-white border-b sticky top-16 z-40 py-4" 
  data-dynamic-content="true"
  data-gjs-type="dynamic-content"
  data-gjs-editable="false"
>
  <div class="container mx-auto px-4">
    <div class="flex flex-wrap items-center gap-4">
      <!-- Search Input -->
      <div class="flex-1 min-w-[200px]">
        <div class="relative">
          <input 
            type="text" 
            id="product-search" 
            placeholder="Search products..." 
            class="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:outline-none transition-all"
            style="--tw-ring-color: ${primaryColor}"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="min-w-[150px]">
        <select 
          id="category-filter" 
          class="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:outline-none cursor-pointer appearance-none"
          style="--tw-ring-color: ${primaryColor}"
        >
          <option value="">All Categories</option>
          ${categoryOptions}
        </select>
      </div>

      <!-- Sort Filter -->
      <div class="min-w-[150px]">
        <select 
          id="sort-filter" 
          class="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:outline-none cursor-pointer appearance-none"
          style="--tw-ring-color: ${primaryColor}"
        >
          <option value="newest">Newest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <!-- Price Range -->
      <div class="flex items-center gap-2">
        <input 
          type="number" 
          id="min-price" 
          placeholder="Min $" 
          class="w-24 border border-gray-200 rounded-xl px-3 py-3 focus:ring-2 focus:outline-none"
          style="--tw-ring-color: ${primaryColor}"
        />
        <span class="text-gray-400">-</span>
        <input 
          type="number" 
          id="max-price" 
          placeholder="Max $" 
          class="w-24 border border-gray-200 rounded-xl px-3 py-3 focus:ring-2 focus:outline-none"
          style="--tw-ring-color: ${primaryColor}"
        />
      </div>

      <!-- Apply Button -->
      <button 
        id="apply-filters" 
        class="px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
        style="background-color: ${primaryColor}"
      >
        Apply
      </button>

      <!-- Clear Button -->
      <button 
        id="clear-filters" 
        class="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        Clear
      </button>
    </div>

    <!-- Active Filters Display -->
    <div id="active-filters" class="flex flex-wrap gap-2 mt-3 hidden">
      <!-- Filled dynamically -->
    </div>
  </div>
</div>

<!-- Product Filter Script -->
<script>
(function() {
  const storefrontId = '${storefrontId}';
  const API_BASE = '/api/storefront/' + storefrontId + '/products';
  
  let debounceTimer;
  
  function getFilters() {
    return {
      search: document.getElementById('product-search')?.value || '',
      category: document.getElementById('category-filter')?.value || '',
      sort: document.getElementById('sort-filter')?.value || 'newest',
      minPrice: document.getElementById('min-price')?.value || '',
      maxPrice: document.getElementById('max-price')?.value || ''
    };
  }
  
  function buildQueryString(filters) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    return params.toString();
  }
  
  async function fetchProducts() {
    const filters = getFilters();
    const query = buildQueryString(filters);
    
    try {
      const container = document.querySelector('.products-grid, #products-container');
      if (container) {
        container.innerHTML = '<div class="col-span-full text-center py-12"><div class="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div></div>';
      }
      
      const res = await fetch(API_BASE + '?' + query);
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      
      // Dispatch event for product grid to handle
      window.dispatchEvent(new CustomEvent('products:loaded', { detail: data }));
      
      updateActiveFilters(filters);
      
    } catch (error) {
      console.error('Filter error:', error);
    }
  }
  
  function updateActiveFilters(filters) {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    const tags = [];
    if (filters.search) tags.push({ key: 'search', label: 'Search: ' + filters.search });
    if (filters.category) {
      const select = document.getElementById('category-filter');
      const option = select?.querySelector('option[value="' + filters.category + '"]');
      if (option) tags.push({ key: 'category', label: 'Category: ' + option.textContent });
    }
    if (filters.minPrice || filters.maxPrice) {
      tags.push({ key: 'price', label: 'Price: $' + (filters.minPrice || '0') + ' - $' + (filters.maxPrice || '∞') });
    }
    
    if (tags.length > 0) {
      container.innerHTML = tags.map(t => 
        '<span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">' + 
        t.label + 
        '<button onclick="clearFilter(\\'' + t.key + '\\')" class="hover:text-red-500">&times;</button></span>'
      ).join('');
      container.classList.remove('hidden');
    } else {
      container.classList.add('hidden');
    }
  }
  
  window.clearFilter = function(key) {
    if (key === 'search') document.getElementById('product-search').value = '';
    if (key === 'category') document.getElementById('category-filter').value = '';
    if (key === 'price') {
      document.getElementById('min-price').value = '';
      document.getElementById('max-price').value = '';
    }
    fetchProducts();
  };
  
  function clearAllFilters() {
    document.getElementById('product-search').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('sort-filter').value = 'newest';
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    fetchProducts();
  }
  
  // Event listeners
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('apply-filters')?.addEventListener('click', fetchProducts);
    document.getElementById('clear-filters')?.addEventListener('click', clearAllFilters);
    
    // Search with debounce
    document.getElementById('product-search')?.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fetchProducts, 500);
    });
    
    // Instant filter on select change
    document.getElementById('category-filter')?.addEventListener('change', fetchProducts);
    document.getElementById('sort-filter')?.addEventListener('change', fetchProducts);
    
    // Initial load
    fetchProducts();
  });
})();
</script>
`;
}

/**
 * Generate preview products HTML for GrapesJS editor
 * Shows realistic sample data instead of placeholders
 */
export function generatePreviewProductsHTML(config: FilterConfig): string {
    const { primaryColor } = config;

    // Generate sample products for preview
    const sampleProducts = [
        { id: '1', name: 'Premium Leather Jacket', price: 299.99, image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Product+1' },
        { id: '2', name: 'Classic White Sneakers', price: 129.99, image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Product+2' },
        { id: '3', name: 'Minimalist Watch', price: 199.99, image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Product+3' },
        { id: '4', name: 'Wireless Earbuds Pro', price: 159.99, image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Product+4' },
    ];

    const productCards = sampleProducts.map(product => `
    <div class="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full" data-preview="true">
      <div class="aspect-square bg-gray-50 relative overflow-hidden p-4">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">${product.name}</h3>
          <p class="text-sm text-gray-400 mb-3">Sample product description</p>
        </div>
        <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <span class="text-xl font-bold" style="color: ${primaryColor}">$${product.price}</span>
          <button class="px-4 py-2 rounded-lg text-white text-sm font-semibold" style="background-color: ${primaryColor}">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join('');

    return `
<!-- Preview Products Grid - Shows sample data in editor -->
<div 
  class="preview-products-notice"
  data-dynamic-content="true"
  data-gjs-type="dynamic-content"
>
  <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-center">
    <p class="text-blue-600 text-sm font-medium">📦 Dynamic Products Section - Preview Mode</p>
    <p class="text-blue-500 text-xs">This section will display your actual products when published</p>
  </div>
</div>
<div 
  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 products-grid"
  id="products-container"
  data-dynamic-content="true"
  data-gjs-type="dynamic-content"
>
  ${productCards}
</div>
`;
}
