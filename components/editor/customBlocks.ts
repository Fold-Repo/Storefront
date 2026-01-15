/**
 * Custom GrapeJS Blocks Registration
 * Registers custom blocks with Tailwind CSS styling
 */

export const registerCustomBlocks = (editor: any) => {
    const blockManager = editor.BlockManager;

    // Hero Section Block
    blockManager.add('hero-section', {
        label: 'Hero Section',
        category: 'Sections',
        content: `
      <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-4">Welcome to Our Store</h1>
          <p class="text-xl mb-8">Discover amazing products at great prices</p>
          <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Shop Now
          </button>
        </div>
      </section>
    `,
        attributes: { class: 'fa fa-star' }
    });

    // Feature Cards Block
    blockManager.add('feature-cards', {
        label: 'Feature Cards',
        category: 'Sections',
        content: `
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Our Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-lg text-center">
              <div class="text-blue-600 text-4xl mb-4">🚀</div>
              <h3 class="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p class="text-gray-600">Get your orders delivered quickly and safely</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg text-center">
              <div class="text-blue-600 text-4xl mb-4">💎</div>
              <h3 class="text-xl font-semibold mb-2">Premium Quality</h3>
              <p class="text-gray-600">Only the best products for our customers</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg text-center">
              <div class="text-blue-600 text-4xl mb-4">🔒</div>
              <h3 class="text-xl font-semibold mb-2">Secure Payment</h3>
              <p class="text-gray-600">Your transactions are safe and encrypted</p>
            </div>
          </div>
        </div>
      </section>
    `,
        attributes: { class: 'fa fa-th' }
    });

    // Product Grid Block
    blockManager.add('product-grid', {
        label: 'Product Grid',
        category: 'E-commerce',
        content: `
      <section class="py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">Product Name</h3>
                <p class="text-gray-600 text-sm mb-3">Brief product description</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-blue-600">$99</span>
                  <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">Product Name</h3>
                <p class="text-gray-600 text-sm mb-3">Brief product description</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-blue-600">$149</span>
                  <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">Product Name</h3>
                <p class="text-gray-600 text-sm mb-3">Brief product description</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-blue-600">$79</span>
                  <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">Product Name</h3>
                <p class="text-gray-600 text-sm mb-3">Brief product description</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-blue-600">$199</span>
                  <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
        attributes: { class: 'fa fa-shopping-cart' }
    });

    // Testimonial Section Block
    blockManager.add('testimonials', {
        label: 'Testimonials',
        category: 'Sections',
        content: `
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-blue-600 rounded-full mr-4"></div>
                <div>
                  <h4 class="font-semibold">John Doe</h4>
                  <p class="text-sm text-gray-600">Verified Customer</p>
                </div>
              </div>
              <p class="text-gray-700 italic">"Amazing products and excellent service! Highly recommended."</p>
              <div class="mt-4 text-yellow-500">★★★★★</div>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-blue-600 rounded-full mr-4"></div>
                <div>
                  <h4 class="font-semibold">Jane Smith</h4>
                  <p class="text-sm text-gray-600">Verified Customer</p>
                </div>
              </div>
              <p class="text-gray-700 italic">"Fast shipping and great quality. Will definitely order again!"</p>
              <div class="mt-4 text-yellow-500">★★★★★</div>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-blue-600 rounded-full mr-4"></div>
                <div>
                  <h4 class="font-semibold">Mike Johnson</h4>
                  <p class="text-sm text-gray-600">Verified Customer</p>
                </div>
              </div>
              <p class="text-gray-700 italic">"Best online shopping experience I've had. Five stars!"</p>
              <div class="mt-4 text-yellow-500">★★★★★</div>
            </div>
          </div>
        </div>
      </section>
    `,
        attributes: { class: 'fa fa-comments' }
    });

    // CTA Section Block
    blockManager.add('cta-section', {
        label: 'Call to Action',
        category: 'Sections',
        content: `
      <section class="bg-blue-600 text-white py-16">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p class="text-xl mb-8">Join thousands of satisfied customers today</p>
          <div class="flex gap-4 justify-center">
            <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Get Started
            </button>
            <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>
    `,
        attributes: { class: 'fa fa-bullhorn' }
    });

    // Footer Block
    blockManager.add('footer', {
        label: 'Footer',
        category: 'Sections',
        content: `
      <footer class="bg-gray-900 text-white py-12">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 class="text-xl font-bold mb-4">About Us</h3>
              <p class="text-gray-400">Your trusted online store for quality products.</p>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-4">Quick Links</h3>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white transition">Home</a></li>
                <li><a href="#" class="hover:text-white transition">Shop</a></li>
                <li><a href="#" class="hover:text-white transition">About</a></li>
                <li><a href="#" class="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-4">Customer Service</h3>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white transition">FAQ</a></li>
                <li><a href="#" class="hover:text-white transition">Shipping</a></li>
                <li><a href="#" class="hover:text-white transition">Returns</a></li>
                <li><a href="#" class="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-4">Newsletter</h3>
              <p class="text-gray-400 mb-4">Subscribe for updates and offers</p>
              <input type="email" placeholder="Your email" class="w-full px-4 py-2 rounded text-gray-900 mb-2">
              <button class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Subscribe
              </button>
            </div>
          </div>
          <div class="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Your Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `,
        attributes: { class: 'fa fa-bars' }
    });

    // Container Block
    blockManager.add('container', {
        label: 'Container',
        category: 'Layout',
        content: `<div class="container mx-auto px-4 py-8"></div>`,
        attributes: { class: 'fa fa-square-o' }
    });

    // Grid 2 Columns
    blockManager.add('grid-2-col', {
        label: '2 Columns',
        category: 'Layout',
        content: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 bg-gray-100 rounded">Column 1</div>
        <div class="p-4 bg-gray-100 rounded">Column 2</div>
      </div>
    `,
        attributes: { class: 'fa fa-columns' }
    });

    // Grid 3 Columns
    blockManager.add('grid-3-col', {
        label: '3 Columns',
        category: 'Layout',
        content: `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-4 bg-gray-100 rounded">Column 1</div>
        <div class="p-4 bg-gray-100 rounded">Column 2</div>
        <div class="p-4 bg-gray-100 rounded">Column 3</div>
      </div>
    `,
        attributes: { class: 'fa fa-th' }
    });

    // Button Block
    blockManager.add('button', {
        label: 'Button',
        category: 'Components',
        content: `
      <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
        Click Me
      </button>
    `,
        attributes: { class: 'fa fa-hand-pointer-o' }
    });

    // Card Block
    blockManager.add('card', {
        label: 'Card',
        category: 'Components',
        content: `
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm">
        <h3 class="text-xl font-bold mb-2">Card Title</h3>
        <p class="text-gray-600 mb-4">Card description goes here. Add your content.</p>
        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Learn More
        </button>
      </div>
    `,
        attributes: { class: 'fa fa-id-card-o' }
    });
};
