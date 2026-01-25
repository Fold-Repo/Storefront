/**
 * Dummy Data Templates for Dynamic Components
 * 
 * Provides preview HTML templates for all dynamic components that will be
 * displayed in GrapesJS editor. These templates are non-editable but deletable.
 */

export interface DummyTemplate {
  id: string;
  name: string;
  category: string;
  html: string;
  description: string;
}

/**
 * Generate dummy menu/navigation bar HTML
 */
export function getDummyMenuHTML(companyName: string = "Your Store"): string {
  return `
    <nav 
      data-dynamic-content="menu" 
      data-gjs-editable="false" 
      data-gjs-droppable="false" 
      data-gjs-selectable="true" 
      data-gjs-removable="true" 
      data-gjs-hoverable="true"
      data-block-id="menu-001"
      data-block-type="menu"
      class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a href="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">${companyName.charAt(0)}</span>
            </div>
            <span class="text-xl font-bold text-gray-900">${companyName}</span>
          </a>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
            <a href="/products" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">Products</a>
            <a href="/categories" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">Categories</a>
            <a href="/about" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
            <a href="/contact" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
          </div>
          
          <!-- Cart & Account -->
          <div class="flex items-center space-x-4">
            <button class="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            <button class="p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
          
          <!-- Mobile Menu Button -->
          <button class="md:hidden p-2 text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `;
}

/**
 * Generate dummy footer HTML
 */
