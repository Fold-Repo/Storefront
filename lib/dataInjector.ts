/**
 * Data Injector for Dynamic Content
 * 
 * Replaces placeholders in HTML with actual data from API calls
 */

interface SiteConfig {
  companyName: string;
  subdomain: string;
  theme: {
    primaryColor: string;
    fontFamily: string;
    designFeel: string;
  };
  logoUrl?: string;
}

interface DynamicData {
  menu?: any[];
  footerLinks?: any[];
  siteSettings?: Record<string, any>;
  products?: any[];
  product?: any;
  categories?: any[];
  category?: any;
  featuredProducts?: any[];
  relatedProducts?: any[];
  breadcrumbs?: any[];
  [key: string]: any;
}

/**
 * Inject dynamic data into HTML template
 */
export function injectDynamicData(
  html: string,
  data: DynamicData,
  config: SiteConfig
): string {
  let injected = html;

  // Inject site-wide data
  injected = injectSiteData(injected, config);

  // Inject menu
  if (data.menu) {
    injected = injectMenu(injected, data.menu);
  }

  // Inject footer links
  if (data.footerLinks) {
    injected = injectFooterLinks(injected, data.footerLinks);
  }

  // Inject products
  injected = injectProducts(injected, data.products || []);

  // Inject single product
  if (data.product) {
    injected = injectProduct(injected, data.product);
  }

  // Inject categories
  injected = injectCategories(injected, data.categories || []);

  // Inject category
  if (data.category) {
    injected = injectCategory(injected, data.category);
  }

  // Inject featured products
  injected = injectFeaturedProducts(injected, data.featuredProducts || []);

  // Inject related products
  injected = injectRelatedProducts(injected, data.relatedProducts || []);

  // Inject breadcrumbs
  injected = injectBreadcrumbs(injected, data.breadcrumbs);

  // Inject testimonials
  if (data.testimonials) {
    injected = injectTestimonials(injected, data.testimonials);
  }

  // Inject generic content (for custom pages)
  if (data.content) {
    injected = injectContent(injected, data.content);
  }

  // Inject any custom data
  Object.keys(data).forEach(key => {
    if (!['menu', 'footerLinks', 'products', 'product', 'categories', 'category', 'featuredProducts', 'relatedProducts', 'testimonials', 'content'].includes(key)) {
      injected = injectCustomData(injected, key, data[key]);
    }
  });

  return injected;
}

/**
 * Inject site-wide data (company name, logo, etc.)
 */
function injectSiteData(html: string, config: SiteConfig): string {
  let injected = html;

  // Replace placeholders
  injected = injected.replace(/\{\{companyName\}\}/g, config.companyName);
  injected = injected.replace(/\{\{primaryColor\}\}/g, config.theme.primaryColor);
  injected = injected.replace(/\{\{fontFamily\}\}/g, config.theme.fontFamily);

  if (config.logoUrl) {
    injected = injected.replace(/\{\{logoUrl\}\}/g, config.logoUrl);
  }

  return injected;
}

/**
 * Inject menu items
 */
function injectMenu(html: string, menu: any): string {
  const menuHTML = typeof menu === 'string' ? menu : generateMenuHTML(menu);

  // Try to replace placeholders first
  if (html.includes('{{menu}}') || html.includes('{{menuItems}}')) {
    html = html.replace(/\{\{\s*(menu|menuItems)\s*\}\}/g, menuHTML);
  } else {
    // If no placeholder, force inject at the top of body or top of string
    if (html.includes('<body')) {
      html = html.replace(/(<body[^>]*>)/i, `$1${menuHTML}`);
    } else {
      html = menuHTML + html;
    }
  }

  return html;
}

/**
 * Generate menu HTML from menu data
 */
function generateMenuHTML(menu: any[]): string {
  if (!menu || menu.length === 0) {
    return '<nav><ul></ul></nav>';
  }

  const items = menu.map(item => `
    <li>
      <a href="${item.url || '#'}" ${item.external ? 'target="_blank" rel="noopener"' : ''}>
        ${item.label || item.name}
      </a>
    </li>
  `).join('');

  return `
    <nav class="main-menu">
      <ul>
        ${items}
      </ul>
    </nav>
  `;
}

