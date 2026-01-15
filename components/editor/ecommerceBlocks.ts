/**
 * Custom E-commerce Blocks for GrapeJS
 * Reusable blocks with high-quality Tailwind CSS design
 */

export const customEcommerceBlocks = [
    // 1. Category Design
    {
        label: "Category Grid",
        category: "E-commerce",
        content: `
      <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-8 text-center text-gray-800">Shop by Category</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div class="flex flex-col items-center group cursor-pointer">
              <div class="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm">
                <img src="/assets/img/categories/electronics.png" alt="Electronics" class="w-12 h-12 object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3659/3659899.png'">
              </div>
              <span class="text-sm font-semibold text-gray-700 group-hover:text-blue-600">Electronics</span>
            </div>
            <div class="flex flex-col items-center group cursor-pointer">
              <div class="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors border border-pink-100 shadow-sm">
                <img src="/assets/img/categories/fashion.png" alt="Fashion" class="w-12 h-12 object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3050/3050239.png'">
              </div>
              <span class="text-sm font-semibold text-gray-700 group-hover:text-pink-600">Fashion</span>
            </div>
            <div class="flex flex-col items-center group cursor-pointer">
              <div class="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors border border-green-100 shadow-sm">
                <img src="/assets/img/categories/home.png" alt="Home" class="w-12 h-12 object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2544/2544111.png'">
              </div>
              <span class="text-sm font-semibold text-gray-700 group-hover:text-green-600">Home</span>
            </div>
            <div class="flex flex-col items-center group cursor-pointer">
              <div class="w-24 h-24 rounded-full bg-yellow-50 flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors border border-yellow-100 shadow-sm">
                <img src="/assets/img/categories/beauty.png" alt="Beauty" class="w-12 h-12 object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3163/3163212.png'">
              </div>
              <span class="text-sm font-semibold text-gray-700 group-hover:text-yellow-600">Beauty</span>
            </div>
             <div class="flex flex-col items-center group cursor-pointer">
              <div class="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors border border-purple-100 shadow-sm">
                <img src="/assets/img/categories/sports.png" alt="Sports" class="w-12 h-12 object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/857/857455.png'">
              </div>
              <span class="text-sm font-semibold text-gray-700 group-hover:text-purple-600">Sports</span>
            </div>
             <div class="flex flex-col items-center group cursor-pointer">
              <div class="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
                <img src="/assets/img/categories/toys.png" alt="Toys" class="w-12 h-12 object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3082/3082045.png'">
              </div>
              <span class="text-sm font-semibold text-gray-700 group-hover:text-indigo-600">Toys</span>
            </div>
          </div>
        </div>
      </section>
    `
    },
    // 2. Top Brands
    {
        label: "Top Brands",
        category: "E-commerce",
        content: `
      <section class="py-10 border-t border-b border-gray-100 bg-gray-50">
        <div class="container mx-auto px-4 text-center">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Our Top Trusted Brands</p>
          <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <img class="h-8 md:h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" alt="Nike">
            <img class="h-8 md:h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" src="https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" alt="Adidas">
            <img class="h-8 md:h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" src="https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg" alt="H&M">
            <img class="h-8 md:h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" src="https://upload.wikimedia.org/wikipedia/commons/9/94/Zara_Logo.svg" alt="Zara">
            <img class="h-8 md:h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Apple_logo_black.svg" alt="Apple">
          </div>
        </div>
      </section>
    `
    },
    // 3. Trending Products
    {
        label: "Trending Products",
        category: "E-commerce",
        content: `
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between mb-10">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Trending Now</h2>
              <p class="text-gray-500">The most popular items this month</p>
            </div>
            <a href="#" class="text-blue-600 font-semibold flex items-center gap-1 hover:underline">
              View All <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Product 1 -->
            <div class="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" alt="Product" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <span class="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Trending</span>
                <button class="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-20 group-hover:translate-y-0 bg-white text-gray-900 w-[80%] py-2 rounded-lg font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 21z"></path></svg> Add to Cart
                </button>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">Premium Wireless Watch</h3>
                  <p class="text-sm text-gray-500 mb-4 line-clamp-2">High-performance smartwatch with health tracking and GPS connectivity.</p>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-black text-gray-900">$299.99</span>
                  <div class="flex text-yellow-400">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span class="text-xs text-gray-400 ml-1 font-medium">(45)</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- More products can be added here with same structure -->
            <div class="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" alt="Product" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <button class="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-20 group-hover:translate-y-0 bg-white text-gray-900 w-[80%] py-2 rounded-lg font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 21z"></path></svg> Add to Cart
                </button>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">UltraBass Headphones</h3>
                  <p class="text-sm text-gray-500 mb-4 line-clamp-2">Noise-canceling over-ear headphones with 40-hour battery life.</p>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-black text-gray-900">$189.00</span>
                  <div class="flex text-yellow-400">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span class="text-xs text-gray-400 ml-1 font-medium">(128)</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" alt="Product" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <button class="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-20 group-hover:translate-y-0 bg-white text-gray-900 w-[80%] py-2 rounded-lg font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 21z"></path></svg> Add to Cart
                </button>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">SpeedRun Sport Shoes</h3>
                  <p class="text-sm text-gray-500 mb-4 line-clamp-2">Lightweight running shoes designed for ultimate speed and stability.</p>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-black text-gray-900">$125.50</span>
                  <div class="flex text-yellow-400">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span class="text-xs text-gray-400 ml-1 font-medium">(84)</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80" alt="Product" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <button class="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-20 group-hover:translate-y-0 bg-white text-gray-900 w-[80%] py-2 rounded-lg font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 21z"></path></svg> Add to Cart
                </button>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">Classic Aviators</h3>
                  <p class="text-sm text-gray-500 mb-4 line-clamp-2">Handcrafted sunglasses with UV400 protection and polarized lenses.</p>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-black text-gray-900">$75.00</span>
                  <div class="flex text-yellow-400">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span class="text-xs text-gray-400 ml-1 font-medium">(32)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `
    },
    // 4. Flash Sales
    {
        label: "Flash Sales",
        category: "E-commerce",
        content: `
      <section class="py-12 bg-gradient-to-r from-red-600 to-orange-500">
        <div class="container mx-auto px-4">
          <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="text-center md:text-left flex-1">
              <span class="inline-block bg-white text-red-600 text-xs font-black px-4 py-1 rounded-full mb-4 animate-pulse">FLASH SALE 🔥</span>
              <h2 class="text-4xl font-black text-white mb-4">Upto 70% Off!</h2>
              <p class="text-white/80 text-lg mb-6">Don't miss out on our biggest yearly clearance event.</p>
              <div class="flex items-center justify-center md:justify-start gap-4">
                 <div class="flex flex-col items-center">
                    <span class="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-red-600 font-black text-xl">12</span>
                    <span class="text-[10px] text-white/70 mt-1 uppercase">hrs</span>
                 </div>
                 <span class="text-2xl text-white font-bold">:</span>
                 <div class="flex flex-col items-center">
                    <span class="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-red-600 font-black text-xl">45</span>
                    <span class="text-[10px] text-white/70 mt-1 uppercase">min</span>
                 </div>
                 <span class="text-2xl text-white font-bold">:</span>
                 <div class="flex flex-col items-center">
                    <span class="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-red-600 font-black text-xl">22</span>
                    <span class="text-[10px] text-white/70 mt-1 uppercase">sec</span>
                 </div>
              </div>
            </div>
            <div class="flex-1 flex justify-center">
               <div class="relative group">
                  <div class="absolute -inset-4 bg-white/20 blur-2xl group-hover:bg-white/30 transition-all rounded-full"></div>
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" alt="Flash Sale Product" class="w-72 md:w-96 drop-shadow-2xl translate-z-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700">
               </div>
            </div>
            <div class="shrink-0">
               <button class="bg-white text-gray-900 px-10 py-4 rounded-xl font-black shadow-2xl hover:bg-gray-900 hover:text-white transition-all transform hover:scale-105">SHOP THE SALE</button>
            </div>
          </div>
        </div>
      </section>
    `
    },
    // 5. Product Carousel
    {
        label: "Product Carousel",
        category: "E-commerce",
        content: `
      <section class="py-16 bg-gray-50 overflow-hidden">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
             <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Handpicked with ❤️</h2>
             <div class="w-20 h-1.5 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div class="relative w-full max-w-5xl mx-auto">
            <!-- Navigation Buttons -->
            <button class="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white z-10 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button class="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white z-10 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
            </button>

            <!-- Product Display Area -->
            <div class="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-10">
              <!-- Item 1 -->
              <div class="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transform hover:-translate-y-2 transition-transform duration-300">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" class="w-full aspect-square object-contain mb-6 drop-shadow-lg" alt="Item">
                <div class="text-center">
                  <h4 class="font-bold text-lg text-gray-800">Air Zoom Pegasus 38</h4>
                  <p class="text-gray-400 text-sm mb-4">Unisex Running Shield</p>
                  <p class="text-2xl font-black text-indigo-600 mb-6">$120.00</p>
                  <button class="w-full py-3 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-900 border border-gray-100 font-bold rounded-xl transition-all">DETAILS</button>
                </div>
              </div>
              <div class="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transform hover:-translate-y-2 transition-transform duration-300">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" class="w-full aspect-square object-contain mb-6 drop-shadow-lg" alt="Item">
                <div class="text-center">
                  <h4 class="font-bold text-lg text-gray-800">Premium White Watch</h4>
                  <p class="text-gray-400 text-sm mb-4">Smart Lifestyle Gear</p>
                  <p class="text-2xl font-black text-indigo-600 mb-6">$299.00</p>
                  <button class="w-full py-3 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-900 border border-gray-100 font-bold rounded-xl transition-all">DETAILS</button>
                </div>
              </div>
              <div class="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transform hover:-translate-y-2 transition-transform duration-300">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" class="w-full aspect-square object-contain mb-6 drop-shadow-lg" alt="Item">
                <div class="text-center">
                  <h4 class="font-bold text-lg text-gray-800">Ultra High-Res Audio</h4>
                  <p class="text-gray-400 text-sm mb-4">Wireless Beats Experience</p>
                  <p class="text-2xl font-black text-indigo-600 mb-6">$189.00</p>
                  <button class="w-full py-3 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-900 border border-gray-100 font-bold rounded-xl transition-all">DETAILS</button>
                </div>
              </div>
            </div>

            <!-- Indicators -->
            <div class="flex justify-center gap-2 mt-4">
              <div class="w-8 h-2 bg-indigo-600 rounded-full transition-all"></div>
              <div class="w-2 h-2 bg-gray-300 rounded-full transition-all hover:bg-indigo-300"></div>
              <div class="w-2 h-2 bg-gray-300 rounded-full transition-all hover:bg-indigo-300"></div>
            </div>
          </div>
        </div>
      </section>
    `
    },
    // 5.2 Dynamic Live Product Grid
    {
        label: "Live Product Grid",
        category: "Dynamic Content",
        content: `
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between mb-10">
            <h2 class="text-3xl font-black text-gray-900 tracking-tight uppercase">Back-End Products</h2>
            <span class="px-4 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest">Live Sync Alpha</span>
          </div>
          {{products}}
        </div>
      </section>
    `
    },
    // 5.3 Dynamic Featured Products
    {
        label: "Live Featured Slider",
        category: "Dynamic Content",
        content: `
      <section class="py-16 bg-gray-900 overflow-hidden">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-black text-white tracking-tighter">FEATURED COLLECTIONS</h2>
            <p class="text-blue-400 font-bold text-sm tracking-widest mt-2 uppercase">Auto-populated from API</p>
          </div>
          {{featuredProducts}}
        </div>
      </section>
    `
    },
    // 6. Breadcrumb Design
    {
        label: "Breadcrumbs",
        category: "Breadcrumbs",
        content: `
      <nav class="flex py-4 bg-gray-50/50" aria-label="Breadcrumb">
        <div class="container mx-auto px-4 flex items-center space-x-1 md:space-x-3">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            {{breadcrumbs}}
          </ol>
        </div>
      </nav>
    `
    },
    // 6.2 Centered Minimalist Breadcrumb
    {
        label: "Minimalist Breadcrumb",
        category: "Breadcrumbs",
        content: `
      <nav class="flex justify-center py-6 bg-transparent" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2 text-xs uppercase tracking-widest font-bold">
          {{breadcrumbs}}
        </ol>
      </nav>
    `
    },
    // 6.3 Solid Brand Accent Breadcrumb
    {
        label: "Brand Accent Breadcrumb",
        category: "Breadcrumbs",
        content: `
      <nav class="bg-blue-600 py-3" aria-label="Breadcrumb">
        <div class="container mx-auto px-4 flex items-center justify-between">
          <ol class="flex items-center space-x-2 text-sm font-medium text-blue-100">
            {{breadcrumbs}}
          </ol>
          <span class="text-[10px] text-blue-200 font-bold hidden sm:block">FREE SHIPPING ON ALL ORDERS OVER $100</span>
        </div>
      </nav>
    `
    },
    // 6.4 Bordered Pill Breadcrumb
    {
        label: "Pill Style Breadcrumb",
        category: "Breadcrumbs",
        content: `
      <nav class="py-8 bg-white" aria-label="Breadcrumb">
        <div class="container mx-auto px-4">
          <ol class="flex flex-wrap items-center gap-2">
            {{breadcrumbs}}
          </ol>
        </div>
      </nav>
    `
    },
    // 6.5 Dark Glassmorphism Breadcrumb
    {
        label: "Glass Breadcrumb",
        category: "Breadcrumbs",
        content: `
      <section class="py-12 bg-gray-900 relative">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 opacity-70"></div>
        <div class="container mx-auto px-4 relative z-10">
          <nav class="inline-flex px-5 py-3 text-white border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl shadow-2xl" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-3">
              {{breadcrumbs}}
            </ol>
          </nav>
        </div>
      </section>
    `
    },
    // 7. Page Header (Jumbotron) Design
    {
        label: "Page Header",
        category: "Page Sections",
        content: `
      <section class="py-16 md:py-24 bg-gray-900 text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80')] bg-cover bg-center"></div>
        <div class="container mx-auto px-4 relative z-10 text-center">
          <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight">Our Story</h1>
          <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover the passion and purpose behind everything we do. We're committed to delivering excellence every single day.
          </p>
          <ol class="mt-8 flex justify-center items-center space-x-2 text-sm text-gray-400 font-medium">
             {{breadcrumbs}}
          </ol>
        </div>
      </section>
    `
    },
    // 7.2 Split Screen Header
    {
        label: "Split Image Header",
        category: "Page Sections",
        content: `
      <section class="bg-white overflow-hidden">
        <div class="flex flex-col md:flex-row">
          <div class="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center">
            <h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">Get in Touch <br><span class="text-blue-600">With Our Team</span></h1>
            <p class="text-gray-600 text-lg mb-8 max-w-md">Have questions? We're here to help you scaling your business to the next level with our expert support.</p>
            <ol class="flex items-center gap-4 text-sm font-bold text-gray-400">
               {{breadcrumbs}}
            </ol>
          </div>
          <div class="w-full md:w-1/2 h-[400px] md:h-auto bg-gray-100">
             <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80" alt="Team" class="w-full h-full object-cover">
          </div>
        </div>
      </section>
    `
    },
    // 7.3 Gradient Wave Header
    {
        label: "Wave Header",
        category: "Page Sections",
        content: `
      <section class="pt-20 pb-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 relative overflow-hidden">
        <div class="container mx-auto px-4 text-center pb-20">
          <h1 class="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">Our Services</h1>
          <p class="text-white/80 text-lg md:text-xl max-w-xl mx-auto font-medium">Empowering your vision with cutting-edge technology and innovative solutions.</p>
        </div>
        <div class="w-full leading-[0]">
          <svg class="relative block w-full h-[150px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.05,117,133.27,125.13,203,111.45,251.52,101.9,294,83.05,321.39,56.44Z" class="fill-white"></path>
          </svg>
        </div>
      </section>
    `
    },
    // 7.4 Minimalist Center Header
    {
        label: "Minimalist Header",
        category: "Page Sections",
        content: `
      <section class="py-20 bg-white border-b border-gray-100">
        <div class="container mx-auto px-4 text-center">
          <div class="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 transform rotate-3 hover:rotate-0 transition-transform shadow-xl">
             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h5m-5 4h5m-4-4h4m-4 4h4m-4-4h4m-4 4h4"></path></svg>
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight uppercase">Company Profile</h1>
          <div class="flex items-center justify-center gap-2 text-xs font-black text-blue-600 tracking-[0.2em] mb-6">
             <span>ESTABLISHED 2024</span>
             <span class="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
             <span>CERTIFIED PARTNER</span>
          </div>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto italic leading-relaxed">"Delivering value through integrity and innovation in every project we undertake."</p>
        </div>
      </section>
    `
    },
    // 7.5 Glass Overlay Header
    {
        label: "Glass Jumbotron",
        category: "Page Sections",
        content: `
      <section class="h-[500px] md:h-[600px] relative flex items-center justify-center overflow-hidden">
        <!-- Background Layer -->
        <div class="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80" class="w-full h-full object-cover scale-105" alt="Building">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>
        
        <!-- Content Card -->
        <div class="container mx-auto px-4 relative z-10">
          <div class="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-10 md:p-16 rounded-[40px] shadow-2xl text-center">
             <h1 class="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg leading-tight">Join Our <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Mission</span></h1>
             <p class="text-white/80 text-lg md:text-xl mb-10 max-w-lg mx-auto">Be part of the future of digital commerce. We're looking for passionate individuals to join our global team.</p>
             <div class="flex flex-wrap justify-center gap-4">
                <button class="px-8 py-3 bg-white text-gray-900 rounded-full font-bold shadow-xl hover:bg-gray-900 hover:text-white transition-all transform hover:scale-105 uppercase text-sm tracking-widest">Apply Now</button>
                <button class="px-8 py-3 bg-transparent border border-white/50 text-white rounded-full font-bold hover:bg-white/10 transition-all uppercase text-sm tracking-widest">View Roles</button>
             </div>
          </div>
        </div>
      </section>
    `
    },
    // Legacy Blocks
    {
        label: "Top NavBar",
        category: "NavBar",
        content: `<nav class="bg-brand p-2"><div class="container flex items-center flex-wrap gap-y-2 gap-x-3 justify-center"><img class="w-5 md:w-6" src="/assets/img/gift.svg" alt="Gift Box" loading="lazy"><p class="text-white text-[12px] md:text-xs">Special Offer: 50% off - limited time only</p><button class="btn btn-outline !border-border btn-sm !text-[12px] !py-1.5">Buy Now</button></div></nav>`
    },
    {
        label: "Hero Banner One",
        category: "Hero Banner",
        content: `<div class="flex items-center justify-center h-full min-h-[60vh] lg:min-h-[90vh] relative w-full bg-[url('/assets/img/banner/1.jpg')] bg-cover bg-center">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="container relative flex flex-col justify-center items-center gap-y-6 text-center">
            <h1 class="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-medium sm:leading-12 lg:leading-14 2xl:leading-[70px]">
                Discover Amazing Products, <br class="hidden md:block" /> Best Deals for You
            </h1>
            <p class="font-inter text-white text-sm md:text-base font-light tracking-wider">
                Explore our curated collection and find what you love
            </p>
            <button class="btn btn-brand text-white !px-12 rounded-lg">
                Shop Now
            </button>
        </div>
    </div>`
    }
];

/**
 * Register custom e-commerce blocks to GrapeJS editor
 */
export const registerEcommerceBlocks = (editor: any) => {
    const blockManager = editor.BlockManager;

    customEcommerceBlocks.forEach((block) => {
        blockManager.add(block.label.toLowerCase().replace(/\s+/g, '-'), {
            label: block.label,
            category: block.category,
            content: block.content,
            attributes: { class: 'fa fa-cube' }
        });
    });
};