export function getDummyFooterHTML(companyName: string = "Your Store"): string {
  return `
    <footer 
      data-dynamic-content="footer" 
      data-gjs-editable="false" 
      data-gjs-droppable="false" 
      data-gjs-selectable="true" 
      data-gjs-removable="true" 
      data-gjs-hoverable="true"
      data-block-id="footer-001"
      data-block-type="footer"
      class="bg-gray-900 text-white py-12 mt-20"
    >
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div>
            <h3 class="text-xl font-bold mb-4">${companyName}</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for quality products. We're committed to providing the best shopping experience.
            </p>
          </div>
          
          <!-- Quick Links -->
          <div>
            <h4 class="font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="/" class="text-gray-400 hover:text-white transition-colors text-sm">Home</a></li>
              <li><a href="/products" class="text-gray-400 hover:text-white transition-colors text-sm">Products</a></li>
              <li><a href="/about" class="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="/contact" class="text-gray-400 hover:text-white transition-colors text-sm">Contact</a></li>
            </ul>
          </div>
          
          <!-- Customer Service -->
          <div>
            <h4 class="font-semibold mb-4">Customer Service</h4>
            <ul class="space-y-2">
              <li><a href="/shipping" class="text-gray-400 hover:text-white transition-colors text-sm">Shipping Info</a></li>
              <li><a href="/returns" class="text-gray-400 hover:text-white transition-colors text-sm">Returns</a></li>
              <li><a href="/faq" class="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
              <li><a href="/support" class="text-gray-400 hover:text-white transition-colors text-sm">Support</a></li>
            </ul>
          </div>
          
          <!-- Contact & Social -->
          <div>
            <h4 class="font-semibold mb-4">Connect With Us</h4>
            <div class="space-y-3">
              <p class="text-gray-400 text-sm">Email: info@${companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
              <p class="text-gray-400 text-sm">Phone: +1 (555) 123-4567</p>
              <div class="flex space-x-4 mt-4">
                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.057-1.274-.07-1.649-.07-4.844 0-3.196.015-3.586.074-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-8 pt-8 text-center">
          <p class="text-gray-500 text-sm">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Generate dummy categories HTML
 */
export function getDummyCategoriesHTML(): string {
  return `
    <section 
      data-dynamic-content="categories" 
      data-gjs-editable="false" 
      data-gjs-droppable="false" 
      data-gjs-selectable="true" 
      data-gjs-removable="true" 
      data-gjs-hoverable="true"
      data-block-id="categories-001"
      data-block-type="categories"
      class="py-16 bg-gray-50"
    >
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <!-- Category 1 -->
          <a href="/categories/electronics" class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all">
            <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
              <svg class="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 class="text-center font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Electronics</h3>
            <p class="text-center text-sm text-gray-500 mt-2">12 products</p>
          </a>
          
          <!-- Category 2 -->
          <a href="/categories/fashion" class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all">
            <div class="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-600 transition-colors">
              <svg class="w-8 h-8 text-pink-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="text-center font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">Fashion</h3>
            <p class="text-center text-sm text-gray-500 mt-2">24 products</p>
          </a>
          
          <!-- Category 3 -->
          <a href="/categories/home" class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all">
            <div class="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
              <svg class="w-8 h-8 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 class="text-center font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Home & Living</h3>
            <p class="text-center text-sm text-gray-500 mt-2">18 products</p>
          </a>
          
          <!-- Category 4 -->
          <a href="/categories/sports" class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all">
            <div class="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
              <svg class="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-center font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Sports</h3>
            <p class="text-center text-sm text-gray-500 mt-2">15 products</p>
          </a>
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate dummy products grid HTML
 */
export function getDummyProductsHTML(): string {
  const dummyProducts = [
    { id: 1, name: "Premium Wireless Headphones", price: "129.99", image: "https://via.placeholder.com/300x300?text=Headphones" },
    { id: 2, name: "Smart Watch Pro", price: "299.99", image: "https://via.placeholder.com/300x300?text=Watch" },
    { id: 3, name: "Laptop Stand Ergonomic", price: "49.99", image: "https://via.placeholder.com/300x300?text=Laptop+Stand" },
    { id: 4, name: "Wireless Mouse", price: "29.99", image: "https://via.placeholder.com/300x300?text=Mouse" },
  ];

  const productCards = dummyProducts.map(product => `
    <div class="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col h-full">
      <div class="aspect-square bg-gray-50 relative overflow-hidden p-8">
        <a href="/products/${product.id}" class="block h-full">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
        </a>
        <button class="absolute bottom-6 left-6 right-6 translate-y-32 group-hover:translate-y-0 bg-gray-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all duration-500 hover:bg-blue-600">
          Add to Cart
        </button>
      </div>
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <a href="/products/${product.id}" class="block group/title">
            <h3 class="font-black text-gray-900 text-base mb-2 group-hover/title:text-blue-600 transition-colors line-clamp-2 leading-tight uppercase tracking-tight">${product.name}</h3>
          </a>
          <p class="text-[12px] font-medium text-gray-400 mb-4 line-clamp-2 leading-relaxed">High-quality product with premium features and excellent customer support.</p>
        </div>
        <div class="flex items-center justify-between mt-auto pt-5 border-t border-gray-50">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Price</span>
            <span class="text-2xl font-black text-gray-900 tracking-tighter">$${product.price}</span>
          </div>
          <button class="w-10 h-10 rounded-xl bg-gray-50 hover:bg-blue-600 hover:text-white flex items-center justify-center text-gray-400 transition-all duration-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <section 
      data-dynamic-content="products" 
      data-gjs-editable="false" 
      data-gjs-droppable="false" 
      data-gjs-selectable="true" 
      data-gjs-removable="true" 
      data-gjs-hoverable="true"
      data-block-id="products-001"
      data-block-type="products"
      class="py-16 bg-white"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Featured Products</h2>
          <a href="/products" class="text-blue-600 hover:text-blue-700 font-medium">View All →</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          ${productCards}
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate dummy featured products slider HTML
 */
export function getDummyFeaturedProductsHTML(): string {
  return `
    <section 
      data-dynamic-content="featured-products" 
      data-gjs-editable="false" 
      data-gjs-droppable="false" 
      data-gjs-selectable="true" 
      data-gjs-removable="true" 
      data-gjs-hoverable="true"
      data-block-id="featured-products-001"
      data-block-type="featured-products"
      class="py-16 bg-gradient-to-r from-blue-600 to-purple-600"
    >
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-white text-center mb-12">Featured Products</h2>
        <div class="flex gap-8 overflow-x-auto pb-4">
          ${[1, 2, 3, 4].map(i => `
            <div class="min-w-[280px] bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] shadow-2xl">
              <div class="aspect-square rounded-2xl bg-white/5 flex items-center justify-center p-8 mb-6">
                <div class="w-full h-full bg-white/10 rounded-xl"></div>
              </div>
              <div class="space-y-4 text-left">
                <h4 class="font-black text-white text-lg">Product ${i}</h4>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-black text-white">$${(99 + i * 10).toFixed(2)}</span>
                  <button class="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/**
 * Generate dummy breadcrumbs HTML
 */
export function getDummyBreadcrumbsHTML(): string {
  return `
    <nav 
      data-dynamic-content="breadcrumbs" 
      data-gjs-editable="false" 
      data-gjs-droppable="false" 
      data-gjs-selectable="true" 
      data-gjs-removable="true" 
      data-gjs-hoverable="true"
      data-block-id="breadcrumbs-001"
      data-block-type="breadcrumbs"
      class="bg-gray-50 py-4"
      aria-label="Breadcrumb"
    >
      <div class="container mx-auto px-4">
        <ol class="flex items-center space-x-2 text-sm">
          <li><a href="/" class="text-gray-500 hover:text-blue-600 transition-colors">Home</a></li>
          <li><svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></li>
          <li><a href="/products" class="text-gray-500 hover:text-blue-600 transition-colors">Products</a></li>
          <li><svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></li>
          <li><span class="text-gray-900 font-medium">Category Name</span></li>
        </ol>
      </div>
    </nav>
  `;
}

/**
 * Generate dummy testimonials HTML
 */
export function getDummyTestimonialsHTML(): string {
  const testimonials = [
    { name: "Sarah Johnson", role: "Verified Customer", text: "Amazing quality and fast shipping! Highly recommend.", rating: 5 },
    { name: "Michael Chen", role: "Verified Customer", text: "Great customer service and excellent products.", rating: 5 },
    { name: "Emily Davis", role: "Verified Customer", text: "Best shopping experience I've had online!", rating: 5 },
  ];

  return `
    <section 
      data-dynamic-content="testimonials" 
      data-gjs-editable="false" 
      data-gjs-droppable="false" 
      data-gjs-selectable="true" 
      data-gjs-removable="true" 
      data-gjs-hoverable="true"
      data-block-id="testimonials-001"
      data-block-type="testimonials"
      class="py-16 bg-gray-50"
    >
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div class="grid md:grid-cols-3 gap-8">
          ${testimonials.map(t => `
            <div class="bg-white p-6 rounded-xl shadow-sm">
              <div class="flex items-center mb-4">
                ${'★'.repeat(t.rating).split('').map(() => '<span class="text-yellow-400">★</span>').join('')}
              </div>
              <p class="text-gray-700 mb-4 italic">"${t.text}"</p>
              <div>
                <p class="font-semibold text-gray-900">${t.name}</p>
                <p class="text-sm text-gray-500">${t.role}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/**
 * Get all dummy templates
 */
export function getAllDummyTemplates(companyName: string = "Your Store"): DummyTemplate[] {
  return [
    {
      id: 'menu',
      name: 'Navigation Menu',
      category: 'Navigation',
      html: getDummyMenuHTML(companyName),
      description: 'Main navigation menu with logo, links, cart, and account icons'
    },
    {
      id: 'footer',
      name: 'Footer',
      category: 'Navigation',
      html: getDummyFooterHTML(companyName),
      description: 'Site footer with links, contact info, and social media'
    },
    {
      id: 'categories',
      name: 'Categories Grid',
      category: 'Content',
      html: getDummyCategoriesHTML(),
      description: 'Grid display of product categories with icons'
    },
    {
      id: 'products',
      name: 'Products Grid',
      category: 'Content',
      html: getDummyProductsHTML(),
      description: 'Grid display of products with images, prices, and add to cart buttons'
    },
    {
      id: 'featured-products',
      name: 'Featured Products Slider',
      category: 'Content',
      html: getDummyFeaturedProductsHTML(),
      description: 'Horizontal slider showcasing featured products'
    },
    {
      id: 'breadcrumbs',
      name: 'Breadcrumbs',
      category: 'Navigation',
      html: getDummyBreadcrumbsHTML(),
      description: 'Breadcrumb navigation trail'
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      category: 'Content',
      html: getDummyTestimonialsHTML(),
      description: 'Customer testimonials and reviews'
    },
  ];
}