/**
 * Inject footer links
 */
function injectFooterLinks(html: string, footerLinks: any): string {
  const footerHTML = typeof footerLinks === 'string' ? footerLinks : generateFooterHTML(footerLinks);

  html = html.replace(/\{\{\s*footerLinks\s*\}\}/g, footerHTML);

  return html;
}

/**
 * Generate footer HTML from footer links data
 */
function generateFooterHTML(footerLinks: any[]): string {
  if (!footerLinks || footerLinks.length === 0) {
    return '';
  }

  const links = footerLinks.map(link => `
    <a href="${link.url || '#'}" ${link.external ? 'target="_blank" rel="noopener"' : ''}>
      ${link.label || link.name}
    </a>
  `).join('');

  return `<div class="footer-links">${links}</div>`;
}

/**
 * Inject products list
 */
function injectProducts(html: string, products: any[]): string {
  const productsHTML = generateProductsHTML(products);

  html = html.replace(/\{\{\s*products\s*\}\}/g, productsHTML);

  return html;
}

/**
 * Generate products HTML from products data
 */
function generateProductsHTML(products: any[]): string {
  if (!products || products.length === 0) {
    return '<div class="no-products py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl"><p class="text-gray-400 font-medium italic">No live products found in this category.</p></div>';
  }

  const items = products.map(product => {
    const productUrl = `/products/${product.slug || product.id}`;
    const productImage = product.image || '';
    const productPrice = product.price || '0.00';
    return `
    <div class="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col h-full" data-product-id="${product.id}">
      <div class="aspect-square bg-gray-50 relative overflow-hidden p-8">
        <a href="${productUrl}" class="block h-full">
          ${productImage ? `<img src="${productImage}" alt="${product.name}" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />` : ''}
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
        </a>
        <button 
          class="absolute bottom-6 left-6 right-6 translate-y-32 group-hover:translate-y-0 bg-gray-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2lx transition-all duration-500 hover:bg-blue-600 add-to-cart" 
          data-add-to-cart
          data-product-id="${product.id}"
          data-product-name="${product.name}"
          data-product-price="${productPrice}"
          data-product-image="${productImage}"
          data-product-sku="${product.sku || ''}"
        >
          Add to Cart
        </button>
      </div>
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <a href="${productUrl}" class="block group/title">
            <h3 class="font-black text-gray-900 text-base mb-2 group-hover/title:text-blue-600 transition-colors line-clamp-2 leading-tight uppercase tracking-tight">${product.name}</h3>
          </a>
          <p class="text-[12px] font-medium text-gray-400 mb-4 line-clamp-2 leading-relaxed">${product.description || ''}</p>
        </div>
        <div class="flex items-center justify-between mt-auto pt-5 border-t border-gray-50">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Price</span>
            <span class="text-2xl font-black text-gray-900 tracking-tighter">$${productPrice}</span>
          </div>
          <button 
            class="w-10 h-10 rounded-xl bg-gray-50 hover:bg-blue-600 hover:text-white flex items-center justify-center text-gray-400 transition-all duration-500"
            data-add-to-cart
            data-product-id="${product.id}"
            data-product-name="${product.name}"
            data-product-price="${productPrice}"
            data-product-image="${productImage}"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');

  return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 products-grid mb-10">${items}</div>`;
}

/**
 * Inject single product
 */
function injectProduct(html: string, product: any): string {
  if (!product) {
    return html;
  }

  // Replace product placeholders
  html = html.replace(/\{\{\s*product\.name\s*\}\}/g, product.name || '');
  html = html.replace(/\{\{\s*product\.price\s*\}\}/g, product.price || '0.00');
  html = html.replace(/\{\{\s*product\.description\s*\}\}/g, product.description || '');
  html = html.replace(/\{\{\s*product\.image\s*\}\}/g, product.image || '');

  return html;
}

/**
 * Inject categories
 */
function injectCategories(html: string, categories: any[]): string {
  const categoriesHTML = generateCategoriesHTML(categories);

  html = html.replace(/\{\{\s*categories\s*\}\}/g, categoriesHTML);

  return html;
}

/**
 * Generate categories HTML
 */
function generateCategoriesHTML(categories: any[]): string {
  if (!categories || categories.length === 0) {
    return '';
  }

  const items = categories.map(category => `
    <div class="category-card">
      <a href="/categories/${category.slug || category.id}">
        ${category.image ? `<img src="${category.image}" alt="${category.name}" />` : ''}
        <h3>${category.name}</h3>
      </a>
    </div>
  `).join('');

  return `<div class="categories-grid">${items}</div>`;
}

/**
 * Inject category
 */
function injectCategory(html: string, category: any): string {
  if (!category) {
    return html;
  }

  html = html.replace(/\{\{\s*category\.name\s*\}\}/g, category.name || '');
  html = html.replace(/\{\{\s*category\.description\s*\}\}/g, category.description || '');

  return html;
}

/**
 * Inject featured products
 */
function injectFeaturedProducts(html: string, products: any[]): string {
  if (!/\{\{\s*featuredProducts\s*\}\}/.test(html)) return html;

  const productsHTML = generateFeaturedSliderHTML(products);
  return html.replace(/\{\{\s*featuredProducts\s*\}\}/g, productsHTML);
}

/**
 * Generate a premium glassmorphic slider for featured products
 */
function generateFeaturedSliderHTML(products: any[]): string {
  if (!products || products.length === 0) {
    return '<div class="no-products py-20 text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl text-white"><p class="font-medium italic">Finding amazing items for you...</p></div>';
  }

  const sliderId = `slider-${Math.random().toString(36).substr(2, 9)}`;

  const items = products.map(product => `
    <div class="min-w-[280px] md:min-w-[320px] bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/20 group select-none" data-product-id="${product.id}">
      <div class="aspect-square rounded-2xl bg-white/5 flex items-center justify-center p-8 mb-6 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        ${product.image ? `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" />` : ''}
      </div>
      <div class="space-y-4 text-left">
        <h4 class="font-black text-white text-lg tracking-tight uppercase line-clamp-1 group-hover:text-blue-300 transition-colors">${product.name}</h4>
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Limited Deal</span>
            <span class="text-2xl font-black text-white tracking-tighter">$${product.price}</span>
          </div>
          <button class="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 add-to-cart" data-product-id="${product.id}">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="relative w-full group/slider">
      <!-- Navigation Buttons -->
      <button onclick="document.getElementById('${sliderId}').scrollBy({left: -350, behavior: 'smooth'})" class="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-2xl z-20 hover:bg-white hover:text-gray-900 transition-all opacity-0 group-hover/slider:opacity-100">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <button onclick="document.getElementById('${sliderId}').scrollBy({left: 350, behavior: 'smooth'})" class="absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-2xl z-20 hover:bg-white hover:text-gray-900 transition-all opacity-0 group-hover/slider:opacity-100">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
      </button>

      <!-- Slider Area -->
      <div id="${sliderId}" class="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pt-4 pb-12 px-4 md:px-0">
        ${items}
      </div>

      <style>
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        [data-product-id] { snap-align: start; }
      </style>
    </div>
  `;
}

/**
 * Inject related products
 */
function injectRelatedProducts(html: string, products: any[]): string {
  const productsHTML = generateProductsHTML(products);

  html = html.replace(/\{\{\s*relatedProducts\s*\}\}/g, productsHTML);

  return html;
}

/**
 * Inject testimonials
 */
function injectTestimonials(html: string, testimonials: any[]): string {
  const testimonialsHTML = generateTestimonialsHTML(testimonials);

  html = html.replace(/\{\{\s*testimonials\s*\}\}/g, testimonialsHTML);

  return html;
}

/**
 * Generate testimonials HTML
 */
function generateTestimonialsHTML(testimonials: any[]): string {
  if (!testimonials || testimonials.length === 0) {
    return '<div class="no-testimonials">No testimonials yet</div>';
  }

  const items = testimonials.map((testimonial, index) => `
    <div class="testimonial-card" data-testimonial-id="${testimonial.id || index}">
      ${testimonial.avatar ? `<img src="${testimonial.avatar}" alt="${testimonial.name || 'Customer'}" class="testimonial-avatar" />` : ''}
      <div class="testimonial-content">
        <p class="testimonial-text">"${testimonial.text || testimonial.content || testimonial.message || ''}"</p>
        <div class="testimonial-author">
          <strong>${testimonial.name || 'Anonymous'}</strong>
          ${testimonial.role ? `<span class="testimonial-role">${testimonial.role}</span>` : ''}
          ${testimonial.rating ? `<div class="testimonial-rating">${'★'.repeat(testimonial.rating)}</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  return `<div class="testimonials-grid">${items}</div>`;
}

/**
 * Inject generic content (for custom pages like about, contact)
 */
function injectContent(html: string, content: any): string {
  let contentHTML = '';

  if (typeof content === 'string') {
    // Simple string content
    contentHTML = `<div class="page-content">${content}</div>`;
  } else if (typeof content === 'object') {
    // Object with title, content, etc.
    if (content.title) {
      contentHTML += `<h1>${content.title}</h1>`;
    }
    if (content.content || content.text) {
      contentHTML += `<div class="page-content">${content.content || content.text}</div>`;
    }
    if (content.sections && Array.isArray(content.sections)) {
      contentHTML += content.sections.map((section: any) => `
        <section class="content-section">
          ${section.title ? `<h2>${section.title}</h2>` : ''}
          ${section.content ? `<div>${section.content}</div>` : ''}
        </section>
      `).join('');
    }
  }

  if (contentHTML) {
    html = html.replace(/\{\{\s*content\s*\}\}/g, contentHTML);
  }

  return html;
}

/**
 * Inject breadcrumbs
 */
function injectBreadcrumbs(html: string, breadcrumbs?: any[]): string {
  if (!/\{\{\s*breadcrumbs\s*\}\}/.test(html)) return html;

  const breadcrumbsHTML = generateBreadcrumbsHTML(breadcrumbs);
  return html.replace(/\{\{\s*breadcrumbs\s*\}\}/g, breadcrumbsHTML);
}

/**
 * Generate Breadcrumbs HTML
 * Provides static fallback if no data is provided
 */
function generateBreadcrumbsHTML(breadcrumbs?: any[]): string {
  const items = (breadcrumbs && breadcrumbs.length > 0)
    ? breadcrumbs
    : [
      { label: 'Home', url: '/' },
      { label: 'Shop', url: '/products' },
      { label: 'Category', url: '#' }
    ];

  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    const colorClass = isLast ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-blue-600';

    return `
      <li class="flex items-center">
        ${index > 0 ? `<svg class="w-4 h-4 mx-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>` : ''}
        ${isLast ? `
          <span class="${colorClass}">${item.label}</span>
        ` : `
          <a href="${item.url}" class="${colorClass} transition-colors">${item.label}</a>
        `}
      </li>
    `;
  }).join('');
}

/**
 * Inject custom data by key
 */
function injectCustomData(html: string, key: string, value: any): string {
  const placeholder = `{{${key}}}`;

  if (typeof value === 'string' || typeof value === 'number') {
    html = html.replace(new RegExp(placeholder, 'g'), String(value));
  } else if (Array.isArray(value)) {
    // For arrays, generate HTML (simplified)
    html = html.replace(new RegExp(placeholder, 'g'), JSON.stringify(value));
  } else if (typeof value === 'object') {
    // For objects, replace nested placeholders
    Object.keys(value).forEach(subKey => {
      const nestedPlaceholder = `{{${key}.${subKey}}}`;
      html = html.replace(new RegExp(nestedPlaceholder, 'g'), String(value[subKey] || ''));
    });
  }

  return html;
}
