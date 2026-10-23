/**
 * متجر النخبة السعودي - AL-NUKHBAH STORE
 * Storefront JavaScript Controller & State Management
 */

const StoreApp = {
  currentView: 'home', // 'home' | 'category' | 'product' | 'checkout' | 'account' | 'page'
  activeCategory: null,
  activeProduct: null,
  activePageSlug: null,

  cart: [],
  wishlist: [],
  appliedCoupon: null,
  activePaymentMethod: 'mada',
  selectedReviewRating: 5,
  verifiedCustomer: null,

  init() {
    this.loadState();
    this.bindEvents();
    this.renderThemeSettings();
    this.handleRoute();
    this.startCountdown();

    // Listen to database changes from Admin or other tabs
    window.addEventListener('salla_db_changed', () => {
      this.renderThemeSettings();
      this.refreshCurrentView();
    });
  },

  loadState() {
    try {
      this.cart = JSON.parse(localStorage.getItem('salla_cart') || '[]');
      this.wishlist = JSON.parse(localStorage.getItem('salla_wishlist') || '[]');
      this.appliedCoupon = JSON.parse(localStorage.getItem('salla_coupon') || 'null');
    } catch (e) {
      this.cart = [];
      this.wishlist = [];
      this.appliedCoupon = null;
    }
    this.updateCartBadges();
    this.updateWishlistBadges();
  },

  saveState() {
    localStorage.setItem('salla_cart', JSON.stringify(this.cart));
    localStorage.setItem('salla_wishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('salla_coupon', JSON.stringify(this.appliedCoupon));
    this.updateCartBadges();
    this.updateWishlistBadges();
    this.renderCartDrawer();
  },

  renderThemeSettings() {
    const data = window.DB.getAllData();
    const theme = data.theme || {};
    const settings = data.settings || {};

    // Apply primary colors to CSS variables
    if (theme.primaryColor) {
      document.documentElement.style.setProperty('--primary', theme.primaryColor);
    }
    if (theme.secondaryColor) {
      document.documentElement.style.setProperty('--secondary', theme.secondaryColor);
    }

    // Announcement bar
    const bar = document.getElementById('announcementBar');
    if (bar) {
      if (theme.announcementBar && theme.announcementBar.enabled) {
        bar.style.display = 'flex';
        document.getElementById('announcementText').textContent = theme.announcementBar.text;
      } else {
        bar.style.display = 'none';
      }
    }

    // Store identity
    const brandTitles = document.querySelectorAll('.store-name-text');
    brandTitles.forEach(el => el.textContent = settings.storeName || 'متجر النخبة السعودي');
    
    const brandSlogans = document.querySelectorAll('.store-slogan-text');
    brandSlogans.forEach(el => el.textContent = settings.storeSlogan || 'وجهتكم الأولى للمنتجات الفاخرة');

    // Categories in sub-nav
    this.renderNavCategories();
  },

  renderNavCategories() {
    const categories = window.DB.get('categories') || [];
    const container = document.getElementById('categoriesNavList');
    if (!container) return;

    let html = `
      <a href="#home" class="cat-link ${!this.activeCategory ? 'active' : ''}" onclick="StoreApp.navigateTo('home')">
        <i class="fa-solid fa-house"></i> الرئيسية
      </a>
    `;

    categories.forEach(cat => {
      const isActive = this.activeCategory === cat.id;
      html += `
        <a href="#category/${cat.id}" class="cat-link ${isActive ? 'active' : ''}" onclick="StoreApp.showCategory('${cat.id}')">
          <i class="fa-solid ${cat.icon || 'fa-tag'}"></i> ${cat.name}
        </a>
      `;
    });

    container.innerHTML = html;
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && searchDropdown && !searchDropdown.contains(e.target)) {
          searchDropdown.classList.remove('active');
        }
      });
    }

    // Listen to hash changes for deep linking
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const parts = hash.split('/');

    if (parts[0] === 'category') {
      this.showCategory(parts[1]);
    } else if (parts[0] === 'product') {
      this.showProduct(parts[1]);
    } else if (parts[0] === 'checkout') {
      this.showCheckout();
    } else if (parts[0] === 'account') {
      this.showAccount();
    } else if (parts[0] === 'page') {
      this.showPage(parts[1]);
    } else {
      this.showHome();
    }
  },

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  refreshCurrentView() {
    if (this.currentView === 'home') this.renderHome();
    else if (this.currentView === 'category') this.renderCategoryView();
    else if (this.currentView === 'product') this.renderProductView();
  },

  /* ================= Views ================= */
  showHome() {
    this.activeCategory = null;
    this.activeProduct = null;
    this.switchView('home');
    this.renderNavCategories();
    this.renderHome();
  },

  renderHome() {
    const data = window.DB.getAllData();
    const products = data.products || [];
    const categories = data.categories || [];
    const theme = data.theme || {};

    // Hero slides
    const sliderContainer = document.getElementById('heroSliderContainer');
    if (sliderContainer && theme.heroSlides && theme.heroSlides.length > 0) {
      let slidesHtml = '';
      let dotsHtml = '';
      theme.heroSlides.forEach((slide, idx) => {
        slidesHtml += `
          <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            <img src="${slide.image}" alt="${slide.title}" class="hero-slide-bg">
            <div class="hero-content">
              ${slide.badge ? `<span class="hero-badge"><i class="fa-solid fa-crown"></i> ${slide.badge}</span>` : ''}
              <h2 class="hero-title">${slide.title}</h2>
              <p class="hero-subtitle">${slide.subtitle || ''}</p>
              <a href="${slide.buttonLink || '#products'}" class="btn-primary" onclick="StoreApp.scrollToProducts()">
                ${slide.buttonText || 'تسوق الآن'} <i class="fa-solid fa-arrow-left"></i>
              </a>
            </div>
          </div>
        `;
        dotsHtml += `<div class="slider-dot ${idx === 0 ? 'active' : ''}" onclick="StoreApp.jumpToSlide(${idx})"></div>`;
      });
      sliderContainer.innerHTML = slidesHtml + (theme.heroSlides.length > 1 ? `<div class="slider-controls">${dotsHtml}</div>` : '');
      this.currentSlideIndex = 0;
      this.startHeroSliderAutoplay();
    }

    // Categories Grid
    const catGrid = document.getElementById('categoriesGrid');
    if (catGrid) {
      catGrid.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="StoreApp.showCategory('${cat.id}')">
          <img src="${cat.image}" alt="${cat.name}" class="cat-card-bg">
          <div class="cat-card-content">
            <h3>${cat.name}</h3>
            <p>${cat.description || ''}</p>
          </div>
        </div>
      `).join('');
    }

    // Best Sellers
    const bestSellersGrid = document.getElementById('bestSellersGrid');
    if (bestSellersGrid) {
      const best = products.filter(p => p.status === 'published' && p.isBestSeller);
      bestSellersGrid.innerHTML = (best.length ? best : products.slice(0, 4))
        .map(p => this.renderProductCard(p)).join('');
    }

    // Flash Deals Grid & Section Settings
    const flashSection = document.getElementById('flashDealsSection');
    const flashConfig = theme.flashDeals || {
      enabled: theme.sections ? theme.sections.showFlashDeals !== false : true,
      title: 'تخفيضات كبرى تنتهي قريباً',
      badge: 'عروض الصاعقة الحصرية',
      showTimer: true,
      mode: 'auto',
      productIds: []
    };

    if (flashSection) {
      if (flashConfig.enabled === false) {
        flashSection.style.display = 'none';
      } else {
        flashSection.style.display = 'block';

        const titleEl = document.getElementById('flashDealsTitle');
        if (titleEl) titleEl.textContent = flashConfig.title || 'تخفيضات كبرى تنتهي قريباً';

        const badgeEl = document.getElementById('flashDealsBadge');
        if (badgeEl) badgeEl.innerHTML = `<i class="fa-solid fa-bolt"></i> ${flashConfig.badge || 'عروض الصاعقة الحصرية'}`;

        const timerEl = document.getElementById('flashDealsTimer');
        if (timerEl) {
          timerEl.style.display = (flashConfig.showTimer === false) ? 'none' : 'flex';
        }

        const flashGrid = document.getElementById('flashDealsGrid');
        if (flashGrid) {
          let deals = [];
          if (flashConfig.mode === 'manual' && flashConfig.productIds && flashConfig.productIds.length > 0) {
            deals = products.filter(p => p.status === 'published' && flashConfig.productIds.includes(p.id));
          } else {
            deals = products.filter(p => p.status === 'published' && p.regularPrice > p.salePrice);
          }
          if (deals.length === 0) {
            deals = products.slice(0, 4);
          }
          flashGrid.innerHTML = deals.map(p => this.renderProductCard(p)).join('');
        }
      }
    }

    // New Arrivals Grid
    const newArrivalsGrid = document.getElementById('newArrivalsGrid');
    if (newArrivalsGrid) {
      const newItems = products.filter(p => p.status === 'published' && p.isNew);
      newArrivalsGrid.innerHTML = (newItems.length ? newItems : products.slice(0, 4))
        .map(p => this.renderProductCard(p)).join('');
    }

    // Reviews Testimonials
    const reviewsGrid = document.getElementById('testimonialsGrid');
    if (reviewsGrid) {
      const reviews = window.DB.get('reviews') || [];
      reviewsGrid.innerHTML = reviews.filter(r => r.isApproved).map(r => `
        <div class="trust-card" style="flex-direction:column; align-items:flex-start; gap:12px;">
          <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
            <div style="font-weight:800; color:var(--primary); font-size:1.05rem;">
              <i class="fa-solid fa-circle-check" style="color:#10b981;"></i> ${r.authorName}
            </div>
            <div style="color:#f59e0b; font-size:0.9rem;">
              ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
            </div>
          </div>
          <p style="color:var(--text-main); font-size:0.92rem; line-height:1.6;">"${r.comment}"</p>
          <span style="font-size:0.78rem; color:var(--text-light);">${r.date}</span>
        </div>
      `).join('');
    }
  },

  renderProductCard(product) {
    const isWish = this.wishlist.some(id => id === product.id);
    const hasSale = product.salePrice !== null && product.salePrice !== undefined && Number(product.salePrice) > 0 && Number(product.salePrice) < Number(product.regularPrice);
    const currentPrice = hasSale ? Number(product.salePrice) : Number(product.regularPrice);
    const discountPercent = hasSale
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : 0;

    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image-wrap" onclick="StoreApp.showProduct('${product.id}')">
          <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
          ${product.isBundle ? `<span class="product-badge" style="background:#b45309;"><i class="fa-solid fa-gift"></i> باقة ترويجية</span>` : product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          ${discountPercent > 0 ? `<span class="product-badge" style="right:auto; left:14px; background:#ef4444;">خصم ${discountPercent}%</span>` : ''}
          <button class="wishlist-btn ${isWish ? 'active' : ''}" onclick="event.stopPropagation(); StoreApp.toggleWishlist('${product.id}')" title="المفضلة">
            <i class="${isWish ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
        </div>
        <div class="product-body">
          <span class="product-category">${product.categoryName || 'منتج فاخر'}</span>
          <h3 class="product-title" onclick="StoreApp.showProduct('${product.id}')">${product.name}</h3>
          <div class="product-rating">
            ${(product.reviewsCount > 0 && product.rating > 0) ? `
              <span style="color:#d97706; font-weight:800;">★ ${Number(product.rating).toFixed(1)}</span>
              <span class="rating-count">(${product.reviewsCount} تقييم)</span>
            ` : `
              <span style="color:var(--text-muted); font-size:0.75rem;">
                <i class="fa-regular fa-star" style="color:#94a3b8;"></i> لا توجد تقييمات (0)
              </span>
            `}
          </div>
          <div class="product-price-row">
            <span class="current-price">${currentPrice} <span class="currency">ر.س</span></span>
            ${hasSale ? `<span class="regular-price">${product.regularPrice} ر.س</span>` : ''}
          </div>
          <button class="add-cart-btn" onclick="StoreApp.quickAddToCart('${product.id}')">
            <i class="fa-solid fa-cart-plus"></i> ${product.isBundle ? 'أضف الباقة للسلة' : 'أضف للسلة'}
          </button>
        </div>
      </div>
    `;
  },

  showCategory(categoryId) {
    if (!categoryId || categoryId === 'all' || categoryId === 'null') {
      this.activeCategory = null;
    } else {
      this.activeCategory = categoryId;
    }
    window.location.hash = this.activeCategory ? `category/${this.activeCategory}` : 'category/all';
    this.switchView('category');
    this.renderNavCategories();
    this.renderCategoryView();
  },

  renderCategoryView() {
    const isAll = !this.activeCategory || this.activeCategory === 'all' || this.activeCategory === 'null';
    const category = isAll ? null : window.DB.find('categories', this.activeCategory);
    const products = window.DB.get('products') || [];
    const container = document.getElementById('categoryProductsGrid');
    const headerTitle = document.getElementById('categoryViewTitle');
    const headerDesc = document.getElementById('categoryViewDesc');

    const publishedProducts = products.filter(p => p.status === 'published');

    if (category) {
      if (headerTitle) headerTitle.textContent = category.name;
      if (headerDesc) headerDesc.textContent = category.description || '';
    } else {
      if (headerTitle) headerTitle.textContent = 'كافة منتجات المتجر';
      if (headerDesc) headerDesc.textContent = `تصفح التشكيلة الكاملة من كافة الأقسام والتصنيفات في متجر النخبة (${publishedProducts.length} منتج متوفر)`;
    }

    const filtered = isAll
      ? publishedProducts
      : products.filter(p => p.categoryId === this.activeCategory && p.status === 'published');

    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px;">
            <i class="fa-solid fa-box-open" style="font-size: 3rem; color: var(--text-light); margin-bottom: 16px;"></i>
            <h3>لا توجد منتجات متوفرة حالياً في هذا القسم</h3>
            <p style="color:var(--text-muted); margin-top:8px;">يرجى تصفح باقي الأقسام أو العودة للرئيسية</p>
          </div>
        `;
      } else {
        container.innerHTML = filtered.map(p => this.renderProductCard(p)).join('');
      }
    }
  },

  showProduct(productId) {
    this.activeProduct = productId;
    window.location.hash = `product/${productId}`;
    this.switchView('product');
    this.renderProductView();
  },

  renderProductView() {
    const product = window.DB.find('products', this.activeProduct);
    if (!product) {
      this.showHome();
      return;
    }

    this.selectedVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    this.selectedQty = 1;

    // Title & details
    document.getElementById('pdpTitle').textContent = product.name;
    document.getElementById('pdpCategoryName').textContent = product.categoryName || '';
    const ratingEl = document.getElementById('pdpRating');
    if (ratingEl) {
      if (product.reviewsCount > 0 && product.rating > 0) {
        ratingEl.innerHTML = `<span style="color:#f59e0b;">★</span> ${Number(product.rating).toFixed(1)} <span style="color:var(--text-muted); font-size:0.85rem;">(${product.reviewsCount} تقييم موثق)</span>`;
      } else {
        ratingEl.innerHTML = `<span style="color:#94a3b8;"><i class="fa-regular fa-star"></i> لا توجد تقييمات بعد (0 تقييم)</span>`;
      }
    }
    
    // Price
    const hasSale = this.selectedVariant
      ? (this.selectedVariant.regularPrice > this.selectedVariant.price)
      : (product.salePrice !== null && product.salePrice !== undefined && Number(product.salePrice) > 0 && Number(product.salePrice) < Number(product.regularPrice));
    const currentPrice = this.selectedVariant
      ? this.selectedVariant.price
      : (hasSale ? product.salePrice : product.regularPrice);
    const regPrice = this.selectedVariant ? this.selectedVariant.regularPrice : product.regularPrice;
    document.getElementById('pdpCurrentPrice').textContent = currentPrice;
    const regPriceEl = document.getElementById('pdpRegPrice');
    if (regPriceEl) {
      if (hasSale && regPrice > currentPrice) {
        regPriceEl.textContent = `${regPrice} ر.س`;
        regPriceEl.style.display = 'inline';
      } else {
        regPriceEl.style.display = 'none';
      }
    }

    // Bundle lookup & stock calculations
    const bundles = window.DB.get('bundles') || [];
    const bundle = product.isBundle ? bundles.find(b => b.productId === product.id || b.id === product.id) : null;
    let availableBundles = null;
    if (bundle || product.isBundle) {
      availableBundles = window.InventoryEngine.calculateAvailableBundles(bundle || product);
    }

    const effectiveStock = (bundle || product.isBundle) ? availableBundles : (this.selectedVariant ? this.selectedVariant.stock : product.stock);
    const stockBox = document.getElementById('pdpStockBox');
    const addToCartBtn = document.getElementById('pdpAddToCartBtn');
    const buyNowBtn = document.getElementById('pdpBuyNowBtn');

    if (stockBox) {
      if (bundle || product.isBundle) {
        const remainingOffer = bundle ? bundle.remainingOfferQty : (product.remainingOfferQty !== undefined ? product.remainingOfferQty : product.stock);
        const bundleAvailable = Math.min(
          effectiveStock !== null && effectiveStock !== undefined ? effectiveStock : 999,
          remainingOffer !== null && remainingOffer !== undefined ? remainingOffer : 999
        );
        if (bundleAvailable <= 0) {
          stockBox.className = 'stock-alert-box low-stock';
          stockBox.style.background = '#fef2f2';
          stockBox.style.color = '#ef4444';
          stockBox.style.border = '1px solid #fecaca';
          stockBox.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> عذراً، نفدت كمية العرض أو نفد مخزون الباقة حالياً!`;
          if (addToCartBtn) addToCartBtn.disabled = true;
          if (buyNowBtn) buyNowBtn.disabled = true;
        } else if (bundleAvailable <= 5) {
          stockBox.className = 'stock-alert-box low-stock';
          stockBox.style.background = '#fff7ed';
          stockBox.style.color = '#c2410c';
          stockBox.style.border = '1px solid #fed7aa';
          stockBox.innerHTML = `<i class="fa-solid fa-fire"></i> عرض ترويجي محدود: سارع بالطلب! متبقي ${bundleAvailable} باقات فقط`;
          if (addToCartBtn) addToCartBtn.disabled = false;
          if (buyNowBtn) buyNowBtn.disabled = false;
        } else {
          stockBox.className = 'stock-alert-box in-stock';
          stockBox.style.background = '#fff7ed';
          stockBox.style.color = '#c2410c';
          stockBox.style.border = '1px solid #fed7aa';
          stockBox.innerHTML = `<i class="fa-solid fa-fire"></i> عرض ترويجي متاح - متوفر في المخزون (جاهز للشحن الفوري)`;
          if (addToCartBtn) addToCartBtn.disabled = false;
          if (buyNowBtn) buyNowBtn.disabled = false;
        }
      } else {
        if (effectiveStock <= 0) {
          stockBox.className = 'stock-alert-box low-stock';
          stockBox.style.background = '#fef2f2';
          stockBox.style.color = '#ef4444';
          stockBox.style.border = '1px solid #fecaca';
          stockBox.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> نفدت الكمية من المخزون حالياً`;
          if (addToCartBtn) addToCartBtn.disabled = true;
          if (buyNowBtn) buyNowBtn.disabled = true;
        } else if (effectiveStock <= 5) {
          stockBox.className = 'stock-alert-box low-stock';
          stockBox.style.background = '#fffbeb';
          stockBox.style.color = '#b45309';
          stockBox.style.border = '1px solid #fde68a';
          stockBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> سارع بالطلب! متبقي ${effectiveStock} قطع فقط في المخزون`;
          if (addToCartBtn) addToCartBtn.disabled = false;
          if (buyNowBtn) buyNowBtn.disabled = false;
        } else {
          stockBox.className = 'stock-alert-box in-stock';
          stockBox.style.background = '';
          stockBox.style.color = '';
          stockBox.style.border = '';
          stockBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> متوفر في المخزون (جاهز للشحن الفوري)`;
          if (addToCartBtn) addToCartBtn.disabled = false;
          if (buyNowBtn) buyNowBtn.disabled = false;
        }
      }
    }

    // Main Image & Gallery
    const mainImg = document.getElementById('pdpMainImg');
    if (mainImg) mainImg.src = product.image;

    const thumbnails = document.getElementById('pdpThumbnails');
    if (thumbnails) {
      const gallery = product.gallery || [product.image];
      thumbnails.innerHTML = gallery.map((imgUrl, i) => `
        <div class="thumbnail-item ${i === 0 ? 'active' : ''}" onclick="StoreApp.setMainImage('${imgUrl}', this)">
          <img src="${imgUrl}" alt="${product.name}">
        </div>
      `).join('');
    }

    // Variants & Bundle Components builder
    const variantsContainer = document.getElementById('pdpVariantsContainer');
    if (variantsContainer) {
      if (bundle && Array.isArray(bundle.components) && bundle.components.length > 0) {
        variantsContainer.innerHTML = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:16px;">
            <div style="font-weight:800; font-size:0.95rem; color:#0f172a; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <i class="fa-solid fa-boxes-packing" style="color:var(--primary);"></i> محتويات ومكونات الباقة الأصلية (${bundle.components.length} منتجات):
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${bundle.components.map(comp => `
                <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${comp.productImage || 'assets/images/product_oud.jpg'}" alt="${comp.productName}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
                    <div>
                      <strong style="font-size:0.88rem; color:#1e293b; display:block;">${comp.productName}</strong>
                      <span style="font-size:0.75rem; color:#64748b;">الكمية بالباقة: ${comp.quantity || 1} قطعة | السعر الفردي: ${comp.regularPrice} ر.س</span>
                    </div>
                  </div>
                  <span style="background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:6px; font-weight:800; font-size:0.75rem;">
                    مشمول بالباقة ✅
                  </span>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:12px; font-size:0.78rem; color:#b45309; background:#fffbeb; padding:8px 12px; border-radius:6px; border:1px solid #fde68a;">
              <i class="fa-solid fa-circle-info"></i> ${bundle.isReturnable ? `الباقة قابلة للاسترجاع بالكامل فقط خلال ${bundle.returnDays || 14} يوماً من الاستلام.` : 'هذه الباقة الترويجية غير خاضعة للاسترجاع وفق شروط العرض.'}
            </div>
          </div>
        `;
      } else if (product.variants && product.variants.length > 0) {
        variantsContainer.innerHTML = `
          <label class="variant-label">اختر المقاس / اللون / الخيار:</label>
          <div class="variant-options">
            ${product.variants.map((v, i) => {
              let stockBadge = '';
              if (v.stock <= 0) {
                stockBadge = '<span style="font-weight:700; color:#ef4444;">نفدت الكمية</span>';
              } else if (v.stock <= 5) {
                stockBadge = `<span style="font-weight:700; color:#ef4444;">متبقي ${v.stock} فقط</span>`;
              } else {
                stockBadge = '<span style="font-weight:700; color:var(--admin-primary);">متوفر</span>';
              }
              return `
                <div class="variant-pill ${i === 0 ? 'active' : ''}" data-variant-id="${v.id}" onclick="StoreApp.selectVariant('${v.id}')">
                  ${v.title} (${v.price} ر.س) - ${stockBadge}
                </div>
              `;
            }).join('')}
          </div>
        `;
        if (product.variants.length > 0) {
          this.selectVariant(product.variants[0].id);
        }
      } else {
        variantsContainer.innerHTML = '';
      }
    }

    // Description & Specs
    document.getElementById('pdpDescriptionText').textContent = product.description || '';
    const specsList = document.getElementById('pdpSpecsList');
    if (specsList && product.specs) {
      specsList.innerHTML = product.specs.map(s => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-color);">
          <strong style="color:var(--text-muted);">${s.label}</strong>
          <span>${s.value}</span>
        </div>
      `).join('');
    }

    // Related Products
    const relatedGrid = document.getElementById('relatedProductsGrid');
    if (relatedGrid) {
      const all = window.DB.get('products') || [];
      const rel = all.filter(p => p.id !== product.id && p.categoryId === product.categoryId);
      relatedGrid.innerHTML = (rel.length ? rel : all.slice(0, 4)).map(p => this.renderProductCard(p)).join('');
    }

    // Customer Reviews & Ratings
    this.renderProductReviews(product.id);
  },

  selectVariant(variantId) {
    const product = window.DB.find('products', this.activeProduct);
    if (!product || !product.variants) return;
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return;

    this.selectedVariant = variant;
    document.getElementById('pdpCurrentPrice').textContent = variant.price;
    document.getElementById('pdpSku').textContent = variant.sku;

    // Update active pill
    document.querySelectorAll('.variant-pill').forEach(pill => {
      if (pill.getAttribute('data-variant-id') === variantId) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update stock alert and buy buttons
    const stockBox = document.getElementById('pdpStockBox');
    const addToCartBtn = document.getElementById('pdpAddToCartBtn');
    const buyNowBtn = document.getElementById('pdpBuyNowBtn');

    if (variant.stock <= 0) {
      if (stockBox) {
        stockBox.className = 'stock-alert-box low-stock';
        stockBox.style.background = '#fef2f2';
        stockBox.style.color = '#ef4444';
        stockBox.style.border = '1px solid #fecaca';
        stockBox.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> نفدت الكمية لهذا المقاس/الخيار حالياً (${variant.title})`;
      }
      if (addToCartBtn) {
        addToCartBtn.disabled = true;
        addToCartBtn.style.opacity = '0.5';
      }
      if (buyNowBtn) {
        buyNowBtn.disabled = true;
        buyNowBtn.style.opacity = '0.5';
      }
    } else if (variant.stock <= 5) {
      if (stockBox) {
        stockBox.className = 'stock-alert-box low-stock';
        stockBox.style.background = '#fffbeb';
        stockBox.style.color = '#b45309';
        stockBox.style.border = '1px solid #fde68a';
        stockBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> سارع بالطلب! متبقي ${variant.stock} قطع فقط لهذا المقاس/الخيار (${variant.title})`;
      }
      if (addToCartBtn) {
        addToCartBtn.disabled = false;
        addToCartBtn.style.opacity = '1';
      }
      if (buyNowBtn) {
        buyNowBtn.disabled = false;
        buyNowBtn.style.opacity = '1';
      }
    } else {
      if (stockBox) {
        stockBox.className = 'stock-alert-box in-stock';
        stockBox.style.background = '';
        stockBox.style.color = '';
        stockBox.style.border = '';
        stockBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> متوفر في المخزون (جاهز للشحن الفوري)`;
      }
      if (addToCartBtn) {
        addToCartBtn.disabled = false;
        addToCartBtn.style.opacity = '1';
      }
      if (buyNowBtn) {
        buyNowBtn.disabled = false;
        buyNowBtn.style.opacity = '1';
      }
    }

    // Sync selected quantity with new variant stock
    const qtyDisplay = document.getElementById('pdpQtyDisplay');
    if (variant.stock <= 0) {
      this.selectedQty = 0;
      if (qtyDisplay) qtyDisplay.textContent = '0';
    } else {
      if (this.selectedQty > variant.stock) {
        this.selectedQty = variant.stock;
      } else if (this.selectedQty < 1) {
        this.selectedQty = 1;
      }
      if (qtyDisplay) qtyDisplay.textContent = this.selectedQty;
    }
  },

  setMainImage(url, elem) {
    const mainImg = document.getElementById('pdpMainImg');
    if (mainImg) mainImg.src = url;
    document.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
    if (elem) elem.classList.add('active');
  },

  changePdpQty(delta) {
    const qtyDisplay = document.getElementById('pdpQtyDisplay');
    let current = parseInt(qtyDisplay.textContent) || 1;
    const product = window.DB.find('products', this.activeProduct);
    
    const bundles = window.DB.get('bundles') || [];
    const bundle = product && product.isBundle ? bundles.find(b => b.productId === product.id || b.id === product.id) : null;
    let maxStock = 0;
    if (bundle || (product && product.isBundle)) {
      const availBundles = window.InventoryEngine ? window.InventoryEngine.calculateAvailableBundles(bundle || product) : (product.stock || 0);
      const remOffer = bundle ? bundle.remainingOfferQty : (product.remainingOfferQty !== undefined ? product.remainingOfferQty : product.stock);
      maxStock = Math.min(availBundles !== null && availBundles !== undefined ? availBundles : 0, remOffer !== null && remOffer !== undefined ? remOffer : 0);
    } else {
      maxStock = this.selectedVariant ? parseInt(this.selectedVariant.stock, 10) : (product ? parseInt(product.stock, 10) : 0);
    }

    if (maxStock <= 0) {
      this.selectedQty = 0;
      qtyDisplay.textContent = 0;
      this.showToast('عذراً، نفدت الكمية من هذا المنتج أو الخيار حالياً', 'warning');
      return;
    }

    if (delta > 0 && current >= maxStock) {
      if (maxStock <= 5) {
        this.showToast(`الكمية المحددة هي الحد الأقصى المتوفر في المخزون (${maxStock} فقط)`, 'warning');
      } else {
        this.showToast('عذراً، لقد وصلت إلى الحد الأقصى للكمية المتاحة للطلب حالياً', 'warning');
      }
      return;
    }

    current += delta;
    if (current < 1) current = 1;
    if (current > maxStock) current = maxStock;

    this.selectedQty = current;
    qtyDisplay.textContent = current;
  },

  addToCartFromPdp() {
    const product = window.DB.find('products', this.activeProduct);
    if (!product) return;
    if (window.Auth && !window.Auth.isLoggedIn()) {
      window.Auth.promptLogin({
        type: 'add_to_cart',
        payload: {
          productId: product.id,
          variantId: this.selectedVariant ? this.selectedVariant.id : null,
          qty: this.selectedQty || 1
        }
      }, 'يرجى تسجيل الدخول أو إنشاء حساب جديد لإضافة المنتج إلى السلة ومتابعة التسوق');
      return;
    }
    this.addToCart(product, this.selectedVariant, this.selectedQty);
    this.openCartDrawer();
  },

  buyNowFromPdp() {
    const product = window.DB.find('products', this.activeProduct);
    if (!product) return;
    if (window.Auth && !window.Auth.isLoggedIn()) {
      window.Auth.promptLogin({
        type: 'buy_now',
        payload: {
          productId: product.id,
          variantId: this.selectedVariant ? this.selectedVariant.id : null,
          qty: this.selectedQty || 1
        }
      }, 'يرجى تسجيل الدخول أو إنشاء حساب جديد لإتمام الشراء');
      return;
    }
    this.addToCart(product, this.selectedVariant, this.selectedQty);
    this.showCheckout();
  },

  /* ================= Cart Operations ================= */
  quickAddToCart(productId) {
    if (window.Auth && !window.Auth.isLoggedIn()) {
      window.Auth.promptLogin({
        type: 'add_to_cart',
        payload: { productId, variantId: null, qty: 1 }
      }, 'يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة ومتابعة التسوق');
      return;
    }
    const product = window.DB.find('products', productId);
    if (!product) return;
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    this.addToCart(product, defaultVariant, 1);
  },

  addToCart(product, variant, qty = 1) {
    if (window.Auth && !window.Auth.isLoggedIn()) {
      window.Auth.promptLogin({
        type: 'add_to_cart',
        payload: {
          productId: product.id,
          variantId: variant ? variant.id : null,
          qty
        }
      }, 'يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة ومتابعة التسوق');
      return;
    }
    if (!variant && product.variants && product.variants.length > 0) {
      variant = product.variants.find(v => v.stock >= qty) || product.variants[0];
    }
    const variantId = variant ? variant.id : 'default';
    const variantTitle = variant ? variant.title : '';
    const price = variant ? variant.price : (product.salePrice !== null && product.salePrice !== undefined && Number(product.salePrice) > 0 ? product.salePrice : product.regularPrice);
    const sku = variant ? variant.sku : product.sku;
    const availableStock = variant ? variant.stock : product.stock;

    if (availableStock <= 0) {
      this.showToast(`عذراً، المنتج "${product.name} ${variantTitle}" نفد من المخزون`, 'error');
      return;
    }

    const existingIndex = this.cart.findIndex(i => i.productId === product.id && i.variantId === variantId);
    const currentQtyInCart = existingIndex > -1 ? this.cart[existingIndex].quantity : 0;

    if (currentQtyInCart + qty > availableStock) {
      if (availableStock <= 5) {
        this.showToast(`عذراً، الكمية المتبقية بالمخزون هي ${availableStock} قطع فقط. تم الوصول للحد الأقصى.`, 'error');
      } else {
        this.showToast('عذراً، لا يمكن إضافة كمية أكبر من المتوفر حالياً بالمخزون. تم الوصول للحد الأقصى.', 'error');
      }
      return;
    }

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += qty;
    } else {
      this.cart.push({
        productId: product.id,
        variantId,
        variantTitle,
        size: variant ? (variant.size || '') : '',
        color: variant ? (variant.color || '') : '',
        name: product.name,
        image: product.image,
        price,
        sku,
        quantity: qty,
        isBundle: product.isBundle || product.productType === 'bundle' || false,
        isReturnable: product.isReturnable !== false,
        returnDays: product.returnDays !== undefined ? product.returnDays : 14
      });
    }

    this.saveState();
    this.showToast(`تمت إضافة "${product.name}${variantTitle ? ' (' + variantTitle + ')' : ''}" إلى سلتك 🛍️`, 'success');
  },

  updateCartQty(index, delta) {
    if (!this.cart[index]) return;
    const item = this.cart[index];

    if (delta > 0) {
      const product = window.DB.find('products', item.productId);
      let availableStock = 999;
      if (product) {
        if (item.variantId && item.variantId !== 'default' && product.variants) {
          const v = product.variants.find(va => va.id === item.variantId);
          availableStock = v ? parseInt(v.stock, 10) : 0;
        } else {
          availableStock = parseInt(product.stock, 10) || 0;
        }
      }

      if (item.quantity + delta > availableStock) {
        if (availableStock <= 5) {
          this.showToast(`عذراً، أقصى كمية متوفرة في المخزون هي ${availableStock} قطع فقط ولا يمكن طلب المزيد`, 'error');
        } else {
          this.showToast('عذراً، تم الوصول إلى الحد الأقصى المتوفر بالمخزون لهذا المنتج ولا يمكن إضافة المزيد', 'error');
        }
        return;
      }
    }

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart.splice(index, 1);
      this.showToast('تم حذف المنتج من السلة', 'info');
    }
    this.saveState();
  },

  removeFromCart(index) {
    if (!this.cart[index]) return;
    this.cart.splice(index, 1);
    this.saveState();
    this.showToast('تم حذف المنتج من السلة', 'info');
  },

  updateCartBadges() {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  updateWishlistBadges() {
    const count = this.wishlist.length;
    const badges = document.querySelectorAll('.wishlist-count-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  toggleWishlist(productId) {
    const idx = this.wishlist.indexOf(productId);
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      this.showToast('تمت إزالة المنتج من المفضلة', 'info');
    } else {
      this.wishlist.push(productId);
      this.showToast('تمت إضافة المنتج للمفضلة ❤️', 'success');
    }
    this.saveState();
    this.refreshCurrentView();
  },

  calculateTotals() {
    const settings = window.DB.get('settings') || {};
    const freeThreshold = settings.freeShippingThreshold || 350;
    const vatRate = settings.vatRate || 0.15;

    let subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.type === 'percent') {
        discount = (subtotal * this.appliedCoupon.value) / 100;
      } else {
        discount = this.appliedCoupon.value;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const isFreeShipping = discountedSubtotal >= freeThreshold;
    const shippingCost = isFreeShipping || subtotal === 0 ? 0 : 28;

    // VAT is calculated on final amount
    const vatAmount = (discountedSubtotal + shippingCost) * (vatRate / (1 + vatRate));
    const grandTotal = discountedSubtotal + shippingCost;

    return {
      subtotal,
      discount,
      discountedSubtotal,
      shippingCost,
      isFreeShipping,
      freeThreshold,
      vatAmount,
      grandTotal
    };
  },

  renderCartDrawer() {
    const container = document.getElementById('cartDrawerItems');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 60px 20px;">
          <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color:var(--text-light); margin-bottom:16px;"></i>
          <h4 style="font-weight:800; margin-bottom:8px;">سلة التسوق فارغة</h4>
          <p style="color:var(--text-muted); font-size:0.9rem;">تفضل بتصفح منتجاتنا المميزة وأضف ما يعجبك</p>
        </div>
      `;
    } else {
      container.innerHTML = this.cart.map((item, index) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            ${item.variantTitle ? `<div class="cart-item-variant">${item.variantTitle}</div>` : ''}
            <div class="cart-item-price">${item.price} ر.س</div>
          </div>
          <div class="qty-control">
            <button class="qty-btn" onclick="StoreApp.updateCartQty(${index}, -1)">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="StoreApp.updateCartQty(${index}, 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="StoreApp.removeFromCart(${index})" title="حذف">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `).join('');
    }

    // Totals & Progress Bar
    const totals = this.calculateTotals();
    const progressFill = document.getElementById('freeShippingFill');
    const progressText = document.getElementById('freeShippingText');

    if (progressFill && progressText) {
      if (totals.isFreeShipping) {
        progressFill.style.width = '100%';
        progressText.innerHTML = `🎉 مبروك! حصلت على <strong>شحن مجاني</strong> لكافة مدن المملكة!`;
      } else {
        const remaining = Math.max(0, totals.freeThreshold - totals.subtotal);
        const percent = Math.min(100, (totals.subtotal / totals.freeThreshold) * 100);
        progressFill.style.width = `${percent}%`;
        progressText.innerHTML = `أضف بـ <strong>${remaining.toFixed(2)} ر.س</strong> أخرى للحصول على شحن مجاني 🚚`;
      }
    }

    // Numbers in Drawer
    document.getElementById('cartDrawerSubtotal').textContent = `${totals.subtotal.toFixed(2)} ر.س`;
    document.getElementById('cartDrawerDiscount').textContent = `-${totals.discount.toFixed(2)} ر.س`;
    document.getElementById('cartDrawerShipping').textContent = totals.shippingCost === 0 ? 'مجاني' : `${totals.shippingCost} ر.س`;
    document.getElementById('cartDrawerVat').textContent = `${totals.vatAmount.toFixed(2)} ر.س`;
    document.getElementById('cartDrawerTotal').textContent = `${totals.grandTotal.toFixed(2)} ر.س`;
  },

  openCartDrawer() {
    this.renderCartDrawer();
    document.getElementById('cartDrawerBackdrop').classList.add('active');
    document.getElementById('cartDrawer').classList.add('active');
  },

  closeCartDrawer() {
    document.getElementById('cartDrawerBackdrop').classList.remove('active');
    document.getElementById('cartDrawer').classList.remove('active');
  },

  applyCouponCode() {
    const input = document.getElementById('couponCodeInput');
    const code = input.value.trim().toUpperCase();
    if (!code) return;

    const coupons = window.DB.get('coupons') || [];
    const found = coupons.find(c => c.code === code && c.isActive);

    if (!found) {
      this.showToast('كوبون الخصم غير صحيح أو منتهي الصلاحية', 'error');
      return;
    }

    const totals = this.calculateTotals();
    if (totals.subtotal < found.minOrder) {
      this.showToast(`الحد الأدنى لتطبيق هذا الكوبون هو ${found.minOrder} ر.س`, 'warning');
      return;
    }

    this.appliedCoupon = found;
    this.saveState();
    this.showToast(`تم تطبيق الكوبون (${found.code}) بنجاح! 🎉`, 'success');
  },

  /* ================= Checkout & Orders ================= */
  getActiveCustomerPhone() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    if (user && user.phone) return String(user.phone).trim();
    if (user && user.email) return String(user.email).trim().toLowerCase();
    const inputEl = document.getElementById('checkoutCustPhone');
    if (inputEl && inputEl.value && inputEl.value.trim()) return inputEl.value.trim();
    return 'guest_wallet';
  },

  getActiveCustomerInfo() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    if (user) {
      return {
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        city: 'Ø§Ù„Ø±ÙŠØ§Ø¶',
        address: ''
      };
    }
    return {
      name: '',
      phone: '',
      email: '',
      city: 'Ø§Ù„Ø±ÙŠØ§Ø¶',
      address: ''
    };
  },
  showCheckout() {
    this.closeCartDrawer();
    if (this.cart.length === 0) {
      this.showToast('سلة التسوق فارغة، يرجى إضافة منتجات أولاً', 'warning');
      this.showHome();
      return;
    }
    this.switchView('checkout');

    // Pre-fill customer fields from active customer info
    const info = this.getActiveCustomerInfo();
    const nameInput = document.getElementById('checkoutCustName');
    const phoneInput = document.getElementById('checkoutCustPhone');
    const cityInput = document.getElementById('checkoutCustCity');
    const addrInput = document.getElementById('checkoutCustAddress');

    if (nameInput && !nameInput.value.trim()) nameInput.value = info.name;
    if (phoneInput) {
      if (!phoneInput.value.trim()) phoneInput.value = info.phone;
      if (!phoneInput.dataset.boundPhoneSync) {
        phoneInput.dataset.boundPhoneSync = 'true';
        phoneInput.addEventListener('input', () => {
          const val = phoneInput.value.trim();
          if (val) {
            localStorage.setItem('salla_customer_phone', val);
          }
          this.renderCheckoutSummary();
        });
      }
    }
    if (cityInput && !cityInput.value) cityInput.value = info.city;
    if (addrInput && !addrInput.value.trim()) addrInput.value = info.address;

    this.renderCheckoutSummary();
  },

  renderCheckoutSummary() {
    const totals = this.calculateTotals();
    const itemsList = document.getElementById('checkoutItemsList');
    if (itemsList) {
      itemsList.innerHTML = this.cart.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${item.image}" style="width:44px; height:44px; border-radius:8px; object-fit:cover;">
            <div>
              <div style="font-weight:700; font-size:0.92rem;">${item.name}</div>
              <div style="font-size:0.78rem; color:var(--text-muted);">${item.variantTitle || ''} × ${item.quantity}</div>
            </div>
          </div>
          <span style="font-weight:800;">${(item.price * item.quantity).toFixed(2)} ر.س</span>
        </div>
      `).join('');
    }

    const subtotalEl = document.getElementById('checkoutSubtotal');
    if (subtotalEl) subtotalEl.textContent = `${totals.subtotal.toFixed(2)} ر.س`;
    const discEl = document.getElementById('checkoutDiscount');
    if (discEl) discEl.textContent = `-${totals.discount.toFixed(2)} ر.س`;
    const shipEl = document.getElementById('checkoutShipping');
    if (shipEl) shipEl.textContent = totals.shippingCost === 0 ? 'مجاني' : `${totals.shippingCost} ر.س`;
    const vatEl = document.getElementById('checkoutVat');
    if (vatEl) vatEl.textContent = `${totals.vatAmount.toFixed(2)} ر.س`;
    const grandEl = document.getElementById('checkoutGrandTotal');
    if (grandEl) grandEl.textContent = `${totals.grandTotal.toFixed(2)} ر.س`;

    // Update wallet checkout balance display using active customer phone
    const custPhone = this.getActiveCustomerPhone();
    const wallet = window.DB.getWallet(custPhone);
    const balanceText = document.getElementById('checkoutWalletBalanceText');
    if (balanceText) balanceText.textContent = (wallet ? wallet.balance : 0).toFixed(2);
    if (this.activePaymentMethod === 'wallet') {
      this.updateWalletCheckoutReadout();
    }
  },

  selectPaymentMethod(method, elem) {
    document.querySelectorAll('.payment-card-option').forEach(c => c.classList.remove('active'));
    if (elem) elem.classList.add('active');
    this.activePaymentMethod = method;

    const cardBox = document.getElementById('cardPaymentFormBox');
    if (cardBox) {
      cardBox.style.display = (method === 'mada' || method === 'credit_card') ? 'block' : 'none';
    }

    const walletBox = document.getElementById('walletPaymentInfoBox');
    if (walletBox) {
      walletBox.style.display = (method === 'wallet') ? 'block' : 'none';
      if (method === 'wallet') {
        this.updateWalletCheckoutReadout();
      }
    }
  },

  updateWalletCheckoutReadout() {
    const custPhone = this.getActiveCustomerPhone();
    const wallet = window.DB.getWallet(custPhone);
    const totals = this.calculateTotals();
    const balance = wallet ? wallet.balance : 0;
    
    const balanceEl = document.getElementById('walletCheckoutAvailBalance');
    if (balanceEl) balanceEl.textContent = `${balance.toFixed(2)} ر.س`;

    const indicator = document.getElementById('walletSufficiencyIndicator');
    if (indicator) {
      if (balance >= totals.grandTotal) {
        const remaining = balance - totals.grandTotal;
        indicator.innerHTML = `<span style="color:#059669; font-weight:800;"><i class="fa-solid fa-circle-check"></i> رصيدك كافٍ لإتمام الطلب ✅ (المتبقي بعد الدفع: ${remaining.toFixed(2)} ر.س)</span>`;
      } else {
        const diff = totals.grandTotal - balance;
        indicator.innerHTML = `<span style="color:#dc2626; font-weight:800;"><i class="fa-solid fa-circle-xmark"></i> رصيد المحفظة غير كافٍ ❌ (ينقصك ${diff.toFixed(2)} ر.س)</span>`;
      }
    }
  },

  processOrder() {
    const name = document.getElementById('checkoutCustName').value.trim();
    const phone = document.getElementById('checkoutCustPhone').value.trim();
    const city = document.getElementById('checkoutCustCity').value;
    const address = document.getElementById('checkoutCustAddress').value.trim();

    if (!name || !phone || !city || !address) {
      this.showToast('يرجى تعبئة جميع بيانات الشحن والتوصيل المطلوبة', 'error');
      return;
    }

    if (!phone.startsWith('05') || phone.length !== 10) {
      this.showToast('يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 ويتكون من 10 أرقام', 'warning');
      return;
    }

    // Validate Stock Availability & Prevent Overselling
    const validation = window.InventoryEngine.validateStockAvailability(this.cart);
    if (!validation.valid) {
      this.showToast(validation.message, 'error');
      alert('عذراً: ' + validation.message);
      return;
    }

    // Wallet Payment Processing
    if (this.activePaymentMethod === 'wallet') {
      const totals = this.calculateTotals();
      const debitRes = window.DB.debitWallet(phone || 'default', totals.grandTotal, `شراء طلب من المتجر`, 'ORD-PENDING');
      if (!debitRes.success) {
        this.showToast(debitRes.message || 'رصيد المحفظة الحالي غير كافٍ لسداد هذا الطلب.', 'error');
        alert(debitRes.message || 'عذراً: رصيد المحفظة غير كافٍ لإتمام الشراء.');
        return;
      }
      const walletTxId = debitRes.transaction ? debitRes.transaction.id : ('TX-W-' + Date.now());
      this.finalizeOrderCreation(name, phone, city, address, walletTxId);
      return;
    }

    const isCard = this.activePaymentMethod === 'mada' || this.activePaymentMethod === 'credit_card';

    if (isCard) {
      const cardNum = (document.getElementById('checkoutCardNumber').value || '').replace(/\s+/g, '');
      const cardName = (document.getElementById('checkoutCardName').value || '').trim();
      const cardExpiry = (document.getElementById('checkoutCardExpiry').value || '').trim();
      const cardCvv = (document.getElementById('checkoutCardCvv').value || '').trim();

      if (!cardNum || cardNum.length < 16 || !this.luhnCheck(cardNum)) {
        this.showToast('يرجى إدخال رقم بطاقة صحيح (16 رقماً) ومطابق لمعايير التحقق البنكي (Luhn Check)', 'error');
        const numInput = document.getElementById('checkoutCardNumber');
        if (numInput) {
          numInput.focus();
          numInput.style.borderColor = '#ef4444';
        }
        return;
      }

      if (!cardName || cardName.length < 3) {
        this.showToast('يرجى إدخال اسم حامل البطاقة المطبوع عليها', 'error');
        document.getElementById('checkoutCardName').focus();
        return;
      }

      if (!cardExpiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        this.showToast('يرجى إدخال تاريخ انتهاء البطاقة بالصيغة الصحيحة (شهر/سنة مثلاً 12/28)', 'error');
        document.getElementById('checkoutCardExpiry').focus();
        return;
      }

      // Check card expiration
      const parts = cardExpiry.split('/');
      const expMonth = parseInt(parts[0], 10);
      const expYear = parseInt('20' + parts[1], 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        this.showToast('عذراً، البطاقة منتهية الصلاحية. يرجى استخدام بطاقة سارية المفعول', 'error');
        return;
      }

      if (!cardCvv || cardCvv.length !== 3) {
        this.showToast('يرجى إدخال رمز الأمان (CVV) المكون من 3 أرقام خلف البطاقة', 'error');
        document.getElementById('checkoutCardCvv').focus();
        return;
      }

      // Show Bank 3D-Secure Processing Modal & Balance Simulation
      const authModal = document.getElementById('madaAuthModal');
      const procState = document.getElementById('madaModalProcessingState');
      const succState = document.getElementById('madaModalSuccessState');
      const declState = document.getElementById('madaModalDeclineState');

      if (authModal) {
        authModal.classList.add('active');
        if (procState) procState.style.display = 'block';
        if (succState) succState.style.display = 'none';
        if (declState) declState.style.display = 'none';
      }

      // Insufficient Funds simulation (test card ending with 0000)
      const isInsufficientFunds = cardNum.endsWith('0000');
      const totals = this.calculateTotals();

      setTimeout(() => {
        if (isInsufficientFunds) {
          if (procState) procState.style.display = 'none';
          if (declState) declState.style.display = 'block';
          const decEl = document.getElementById('madaModalDeclineMsg');
          if (decEl) {
            decEl.textContent = `عذراً، تم رفض العملية من قِبل البنك المصدر للبطاقة. البطاقة لا تحتوي على رصيد كافٍ لتغطية إجمالي الطلب المطلوب (${totals.grandTotal.toFixed(2)} ر.س). كود الاستجابة البنكية: 51 - Insufficient Funds.`;
          }
          return;
        }

        // Succeeded
        if (procState) procState.style.display = 'none';
        if (succState) succState.style.display = 'block';
        const txId = 'TX-MADA-' + Math.floor(1000000 + Math.random() * 9000000);
        const succEl = document.getElementById('madaModalSuccessMsg');
        if (succEl) {
          succEl.innerHTML = `تم التحقق من رصيد البطاقة وخصم مبلغ <strong>${totals.grandTotal.toFixed(2)} ر.س</strong> بنجاح عبر شبكة مدى واستلامه في حساب المتجر.<br><small style="color:var(--text-muted);">رقم المرجع البنكي المعتمد: ${txId}</small>`;
        }

        setTimeout(() => {
          if (authModal) authModal.classList.remove('active');
          this.finalizeOrderCreation(name, phone, city, address, txId);
        }, 1200);
      }, 1200);

      return;
    }

    // Direct non-card checkout (Apple Pay, COD, etc.)
    this.finalizeOrderCreation(name, phone, city, address, null);
  },

  finalizeOrderCreation(name, phone, city, address, txId) {
    const totals = this.calculateTotals();
    const orderNumber = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const orderDate = new Date().toISOString();

    const lat = document.getElementById('checkoutLocationLat') ? document.getElementById('checkoutLocationLat').value : '24.713600';
    const lng = document.getElementById('checkoutLocationLng') ? document.getElementById('checkoutLocationLng').value : '46.675300';

    const isCod = this.activePaymentMethod === 'cod';

    const activeUser = window.Auth ? window.Auth.getCurrentUser() : null;
    const newOrder = {
      id: 'ord-' + Date.now(),
      orderNumber,
      date: orderDate,
      userId: activeUser ? activeUser.id : ('usr-guest-' + Date.now()),
      userEmail: activeUser ? activeUser.email.toLowerCase() : (document.getElementById('checkoutCustEmail') ? document.getElementById('checkoutCustEmail').value.trim().toLowerCase() : ''),
      customer: {
        name: name || (activeUser ? activeUser.name : 'Ø¹Ù…ÙŠÙ„ Ù…ØªØ¬Ø± Ø§Ù„Ù†Ø®Ø¨Ø©'),
        phone: phone || (activeUser ? activeUser.phone : ''),
        email: (activeUser && activeUser.email) ? activeUser.email : (document.getElementById('checkoutCustEmail') ? document.getElementById('checkoutCustEmail').value.trim() : `${phone}@customer.sa`),
        city,
        address
      },
      locationCoords: {
        latitude: lat,
        longitude: lng,
        googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
      },
      items: [...this.cart],
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingCost: totals.shippingCost,
      vatAmount: totals.vatAmount,
      total: totals.grandTotal,
      couponCode: this.appliedCoupon ? this.appliedCoupon.code : null,
      orderStatus: 'جديد',
      paymentStatus: isCod ? 'بانتظار الدفع' : 'مدفوع',
      shippingStatus: 'لم يجهز',
      paymentMethod: this.activePaymentMethod === 'wallet' ? 'المحفظة الرقمية (Wallet)' :
                     this.activePaymentMethod === 'mada' ? 'مدى (Mada)' : 
                     this.activePaymentMethod === 'credit_card' ? 'بطاقة ائتمانية (Visa / MasterCard)' :
                     this.activePaymentMethod === 'apple_pay' ? 'Apple Pay' :
                     this.activePaymentMethod === 'tamara' ? 'تمارا' : 'الدفع عند الاستلام',
      paymentGatewayTxId: txId || null,
      shippingMethod: 'سمسا إكسبريس (SMSA Express)',
      trackingNumber: 'SMSA-' + Math.floor(100000000 + Math.random() * 900000000),
      notes: document.getElementById('checkoutOrderNotes').value.trim(),
      stockDeducted: false,
      stockRestored: false
    };

    // Save to Database
    window.DB.insert('orders', newOrder);

    // Atomic Stock Deduction via InventoryEngine
    const deductResult = window.InventoryEngine.deductOrderStock(newOrder.id, 'storefront_checkout');
    if (!deductResult.success && !deductResult.alreadyDeducted) {
      this.showToast('عذراً: ' + deductResult.message, 'error');
      alert(deductResult.message);
      return;
    }

    // Update coupon usage count
    if (this.appliedCoupon) {
      const coupons = window.DB.get('coupons') || [];
      const cp = coupons.find(c => c.id === this.appliedCoupon.id || c.code === this.appliedCoupon.code);
      if (cp) {
        cp.usedCount = (cp.usedCount || 0) + 1;
        window.DB.update('coupons', cp.id, cp);
      }
    }

    // Update or insert customer
    const customers = window.DB.get('customers') || [];
    const custIndex = customers.findIndex(c => c.phone === phone);
    if (custIndex > -1) {
      customers[custIndex].totalOrders = (customers[custIndex].totalOrders || 0) + 1;
      customers[custIndex].totalSpent = (customers[custIndex].totalSpent || 0) + newOrder.total;
      window.DB.update('customers', customers[custIndex].id, customers[custIndex]);
    } else {
      window.DB.insert('customers', {
        id: 'cust-' + Date.now(),
        name,
        phone,
        email: newOrder.customer.email,
        city,
        totalOrders: 1,
        totalSpent: newOrder.total,
        registeredAt: new Date().toISOString().split('T')[0]
      });
    }

    // Clear cart
    this.cart = [];
    this.appliedCoupon = null;
    this.saveState();

    // Render Order Confirmation
    this.renderOrderSuccess(newOrder);
  },

  /* ================= Product Reviews & Ratings (Verified Buyers Only) ================= */
  renderProductReviews(productId) {
    const reviewsList = document.getElementById('pdpReviewsList');
    if (!reviewsList) return;

    const reviews = window.DB.getProductReviews(productId) || [];
    const count = reviews.length;
    let avg = 0;

    if (count > 0) {
      const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      avg = Math.round((sum / count) * 10) / 10;
    }

    // Update Average Score & Stars
    const scoreEl = document.getElementById('pdpAvgRatingScore');
    const starsEl = document.getElementById('pdpAvgRatingStars');
    const countEl = document.getElementById('pdpTotalReviewsCountText');

    if (scoreEl) scoreEl.textContent = count > 0 ? avg.toFixed(1) : '0.0';
    if (countEl) countEl.textContent = count > 0 ? `بناءً على ${count} تقييم موثق` : 'لا توجد تقييمات لهذا المنتج بعد';

    if (starsEl) {
      if (count === 0) {
        starsEl.innerHTML = Array.from({ length: 5 }, () => 
          `<i class="fa-regular fa-star" style="color:#cbd5e1;"></i>`
        ).join('');
      } else {
        const fullStars = Math.round(avg);
        starsEl.innerHTML = Array.from({ length: 5 }, (_, i) => 
          `<i class="fa-solid fa-star" style="color:${i < fullStars ? '#f59e0b' : '#cbd5e1'};"></i>`
        ).join('');
      }
    }

    // Update breakdown bars
    for (let star = 5; star >= 1; star--) {
      const starReviews = reviews.filter(r => Math.round(parseFloat(r.rating) || 5) === star);
      const pct = count > 0 ? Math.round((starReviews.length / count) * 100) : 0;
      const fillEl = document.getElementById(`barFill${star}`);
      const pctEl = document.getElementById(`barPct${star}`);
      if (fillEl) fillEl.style.width = `${pct}%`;
      if (pctEl) pctEl.textContent = `${pct}%`;
    }

    // Render Review Cards Feed
    if (count === 0) {
      reviewsList.innerHTML = `
        <div class="empty-reviews-box">
          <i class="fa-regular fa-comment-dots" style="font-size:2.5rem; color:var(--text-light); margin-bottom:12px;"></i>
          <h4 style="font-weight:800; color:var(--text-main); margin-bottom:6px;">لا توجد تقييمات لهذا المنتج حتى الآن</h4>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">
            إذا كنت قد اشتريت واستلمت هذا المنتج مسبقاً، كن أول من يشارك تجربته مع عملاء المتجر!
          </p>
          <button class="btn-primary" onclick="StoreApp.openWriteReviewModal()" style="padding:8px 18px; font-size:0.88rem;">
            <i class="fa-solid fa-pen-to-square"></i> كتابة تقييم موثق
          </button>
        </div>
      `;
    } else {
      reviewsList.innerHTML = reviews.map(r => {
        const initial = (r.authorName || 'ع').trim().charAt(0);
        const ratingVal = parseInt(r.rating, 10) || 5;
        const starHtml = Array.from({ length: 5 }, (_, i) => 
          `<i class="fa-solid fa-star" style="color:${i < ratingVal ? '#f59e0b' : '#cbd5e1'}; font-size:0.85rem;"></i>`
        ).join('');

        return `
          <div class="review-item-card">
            <div class="review-card-top">
              <div class="reviewer-meta">
                <div class="reviewer-avatar">${initial}</div>
                <div>
                  <div class="reviewer-name">
                    <span>${r.authorName}</span>
                    <span class="verified-buyer-tag">
                      <i class="fa-solid fa-circle-check"></i> مشتري موثق
                    </span>
                  </div>
                  <div class="review-date">
                    <i class="fa-regular fa-calendar-check" style="margin-left:4px;"></i>
                    ${r.date || 'مؤخراً'} ${r.orderNumber ? `(طلب #${r.orderNumber})` : ''}
                  </div>
                </div>
              </div>
              <div style="display:flex; gap:2px;">
                ${starHtml}
              </div>
            </div>
            <div class="review-comment-body">
              ${r.comment}
            </div>
          </div>
        `;
      }).join('');
    }
  },

  openReviewModal(productId) {
    if (productId) {
      this.activeProduct = productId;
    }
    this.openWriteReviewModal();
  },

  openWriteReviewModal() {
    if (window.Auth && !window.Auth.isLoggedIn()) {
      window.Auth.promptLogin({
        type: 'review',
        payload: { productId: this.activeProduct }
      }, 'يرجى تسجيل الدخول أولاً لإرسال تقييم أو مراجعة للمنتج');
      return;
    }

    const product = window.DB.find('products', this.activeProduct);
    if (!product) return;

    this.verifiedCustomer = null;
    this.selectedReviewRating = 5;

    document.getElementById('reviewModalProdTitle').textContent = product.name;
    document.getElementById('reviewModalProdImg').src = product.image;

    // Reset verification step
    const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
    const phoneInput = document.getElementById('reviewVerifyPhoneInput');
    if (phoneInput) {
      phoneInput.value = currentUser && currentUser.phone ? currentUser.phone : '';
    }

    const feedback = document.getElementById('reviewVerificationFeedback');
    if (feedback) {
      feedback.style.display = 'none';
      feedback.innerHTML = '';
    }

    document.getElementById('reviewStepVerification').style.display = 'block';
    document.getElementById('reviewStepContent').style.display = 'none';
    document.getElementById('reviewCommentInput').value = '';
    this.setStarRating(5);

    document.getElementById('writeReviewModal').classList.add('active');

    // If user has phone prefilled, trigger check automatically for smoothness
    if (currentUser && currentUser.phone) {
      setTimeout(() => this.verifyCustomerPurchase(), 100);
    }
  },

  closeWriteReviewModal() {
    document.getElementById('writeReviewModal').classList.remove('active');
  },

  verifyCustomerPurchase() {
    const inputVal = (document.getElementById('reviewVerifyPhoneInput').value || '').trim();
    const feedback = document.getElementById('reviewVerificationFeedback');

    if (!inputVal) {
      feedback.style.display = 'block';
      feedback.className = 'status-alert-box alert-error';
      feedback.style.background = '#fef2f2';
      feedback.style.border = '1px solid #fecaca';
      feedback.style.padding = '10px 14px';
      feedback.style.borderRadius = '8px';
      feedback.style.fontSize = '0.85rem';
      feedback.style.color = '#991b1b';
      feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> يرجى إدخال رقم الجوال المسجل به الطلب أو رقم الطلب (مثال: 0501234567).`;
      return;
    }

    const res = window.DB.canCustomerReview(this.activeProduct, inputVal);

    if (res.eligible) {
      this.verifiedCustomer = res;
      feedback.style.display = 'block';
      feedback.style.background = '#ecfdf5';
      feedback.style.border = '1px solid #a7f3d0';
      feedback.style.padding = '10px 14px';
      feedback.style.borderRadius = '8px';
      feedback.style.fontSize = '0.88rem';
      feedback.style.color = '#065f46';
      feedback.innerHTML = `
        <div style="font-weight:800; display:flex; align-items:center; gap:6px; margin-bottom:2px;">
          <i class="fa-solid fa-circle-check"></i> تم التحقق بنجاح من الشراء السابق!
        </div>
        <div>مرحباً بك يا <strong>${res.customerName}</strong> (طلب رقم <strong>#${res.orderNumber}</strong>). يمكنك الآن كتابة تقييمك للمنتج.</div>
      `;

      // Unlock Step 2
      document.getElementById('reviewStepContent').style.display = 'block';
      document.getElementById('reviewCommentInput').focus();
    } else {
      this.verifiedCustomer = null;
      feedback.style.display = 'block';
      feedback.style.background = '#fef2f2';
      feedback.style.border = '1px solid #fecaca';
      feedback.style.padding = '10px 14px';
      feedback.style.borderRadius = '8px';
      feedback.style.fontSize = '0.85rem';
      feedback.style.color = '#991b1b';
      feedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${res.message}`;
      document.getElementById('reviewStepContent').style.display = 'none';
    }
  },

  setStarRating(rating) {
    this.selectedReviewRating = rating;
    const stars = document.querySelectorAll('#modalStarPicker .star-item');
    stars.forEach(s => {
      const val = parseInt(s.getAttribute('data-value'), 10);
      if (val <= rating) {
        s.classList.add('selected');
      } else {
        s.classList.remove('selected');
      }
    });

    const labels = {
      1: '1 من 5 - ضعيف ⚠️',
      2: '2 من 5 - مقبول 😐',
      3: '3 من 5 - جيد 👍',
      4: '4 من 5 - جيد جداً ✨',
      5: '5 من 5 - ممتاز جداً 🌟'
    };
    const labelEl = document.getElementById('starRatingLabel');
    if (labelEl) labelEl.textContent = labels[rating] || `${rating} من 5`;
  },

  submitCustomerReview() {
    if (!this.verifiedCustomer || !this.verifiedCustomer.eligible) {
      this.showToast('يرجى التحقق من عملية الشراء المسبق أولاً', 'error');
      return;
    }

    const comment = (document.getElementById('reviewCommentInput').value || '').trim();
    if (!comment || comment.length < 5) {
      this.showToast('يرجى كتابة وصف وملاحظات تقييمك للمنتج (5 أحرف على الأقل)', 'warning');
      document.getElementById('reviewCommentInput').focus();
      return;
    }

    const newReview = {
      id: 'rev-' + Date.now(),
      productId: this.activeProduct,
      authorName: this.verifiedCustomer.customerName || 'مشتري موثق',
      customerPhone: this.verifiedCustomer.customerPhone || '',
      orderNumber: this.verifiedCustomer.orderNumber || '',
      rating: this.selectedReviewRating || 5,
      date: new Date().toISOString().split('T')[0],
      comment,
      verifiedBuyer: true,
      isApproved: true
    };

    window.DB.insert('reviews', newReview);
    window.DB.recalculateProductRating(this.activeProduct);
    window.DB.recordAuditLog('تقييم منتج جديد', `المنتج ${this.activeProduct}`, newReview.authorName, `تم إضافة تقييم ${newReview.rating} نجوم من المشتري الموثق (${newReview.authorName})`);

    this.closeWriteReviewModal();
    this.showToast('شكراً لمشاركتك! تم اعتماد ونشر تقييمك بنجاح في المتجر ⭐', 'success');

    // Update PDP views
    this.renderProductReviews(this.activeProduct);
    const prod = window.DB.find('products', this.activeProduct);
    const ratingPdpEl = document.getElementById('pdpRating');
    if (ratingPdpEl && prod) {
      if (prod.reviewsCount > 0 && prod.rating > 0) {
        ratingPdpEl.innerHTML = `<span style="color:#f59e0b;">★</span> ${Number(prod.rating).toFixed(1)} <span style="color:var(--text-muted); font-size:0.85rem;">(${prod.reviewsCount} تقييم موثق)</span>`;
      } else {
        ratingPdpEl.innerHTML = `<span style="color:#94a3b8;"><i class="fa-regular fa-star"></i> لا توجد تقييمات بعد (0 تقييم)</span>`;
      }
    }
  },

  /* ================= Interactive Checkout Google Maps Picker ================= */
  jumpMapToCity(cityName, lat, lng) {
    document.querySelectorAll('.map-city-pill').forEach(pill => {
      if (pill.textContent.trim() === cityName) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    const citySelect = document.getElementById('checkoutCustCity');
    if (citySelect) citySelect.value = cityName;

    document.getElementById('checkoutLocationLat').value = lat.toFixed(6);
    document.getElementById('checkoutLocationLng').value = lng.toFixed(6);
    document.getElementById('mapCoordinatesReadout').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    const bubble = document.getElementById('pinDistrictBubble');
    if (bubble) bubble.textContent = `📍 وسط مدينة ${cityName}`;

    const extLink = document.getElementById('externalGoogleMapsLink');
    if (extLink) extLink.href = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

    const pin = document.getElementById('mapLocationPin');
    if (pin) {
      pin.style.top = '50%';
      pin.style.left = '50%';
    }
  },

  locateCustomerGps() {
    if (!navigator.geolocation) {
      this.showToast('متصفحك لا يدعم تحديد الموقع الجغرافي GPS', 'warning');
      return;
    }

    this.showToast('جاري تحديد موقعك الجغرافي الحالي عبر GPS...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        document.getElementById('checkoutLocationLat').value = lat.toFixed(6);
        document.getElementById('checkoutLocationLng').value = lng.toFixed(6);
        document.getElementById('mapCoordinatesReadout').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        const bubble = document.getElementById('pinDistrictBubble');
        if (bubble) bubble.textContent = `📍 موقعك الحالي عبر GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        const extLink = document.getElementById('externalGoogleMapsLink');
        if (extLink) extLink.href = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

        this.showToast('تم تحديد موقعك بدقة بنجاح 📍', 'success');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        this.showToast('تعذر الوصول إلى GPS، تم تثبيت الإحداثيات على مركز المدينة', 'info');
      },
      { timeout: 7000 }
    );
  },

  handleMapClick(event) {
    const map = document.getElementById('checkoutInteractiveMap');
    if (!map) return;
    const rect = map.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pctX = Math.max(5, Math.min(95, (x / rect.width) * 100));
    const pctY = Math.max(10, Math.min(90, (y / rect.height) * 100));

    const pin = document.getElementById('mapLocationPin');
    if (pin) {
      pin.style.left = `${pctX}%`;
      pin.style.top = `${pctY}%`;
    }

    // Compute delta coords based on center
    const baseLat = parseFloat(document.getElementById('checkoutLocationLat').value) || 24.7136;
    const baseLng = parseFloat(document.getElementById('checkoutLocationLng').value) || 46.6753;
    const offsetLat = ((50 - pctY) / 100) * 0.05;
    const offsetLng = ((pctX - 50) / 100) * 0.05;

    const newLat = (baseLat + offsetLat).toFixed(6);
    const newLng = (baseLng + offsetLng).toFixed(6);

    document.getElementById('checkoutLocationLat').value = newLat;
    document.getElementById('checkoutLocationLng').value = newLng;
    document.getElementById('mapCoordinatesReadout').textContent = `${newLat}, ${newLng}`;

    const extLink = document.getElementById('externalGoogleMapsLink');
    if (extLink) extLink.href = `https://www.google.com/maps?q=${newLat},${newLng}`;

    const city = document.getElementById('checkoutCustCity').value || 'الرياض';
    const bubble = document.getElementById('pinDistrictBubble');
    if (bubble) bubble.textContent = `📍 موقع محدد، ${city} (${newLat}, ${newLng})`;

    const badge = document.getElementById('mapConfirmedBadge');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> تم تحديد النقطة بدقة`;
      badge.style.background = '#ecfdf5';
      badge.style.color = '#059669';
    }
  },

  confirmMapLocation() {
    const lat = document.getElementById('checkoutLocationLat').value;
    const lng = document.getElementById('checkoutLocationLng').value;
    const city = document.getElementById('checkoutCustCity').value || 'الرياض';

    const addrInput = document.getElementById('checkoutCustAddress');
    if (addrInput && !addrInput.value.trim()) {
      addrInput.value = `${city} - إحداثيات الموقع (${lat}, ${lng})`;
    }

    const badge = document.getElementById('mapConfirmedBadge');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> تم اعتماد وتثبيت الموقع`;
    }

    this.showToast(`تم تثبيت موقع التوصيل على الخريطة بنجاح (${lat}, ${lng}) 🗺️`, 'success');
  },

  /* ================= Mada / Card Input Validation & Banking Simulation ================= */
  luhnCheck(numStr) {
    const digits = String(numStr).replace(/\D/g, '');
    if (digits.length !== 16) return false;

    // Fast-path / simulation test cards
    if (digits === '5888450012345678' || digits === '5888450000000000') return true;
    if (digits === '5888450012345679') return false;

    // Standard Luhn Algorithm (double every 2nd digit from right)
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    if ((sum % 10) === 0) return true;

    // Alternate parity support
    let altSum = 0;
    let altDouble = true;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      if (altDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      altSum += digit;
      altDouble = !altDouble;
    }
    return (altSum % 10) === 0;
  },

  detectCardBrand(numStr) {
    const clean = String(numStr).replace(/\D/g, '');
    // Mada BINs
    const madaBins = ['588845', '440647', '513213', '968208', '484783', '417633', '457865', '535825', '588848', '588850'];
    if (madaBins.some(bin => clean.startsWith(bin))) return 'mada';
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55')) return 'MasterCard';
    return 'mada';
  },

  handleCardNumberInput(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    input.value = formatted;

    const preview = document.getElementById('cardPreviewNumber');
    if (preview) {
      preview.textContent = formatted || '•••• •••• •••• ••••';
    }

    const brand = this.detectCardBrand(val);
    const brandBadge = document.getElementById('cardBrandBadge');
    if (brandBadge) brandBadge.textContent = brand === 'mada' ? 'mada مدى' : brand;

    const statusEl = document.getElementById('cardLuhnValidationStatus');
    if (statusEl) {
      if (val.length === 16) {
        if (this.luhnCheck(val)) {
          statusEl.style.color = '#10b981';
          statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> رقم صالح وموثق بنكياً`;
        } else {
          statusEl.style.color = '#ef4444';
          statusEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> رقم غير صحيح (Luhn Check)`;
        }
      } else {
        statusEl.textContent = `${val.length}/16 رقم`;
        statusEl.style.color = 'var(--text-muted)';
      }
    }
  },

  handleCardNameInput(input) {
    const val = input.value.trim().toUpperCase();
    const preview = document.getElementById('cardPreviewName');
    if (preview) {
      preview.textContent = val || 'SAUDI CARDHOLDER';
    }
  },

  handleCardExpiryInput(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    input.value = val;

    const preview = document.getElementById('cardPreviewExpiry');
    if (preview) {
      preview.textContent = val || 'MM/YY';
    }
  },

  handleCardCvvInput(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 3);
  },

  fillTestCard(type) {
    const numInput = document.getElementById('checkoutCardNumber');
    const nameInput = document.getElementById('checkoutCardName');
    const expInput = document.getElementById('checkoutCardExpiry');
    const cvvInput = document.getElementById('checkoutCardCvv');

    if (type === 'sufficient') {
      numInput.value = '5888 4500 1234 5678';
      nameInput.value = 'SAUD AL-OTAIBI';
      expInput.value = '12/29';
      cvvInput.value = '492';
      this.handleCardNumberInput(numInput);
      this.handleCardNameInput(nameInput);
      this.handleCardExpiryInput(expInput);
      this.showToast('تم تعبئة بطاقة مدى تجريبية صالحة برصيد كافٍ ✅', 'success');
    } else {
      // Insufficient funds test card (ends in 0000)
      numInput.value = '5888 4500 0000 0000';
      nameInput.value = 'AHMED AL-SHAMMARI';
      expInput.value = '10/28';
      cvvInput.value = '111';
      this.handleCardNumberInput(numInput);
      this.handleCardNameInput(nameInput);
      this.handleCardExpiryInput(expInput);
      this.showToast('تم تعبئة بطاقة تجريبية لاختبار سيناريو الرصيد غير الكافي ❌', 'info');
    }
  },

  closeMadaAuthModal() {
    const modal = document.getElementById('madaAuthModal');
    if (modal) modal.classList.remove('active');
  },

  renderOrderSuccess(order) {
    this.lastCreatedOrder = order;
    const successCard = document.getElementById('orderSuccessScreen');
    const checkoutForm = document.getElementById('checkoutMainLayout');
    
    if (checkoutForm) checkoutForm.style.display = 'none';
    if (successCard) {
      successCard.style.display = 'block';

      // Generate ZATCA QR
      const settings = window.DB.get('settings') || {};
      const qrSvg = window.ZatcaEngine.renderQrSvg(
        window.ZatcaEngine.generateTlvString(
          settings.storeName || 'متجر النخبة السعودي',
          settings.vatNumber || '310123456700003',
          order.date,
          order.total,
          order.vatAmount
        ),
        160
      );

      document.getElementById('successOrderNumber').textContent = `#${order.orderNumber}`;
      document.getElementById('successCustomerName').textContent = order.customer.name;
      document.getElementById('successCustomerPhone').textContent = order.customer.phone;
      document.getElementById('successOrderCity').textContent = order.customer.city;
      document.getElementById('successOrderTotal').textContent = `${order.total.toFixed(2)} ر.س`;
      document.getElementById('successTrackingNumber').textContent = order.trackingNumber;
      document.getElementById('successZatcaQr').innerHTML = qrSvg;
    }
  },

  printSuccessInvoice(order = null) {
    const targetOrder = order || this.lastCreatedOrder || (window.DB.get('orders') || [])[0];
    if (!targetOrder) {
      this.showToast('لا توجد بيانات فاتورة متاحة للطباعة', 'error');
      return;
    }
    const printArea = document.getElementById('taxInvoicePrintArea');
    if (printArea) {
      printArea.innerHTML = window.ZatcaEngine.generateTaxInvoiceHtml(targetOrder);
    }
    window.print();
  },

  previewSuccessInvoice(order = null) {
    const targetOrder = order || this.lastCreatedOrder || (window.DB.get('orders') || [])[0];
    if (!targetOrder) {
      this.showToast('لا توجد بيانات فاتورة متاحة للمعاينة', 'error');
      return;
    }
    const modal = document.getElementById('customerInvoiceModal');
    const container = document.getElementById('customerInvoiceModalContent');
    if (modal && container) {
      container.innerHTML = window.ZatcaEngine.generateTaxInvoiceHtml(targetOrder);
      modal.classList.add('active');
    }
  },

  closeCustomerInvoiceModal() {
    const modal = document.getElementById('customerInvoiceModal');
    if (modal) modal.classList.remove('active');
  },

  /* ================= Search & Autocomplete ================= */
  handleSearch(query) {
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    const q = query.trim().toLowerCase();
    if (!q) {
      dropdown.classList.remove('active');
      return;
    }

    const products = window.DB.get('products') || [];
    const results = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );

    if (results.length === 0) {
      dropdown.innerHTML = `<div style="padding:14px; text-align:center; color:var(--text-muted); font-size:0.9rem;">لا توجد نتائج مطابقة لـ "${query}"</div>`;
    } else {
      dropdown.innerHTML = results.slice(0, 5).map(p => `
        <div style="display:flex; align-items:center; gap:12px; padding:10px; border-radius:8px; cursor:pointer;" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'" onclick="StoreApp.showProduct('${p.id}')">
          <img src="${p.image}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
          <div style="flex:1;">
            <div style="font-weight:700; font-size:0.9rem; color:var(--text-main);">${p.name}</div>
            <div style="font-size:0.78rem; color:var(--primary); font-weight:700;">${p.salePrice} ر.س</div>
          </div>
        </div>
      `).join('');
    }

    dropdown.classList.add('active');
  },

  /* ================= Account & Pages ================= */
  accountOrdersFilter: 'all',

  setAccountOrdersFilter(filterName, btnEl) {
    this.accountOrdersFilter = filterName || 'all';
    document.querySelectorAll('.order-filter-btn').forEach(b => {
      b.classList.remove('active');
      b.style.background = '#f1f5f9';
      b.style.color = '#475569';
      b.style.borderColor = '#cbd5e1';
    });
    if (btnEl) {
      btnEl.classList.add('active');
      btnEl.style.background = 'var(--primary, #0d5c46)';
      btnEl.style.color = '#ffffff';
      btnEl.style.borderColor = 'var(--primary, #0d5c46)';
    }
    this.renderAccountOrders();
  },

  showAccount() {
    if (window.Auth && !window.Auth.isLoggedIn()) {
      window.Auth.promptLogin({ type: 'account' }, 'Ø¨ÙˆØ§Ø¨Ø© Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¹Ù…ÙŠÙ„ Ù…Ø­Ù…ÙŠØ©. ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£Ùˆ Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø·Ù„Ø¨Ø§ØªÙƒ ÙˆÙ…Ø­ÙØ¸ØªÙƒ');
      return;
    }
    this.switchView('account');
    this.renderCustomerProfile();
    this.renderWalletCard();
    this.renderAccountOrders();
  },

  renderCustomerProfile() {
    const cardEl = document.getElementById('customerProfileCard');
    if (!cardEl) return;

    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    if (!user) {
      cardEl.innerHTML = '';
      return;
    }

    const allOrders = window.DB.get('orders') || [];
    const uEmail = String(user.email || '').trim().toLowerCase();
    const uPhone = String(user.phone || '').replace(/\D/g, '');
    const uId = user.id;

    const myOrders = allOrders.filter(o => {
      if (o.userId && uId && o.userId === uId) return true;
      if (o.userEmail && uEmail && o.userEmail === uEmail) return true;
      const cust = o.customer || {};
      const cEmail = String(cust.email || '').trim().toLowerCase();
      if (uEmail && cEmail && cEmail === uEmail) return true;
      const cPhone = String(cust.phone || '').replace(/\D/g, '');
      if (uPhone && cPhone && uPhone.length >= 8 && cPhone.length >= 8) {
        if (uPhone === cPhone || uPhone.endsWith(cPhone.slice(-9)) || cPhone.endsWith(uPhone.slice(-9))) return true;
      }
      return false;
    });

    const totalSpent = myOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const initial = (user.name || 'Ø¹').trim().charAt(0);

    cardEl.innerHTML = `
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 24px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary, #0d5c46); color: #fff; font-size: 1.6rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(13,92,70,0.25);">
            ${initial}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0; color: var(--text-main);">${user.name}</h2>
              <span style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 0.76rem; font-weight: 800; padding: 3px 10px; border-radius: 12px;">
                <i class="fa-solid fa-circle-check"></i> Ø¹Ù…ÙŠÙ„ Ù…ÙˆØ«Ù‚
              </span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 0.84rem; color: var(--text-muted);">
              <span><i class="fa-solid fa-envelope" style="color: #94a3b8; margin-left: 4px;"></i> ${user.email}</span>
              ${user.phone ? `<span><i class="fa-solid fa-phone" style="color: #94a3b8; margin-left: 4px;"></i> ${user.phone}</span>` : ''}
              <span><i class="fa-solid fa-id-card" style="color: #94a3b8; margin-left: 4px;"></i> Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø§Ù„Ø®Ø§Øµ</span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 18px; text-align: center;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø·Ù„Ø¨Ø§ØªÙŠ</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${myOrders.length}</div>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 18px; text-align: center;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù…Ø´ØªØ±ÙŠØ§ØªÙŠ</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #059669;">${totalSpent.toFixed(2)} <span style="font-size:0.75rem;">Ø±.Ø³</span></div>
          </div>
          <button type="button" onclick="Auth.logout()" class="btn-outline" style="color: #ef4444; border-color: #fca5a5; background: #fff; padding: 10px 16px; font-size: 0.85rem; font-weight: 800; border-radius: 10px; cursor: pointer;">
            <i class="fa-solid fa-right-from-bracket"></i> ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬
          </button>
        </div>
      </div>
    `;
  },
  closeWalletTransactionsModal() {
    const modal = document.getElementById('walletTransactionsModal');
    if (modal) modal.style.display = 'none';
  },

  cancelCustomerOrder(orderId) {
    const order = window.DB.find('orders', orderId);
    if (!order) {
      this.showToast('عذراً، الطلب غير موجود', 'error');
      return;
    }
    const normalizedStatus = (order.shippingStatus || 'لم يجهز').trim();
    if (normalizedStatus === 'تم الشحن' || normalizedStatus === 'تم التسليم') {
      this.showToast('عذراً، لا يمكن إلغاء الطلب بعد شحنه أو تسليمه.', 'error');
      return;
    }
    if (order.orderStatus === 'ملغي') {
      this.showToast('هذا الطلب ملغي مسبقاً.', 'info');
      return;
    }

    if (!confirm(`هل أنت متأكد من رغبتك في إلغاء الطلب #${order.orderNumber}؟\nسيتم استرجاع المنتجات للمخزون واسترداد المبلغ فوراً إلى محفظتك الرقمية.`)) {
      return;
    }

    // 1. Restore Stock
    window.InventoryEngine.restoreOrderStock(order.id, 'cancellation');

    // 2. Refund to customer wallet if paid
    let refundMsg = '';
    const refundAmount = Number(order.total) || 0;
    if (refundAmount > 0 && order.paymentStatus !== 'ملغي' && order.paymentStatus !== 'مسترد') {
      window.DB.creditWallet(
        order.customer ? order.customer.phone : 'default',
        refundAmount,
        `استرداد كامل قيمة الطلب الملغي #${order.orderNumber}`,
        order.orderNumber
      );
      refundMsg = ` وتمت استعادة كامل المبلغ (${refundAmount.toFixed(2)} ر.س) إلى محفظتك الرقمية 💳`;
    }

    // 3. Mark as cancelled in DB
    window.DB.update('orders', order.id, {
      orderStatus: 'ملغي',
      paymentStatus: 'مسترد'
    });

    this.showToast(`تم إلغاء الطلب #${order.orderNumber} بنجاح!${refundMsg}`, 'success');
    this.renderAccountOrders();
    this.renderWalletCard();
  },

  renderAccountOrders() {
    const allOrders = window.DB.get('orders') || [];
    const container = document.getElementById('accountOrdersList');
    if (!container) return;

    const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
    if (!currentUser) {
      container.innerHTML = `
        <div style="text-align:center; padding:36px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px;">
          <i class="fa-solid fa-lock" style="font-size:2.4rem; color:#94a3b8; margin-bottom:10px;"></i>
          <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ø¹Ø±Ø¶ Ù„ÙˆØ­Ø© Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„Ø®Ø§ØµØ©</h4>
          <button class="btn-primary" onclick="Auth.openAuthModal('login')" style="padding:8px 20px; font-size:0.88rem; margin-top:10px;">ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„</button>
        </div>
      `;
      return;
    }

    const uEmail = String(currentUser.email || '').trim().toLowerCase();
    const uPhone = String(currentUser.phone || '').replace(/\D/g, '');
    const uId = currentUser.id;

    // Strict isolation: Customer ONLY sees their own orders and returns!
    let orders = allOrders.filter(o => {
      if (o.userId && uId && o.userId === uId) return true;
      if (o.userEmail && uEmail && o.userEmail === uEmail) return true;
      const cust = o.customer || {};
      const cEmail = String(cust.email || '').trim().toLowerCase();
      if (uEmail && cEmail && cEmail === uEmail) return true;
      const cPhone = String(cust.phone || '').replace(/\D/g, '');
      if (uPhone && cPhone && uPhone.length >= 8 && cPhone.length >= 8) {
        if (uPhone === cPhone || uPhone.endsWith(cPhone.slice(-9)) || cPhone.endsWith(uPhone.slice(-9))) return true;
      }
      return false;
    });

    // Apply Tab Filtering
    const currentFilter = this.accountOrdersFilter || 'all';
    if (currentFilter === 'active') {
      orders = orders.filter(o => o.orderStatus !== 'Ù…Ù„ØºÙŠ' && (o.shippingStatus || '') !== 'ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…');
    } else if (currentFilter === 'completed') {
      orders = orders.filter(o => (o.shippingStatus || '') === 'ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…' || o.orderStatus === 'Ù…ÙƒØªÙ…Ù„');
    } else if (currentFilter === 'returns') {
      orders = orders.filter(o => o.returns && o.returns.length > 0);
    }

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:36px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px;">
          <i class="fa-solid fa-box-open" style="font-size:2.4rem; color:#94a3b8; margin-bottom:10px;"></i>
          <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">لا توجد طلبات مسجلة بحسابك حالياً</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px;">ابدأ تجربة التسوق الفاخرة واختر من منتجات النخبة وباقات العروض التوفيرية</p>
          <button class="btn-primary" onclick="StoreApp.showHome()" style="padding:8px 20px; font-size:0.88rem;">تصفح المنتجات الآن</button>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const normalizedStatus = (order.shippingStatus || 'لم يجهز').trim();
      const shipStatus = normalizedStatus;
      const isDelivered = normalizedStatus === 'تم التسليم';
      const canCancel = (normalizedStatus === 'لم يجهز' || normalizedStatus === 'قيد التجهيز') && order.orderStatus !== 'ملغي' && order.orderStatus !== 'مكتمل';
      let shipBadge = '';
      let stepIndex = 1;

      if (normalizedStatus === 'تم التسليم') {
        stepIndex = 4;
        shipBadge = `
          <span style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; padding:4px 12px; border-radius:20px; font-weight:800; font-size:0.80rem; display:inline-flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-circle-check"></i> تم التسليم
          </span>
        `;
      } else if (normalizedStatus === 'تم الشحن' || normalizedStatus.includes('الشحن') || normalizedStatus.includes('التوصيل')) {
        stepIndex = 3;
        shipBadge = `
          <span style="background:#e0e7ff; color:#4338ca; border:1px solid #c7d2fe; padding:4px 12px; border-radius:20px; font-weight:800; font-size:0.80rem; display:inline-flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-truck-fast"></i> تم الشحن
          </span>
        `;
      } else if (normalizedStatus === 'قيد التجهيز' || normalizedStatus.includes('تجهيز') || normalizedStatus.includes('تنفيذ')) {
        stepIndex = 2;
        shipBadge = `
          <span style="background:#dbeafe; color:#1d4ed8; border:1px solid #bfdbfe; padding:4px 12px; border-radius:20px; font-weight:800; font-size:0.80rem; display:inline-flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-box-open"></i> قيد التجهيز
          </span>
        `;
      } else { // 'لم يجهز'
        stepIndex = 1;
        shipBadge = `
          <span style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:4px 12px; border-radius:20px; font-weight:800; font-size:0.80rem; display:inline-flex; align-items:center; gap:6px;">
            <i class="fa-regular fa-clock"></i> لم يجهز
          </span>
        `;
      }

      const orderStatusClass = order.orderStatus === 'مكتمل' ? 'completed' : order.orderStatus === 'ملغي' ? 'cancelled' : 'processing';

      const stepperHtml = `
        <div style="margin:14px 0 10px; padding:12px 14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
          <div style="display:flex; justify-content:space-between; position:relative;">
            <div style="position:absolute; top:12px; right:12%; left:12%; height:3px; background:#e2e8f0; z-index:1;">
              <div style="height:100%; width:${stepIndex === 1 ? '0%' : stepIndex === 2 ? '33%' : stepIndex === 3 ? '66%' : '100%'}; background:#0d5c46; transition:width 0.4s ease;"></div>
            </div>
            <div style="position:relative; z-index:2; text-align:center;">
              <div style="width:26px; height:26px; border-radius:50%; margin:0 auto; background:${stepIndex >= 1 ? '#0d5c46' : '#e2e8f0'}; color:${stepIndex >= 1 ? '#fff' : '#64748b'}; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800;">
                <i class="fa-solid fa-check"></i>
              </div>
              <span style="font-size:0.70rem; font-weight:${stepIndex === 1 ? '800' : '600'}; color:${stepIndex >= 1 ? '#0d5c46' : '#64748b'}; display:block; margin-top:4px;">لم يجهز</span>
            </div>
            <div style="position:relative; z-index:2; text-align:center;">
              <div style="width:26px; height:26px; border-radius:50%; margin:0 auto; background:${stepIndex >= 2 ? '#0d5c46' : '#e2e8f0'}; color:${stepIndex >= 2 ? '#fff' : '#64748b'}; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800;">
                <i class="fa-solid fa-box-open"></i>
              </div>
              <span style="font-size:0.70rem; font-weight:${stepIndex === 2 ? '800' : '600'}; color:${stepIndex >= 2 ? '#0d5c46' : '#64748b'}; display:block; margin-top:4px;">قيد التجهيز</span>
            </div>
            <div style="position:relative; z-index:2; text-align:center;">
              <div style="width:26px; height:26px; border-radius:50%; margin:0 auto; background:${stepIndex >= 3 ? '#0d5c46' : '#e2e8f0'}; color:${stepIndex >= 3 ? '#fff' : '#64748b'}; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800;">
                <i class="fa-solid fa-truck-fast"></i>
              </div>
              <span style="font-size:0.70rem; font-weight:${stepIndex === 3 ? '800' : '600'}; color:${stepIndex >= 3 ? '#0d5c46' : '#64748b'}; display:block; margin-top:4px;">تم الشحن</span>
            </div>
            <div style="position:relative; z-index:2; text-align:center;">
              <div style="width:26px; height:26px; border-radius:50%; margin:0 auto; background:${stepIndex >= 4 ? '#10b981' : '#e2e8f0'}; color:${stepIndex >= 4 ? '#fff' : '#64748b'}; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800;">
                <i class="fa-solid fa-house-chimney"></i>
              </div>
              <span style="font-size:0.70rem; font-weight:${stepIndex === 4 ? '800' : '600'}; color:${stepIndex >= 4 ? '#10b981' : '#64748b'}; display:block; margin-top:4px;">تم التسليم</span>
            </div>
          </div>
        </div>
      `;

      return `
        <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; margin-bottom:16px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
            <div>
              <strong style="font-size:1.1rem; color:var(--primary);">الطلب #${order.orderNumber}</strong>
              <div style="font-size:0.8rem; color:var(--text-muted);">${new Date(order.date).toLocaleDateString('ar-SA')} - ${new Date(order.date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              ${shipBadge}
              <span class="status-pill ${orderStatusClass}">
                ${order.orderStatus}
              </span>
            </div>
          </div>

          ${stepperHtml}

          <div style="font-size:0.88rem; margin-bottom:10px; color:var(--text-muted); display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <div>
              إجمالي المبلغ: <strong style="color:var(--text-main); font-size:1rem;">${Number(order.total).toFixed(2)} ر.س</strong>
              &nbsp;|&nbsp; طريقة الدفع: <span style="font-weight:700; color:var(--primary);">${order.paymentMethod || 'مدى'}</span>
            </div>
            <div>
              شركة الشحن: <strong>${order.shippingMethod || 'سمسا إكسبريس'}</strong>
            </div>
          </div>

          ${order.trackingNumber ? `
            <div style="background:var(--bg-subtle); padding:10px 14px; border-radius:8px; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span>رقم بوليصة الشحن (AWB): <strong style="font-family:monospace; color:var(--primary); letter-spacing:1px;">${order.trackingNumber}</strong></span>
              <span style="font-size:0.8rem; color:var(--text-muted);">حالة الشحن: <strong>${shipStatus}</strong></span>
            </div>
          ` : ''}

          ${order.returns && order.returns.length > 0 ? `
            <div style="margin:14px 0; padding:16px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px;">
              <div style="font-weight:900; font-size:0.95rem; color:var(--text-main); margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <span style="display:flex; align-items:center; gap:8px;">
                  <i class="fa-solid fa-rotate-left" style="color:#b45309;"></i> 
                  متابعة طلبات الاسترجاع (${order.returns.length})
                </span>
                <span style="font-size:0.75rem; color:var(--text-muted);">نظام التتبع المرحلي المعتمد</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:12px;">
                ${order.returns.map(ret => {
                  const stageNames = [
                    'تم طلب الاسترجاع',
                    'بانتظار استلام المندوب',
                    'تم استلام المنتج من العميل',
                    'المنتج في طريقه إلى المتجر',
                    'وصل المنتج إلى المتجر',
                    'قيد فحص المنتج',
                    'تم اجتياز الفحص وقبول الاسترجاع',
                    'جارٍ استرداد المبلغ',
                    'تم استرداد المبلغ'
                  ];

                  const isRejected = ret.status === 'مرفوض بعد الفحص';
                  const isFailed = ret.status === 'تعذّر استرداد المبلغ';
                  const isCancelled = ret.status === 'ملغي';
                  const currentIdx = stageNames.indexOf(ret.status);
                  const currentStep = currentIdx >= 0 ? currentIdx + 1 : (isRejected ? 6 : isFailed ? 8 : isCancelled ? 1 : 1);

                  let statusBadgeStyle = 'background:#fef3c7; color:#b45309; border:1px solid #fde68a;';
                  let statusIcon = 'fa-clock';
                  if (ret.status === 'تم استرداد المبلغ') {
                    statusBadgeStyle = 'background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;';
                    statusIcon = 'fa-circle-check';
                  } else if (ret.status === 'تم اجتياز الفحص وقبول الاسترجاع' || ret.status === 'جارٍ استرداد المبلغ') {
                    statusBadgeStyle = 'background:#dbeafe; color:#1d4ed8; border:1px solid #bfdbfe;';
                    statusIcon = 'fa-spinner fa-spin';
                  } else if (isRejected) {
                    statusBadgeStyle = 'background:#fee2e2; color:#b91c1c; border:1px solid #fecaca;';
                    statusIcon = 'fa-circle-xmark';
                  } else if (isFailed) {
                    statusBadgeStyle = 'background:#fff7ed; color:#c2410c; border:1px solid #fed7aa;';
                    statusIcon = 'fa-triangle-exclamation';
                  } else if (isCancelled) {
                    statusBadgeStyle = 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;';
                    statusIcon = 'fa-ban';
                  }

                  let stageExplanation = '';
                  if (currentStep >= 1 && currentStep <= 6) {
                    stageExplanation = `📌 <strong>المرحلة الحالية:</strong> [${ret.status}] — تم قيد الطلب وجارٍ التنسيق. <span style="color:#b45309; font-weight:700;">(قاعدة النظام: لا يُعاد أي منتج إلى المخزون ولا يُرد أي مبلغ خلال المراحل 1-6 لحين وصول الشحنة واجتياز الفحص).</span>`;
                  } else if (currentStep === 7) {
                    stageExplanation = `✅ <strong>تم اجتياز الفحص بنجاح!</strong> تم التحقق من سلامة المنتج وإعادة الكمية إلى المخزون القابل للبيع. جارٍ الانتقال لمرحلة استرداد المبلغ.`;
                  } else if (currentStep === 8) {
                    stageExplanation = `⏳ <strong>جارٍ استرداد المبلغ:</strong> النظام ينفذ رد المبلغ المستحق (${ret.refundTotal.toFixed(2)} ر.س) عبر وسيلة الاسترداد (${ret.refundMethod === 'wallet' ? 'المحفظة الرقمية' : 'البطاقة'}).`;
                  } else if (currentStep === 9) {
                    stageExplanation = `🎉 <strong>اكتملت العملية وتم رد المبلغ بنجاح!</strong> تم إيداع ${ret.refundTotal.toFixed(2)} ر.س في ${ret.refundMethod === 'wallet' ? 'محفظتك الرقمية' : 'حسابك البنكي'} (رقم العملية: <code>${ret.refundTxId || 'TX-COMPLETED'}</code>).`;
                  }

                  if (isRejected) {
                    stageExplanation = `❌ <strong>مرفوض بعد الفحص:</strong> لم يستوفِ المنتج شروط وسياسة الاسترجاع (${ret.rejectionReason || 'المنتج تالف أو غير مطابق'}). لم يتم رد المبلغ ولم تتم إعادة المنتجات للمخزون القابل للبيع.`;
                  } else if (isFailed) {
                    stageExplanation = `⚠️ <strong>تعذّر استرداد المبلغ:</strong> حدث خطأ أثناء تنفيذ عملية الاسترداد المالي (${ret.refundError || 'خطأ في بوابة الدفع'}). سيقوم فريق المتجر بإعادة المحاولة بأمان دون تكرار الخصم.`;
                  } else if (isCancelled) {
                    stageExplanation = `🚫 <strong>طلب الاسترجاع ملغي:</strong> تم إلغاء طلب الاسترجاع وفق سياسة المتجر.`;
                  }

                  return `
                    <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                        <div>
                          <strong style="color:var(--primary); font-size:0.92rem;">طلب استرجاع #${ret.id}</strong>
                          <span style="font-size:0.76rem; color:var(--text-muted); margin-right:8px;">
                            ${new Date(ret.createdAt).toLocaleDateString('ar-SA')} - ${new Date(ret.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="font-weight:800; padding:4px 12px; border-radius:14px; font-size:0.78rem; display:inline-flex; align-items:center; gap:6px; ${statusBadgeStyle}">
                            <i class="fa-solid ${statusIcon}"></i> ${ret.status}
                          </span>
                        </div>
                      </div>

                      <!-- 9-Stage Visual Progress Stepper -->
                      <div style="margin:14px 0 10px 0; background:#f1f5f9; padding:12px 10px; border-radius:8px; overflow-x:auto;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; min-width:650px; position:relative;">
                          <div style="position:absolute; top:13px; right:20px; left:20px; height:3px; background:#cbd5e1; z-index:1;"></div>
                          <div style="position:absolute; top:13px; right:20px; width:${Math.min(100, Math.max(0, (currentStep - 1) * 12.5))}%; height:3px; background:#10b981; z-index:1; transition:width 0.3s ease;"></div>

                          ${stageNames.map((name, i) => {
                            const stepNum = i + 1;
                            const isDone = currentStep > stepNum;
                            const isCurrent = currentStep === stepNum;
                            let circleBg = '#e2e8f0';
                            let circleColor = '#64748b';
                            let circleBorder = 'none';

                            if (isDone) {
                              circleBg = '#10b981';
                              circleColor = '#fff';
                            } else if (isCurrent) {
                              if (isRejected) {
                                circleBg = '#ef4444';
                                circleColor = '#fff';
                              } else if (isFailed) {
                                circleBg = '#f97316';
                                circleColor = '#fff';
                              } else {
                                circleBg = '#0d5c46';
                                circleColor = '#fff';
                                circleBorder = '3px solid #6ee7b7';
                              }
                            }

                            return `
                              <div style="position:relative; z-index:2; text-align:center; width:68px;">
                                <div style="width:26px; height:26px; border-radius:50%; margin:0 auto; background:${circleBg}; color:${circleColor}; border:${circleBorder}; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:900;">
                                  ${isDone ? '<i class="fa-solid fa-check"></i>' : stepNum}
                                </div>
                                <span style="font-size:0.65rem; line-height:1.2; font-weight:${isCurrent ? '800' : '600'}; color:${isCurrent ? '#0d5c46' : (isDone ? '#10b981' : '#64748b')}; display:block; margin-top:5px;">
                                  ${name}
                                </span>
                              </div>
                            `;
                          }).join('')}
                        </div>
                      </div>

                      <!-- Contextual Status Explanation Banner -->
                      <div style="background:#f8fafc; border-right:4px solid ${isRejected ? '#ef4444' : isFailed ? '#f97316' : currentStep >= 7 ? '#10b981' : '#0d5c46'}; padding:10px 12px; border-radius:6px; font-size:0.80rem; color:#334155; margin-bottom:10px;">
                        ${stageExplanation}
                      </div>

                      <div style="font-size:0.80rem; color:var(--text-muted); margin-bottom:6px;">
                        <strong>سبب الاسترجاع:</strong> ${ret.reason} ${ret.notes ? `(${ret.notes})` : ''} 
                        &nbsp;|&nbsp; <strong>المبلغ المستحق:</strong> <span style="font-weight:900; color:var(--primary); font-size:0.92rem;">${ret.refundTotal.toFixed(2)} ر.س</span>
                        &nbsp;|&nbsp; <strong>وسيلة الاسترداد:</strong> ${ret.refundMethod === 'wallet' ? 'المحفظة الرقمية' : 'البطاقة البنكية'}
                      </div>

                      <div style="background:#fafafa; border:1px solid #f1f5f9; border-radius:6px; padding:8px 10px; font-size:0.78rem;">
                        <span style="font-weight:700; color:#475569;">المنتجات المحددة في طلب الاسترجاع:</span>
                        <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
                          ${ret.items.map(it => `
                            <div style="display:flex; justify-content:space-between; align-items:center; color:#334155;">
                              <span>
                                ${it.isBundle ? '<span style="color:#b45309; font-weight:800;">[باقة كاملة]</span> ' : ''}
                                <strong>${it.name}</strong>
                                ${it.variantTitle ? `<span style="background:#e2e8f0; padding:1px 6px; border-radius:4px; font-size:0.72rem; margin-right:4px;">${it.variantTitle}</span>` : ''}
                                ${it.size ? `<span style="background:#e0e7ff; color:#3730a3; padding:1px 5px; border-radius:4px; font-size:0.70rem; margin-right:4px;">مقاس: ${it.size}</span>` : ''}
                                ${it.color ? `<span style="background:#fae8ff; color:#86198f; padding:1px 5px; border-radius:4px; font-size:0.70rem; margin-right:4px;">لون: ${it.color}</span>` : ''}
                                <span style="color:var(--text-muted); font-weight:700;">× ${it.quantity}</span>
                              </span>
                              <strong style="color:var(--text-main);">${(it.price * it.quantity).toFixed(2)} ر.س</strong>
                            </div>
                          `).join('')}
                        </div>
                      </div>

                      ${ret.adminNotes ? `
                        <div style="margin-top:6px; font-size:0.75rem; color:#0d5c46; background:#ecfdf5; padding:6px 10px; border-radius:6px;">
                          <strong>ملاحظات إدارة المتجر:</strong> ${ret.adminNotes}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px; padding-top:12px; border-top:1px dashed var(--border-color); flex-wrap:wrap;">
            ${isDelivered && order.orderStatus !== 'ملغي' ? `
              <button type="button" class="btn-outline" style="padding:6px 14px; font-size:0.82rem; color:#b45309; border-color:#fde68a; background:#fffbeb; font-weight:800;" onclick="StoreApp.openReturnModal('${order.id}')">
                <i class="fa-solid fa-rotate-left"></i> طلب استرجاع منتج / باقة
              </button>
            ` : ''}
            ${canCancel ? `
              <button type="button" class="btn-outline" style="padding:6px 14px; font-size:0.82rem; color:#dc2626; border-color:#fca5a5; background:#fef2f2; font-weight:800;" onclick="StoreApp.cancelCustomerOrder('${order.id}')">
                <i class="fa-solid fa-ban"></i> إلغاء الطلب
              </button>
            ` : ''}
            <button type="button" class="btn-outline" style="padding:6px 14px; font-size:0.82rem;" onclick="StoreApp.previewSuccessInvoice(window.DB.find('orders', '${order.id}'))">
              <i class="fa-solid fa-file-invoice-dollar"></i> معاينة الفاتورة الضريبية
            </button>
            <button type="button" class="btn-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="StoreApp.printSuccessInvoice(window.DB.find('orders', '${order.id}'))">
              <i class="fa-solid fa-print"></i> طباعة الفاتورة
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  cancelCustomerOrder(orderId) {
    const order = window.DB.find('orders', orderId);
    if (!order) {
      this.showToast('عذراً، الطلب غير موجود', 'error');
      return { success: false, message: 'الطلب غير موجود' };
    }

    const shipStatus = (order.shippingStatus || 'لم يجهز').trim();
    if (shipStatus === 'تم الشحن' || shipStatus === 'تم التسليم') {
      this.showToast('لا يمكن إلغاء الطلب بعد خروجه للشحن أو تسليمه. يمكنك طلب استرجاع بعد الاستلام.', 'error');
      return { success: false, message: 'لا يمكن إلغاء الطلب بعد الشحن' };
    }

    if (order.orderStatus === 'ملغي') {
      this.showToast('هذا الطلب ملغي بالفعل', 'warning');
      return { success: false, message: 'الطلب ملغي بالفعل' };
    }

    // Restore stock atomically via InventoryEngine
    window.InventoryEngine.restoreOrderStock(order.id, 'cancel', 'إلغاء الطلب من قبل العميل قبل مرحلة الشحن');

    // Credit full order amount into customer wallet
    const custKey = (order.customer && order.customer.phone) ? order.customer.phone : 'default';
    const refundAmt = Number(order.total) || 0;
    if (refundAmt > 0) {
      window.DB.creditWallet(
        custKey,
        refundAmt,
        `استرداد كامل قيمة الطلب الملغي #${order.orderNumber}`,
        order.orderNumber
      );
    }

    // Update order status
    order.orderStatus = 'ملغي';
    order.paymentStatus = 'مسترد';
    order.cancellationReason = 'إلغاء من قبل العميل قبل الشحن واسترداد المبلغ في المحفظة';
    order.cancelledAt = new Date().toISOString();
    window.DB.update('orders', order.id, order);

    this.showToast(`تم إلغاء الطلب #${order.orderNumber} بنجاح، وتم إيداع كامل المبلغ (${refundAmt.toFixed(2)} ر.س) فوراً في محفظتك الرقمية! 🎉`, 'success');
    this.renderAccountOrders();
    this.renderWalletCard();
    return { success: true, order };
  },

  getActiveCustomerPhone() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    if (user && user.phone) return user.phone;
    return '0501234567';
  },

  renderWalletCard() {
    const custPhone = this.getActiveCustomerPhone();
    const wallet = window.DB.getWallet(custPhone);
    const balance = wallet ? wallet.balance : 0;

    const el = document.getElementById('accountWalletBalance');
    if (el) el.textContent = balance.toFixed(2);

    const checkText = document.getElementById('checkoutWalletBalanceText');
    if (checkText) checkText.textContent = balance.toFixed(2);
  },

  openWalletTransactionsModal() {
    const custPhone = this.getActiveCustomerPhone();
    const wallet = window.DB.getWallet(custPhone);
    const modal = document.getElementById('walletTransactionsModal');
    if (!modal) return;

    const balEl = document.getElementById('modalWalletCurrentBalance');
    if (balEl) balEl.textContent = `${(wallet ? wallet.balance : 0).toFixed(2)} ر.س`;

    const listEl = document.getElementById('walletTransactionsList');
    if (listEl) {
      const txs = wallet ? (wallet.transactions || []) : [];
      if (txs.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:16px;">لا توجد حركات مالية مسجلة في المحفظة حتى الآن.</p>`;
      } else {
        listEl.innerHTML = txs.map(tx => {
          const isCredit = tx.type === 'credit';
          const sign = isCredit ? '+' : '-';
          const color = isCredit ? '#15803d' : '#dc2626';
          const bg = isCredit ? '#f0fdf4' : '#fef2f2';
          const border = isCredit ? '#bbf7d0' : '#fca5a5';
          const icon = isCredit ? 'fa-arrow-down-left' : 'fa-arrow-up-right';
          const dateStr = new Date(tx.date).toLocaleDateString('ar-SA') + ' ' + new Date(tx.date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

          return `
            <div style="background:${bg}; border:1px solid ${border}; border-radius:8px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:32px; height:32px; border-radius:50%; background:#fff; color:${color}; display:flex; align-items:center; justify-content:center; font-size:0.85rem;">
                  <i class="fa-solid ${icon}"></i>
                </div>
                <div>
                  <div style="font-weight:800; font-size:0.88rem; color:#1e293b;">${tx.reason}</div>
                  <div style="font-size:0.75rem; color:#64748b;">${dateStr} ${tx.orderNumber ? `| الطلب: #${tx.orderNumber}` : ''}</div>
                </div>
              </div>
              <div style="text-align:left;">
                <strong style="color:${color}; font-size:1.05rem; font-family:monospace; direction:ltr; display:inline-block;">${sign}${tx.amount.toFixed(2)} ر.س</strong>
                <div style="font-size:0.72rem; color:#64748b;">الرصيد بعد: ${tx.balanceAfter.toFixed(2)} ر.س</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    modal.style.display = 'flex';
  },

  closeWalletTransactionsModal() {
    const modal = document.getElementById('walletTransactionsModal');
    if (modal) modal.style.display = 'none';
  },

  /* ================= Customer Order Return Request Engine ================= */
  activeReturnOrderId: null,

  openReturnModal(orderId) {
    const order = window.DB.find('orders', orderId);
    if (!order) {
      this.showToast('عذراً، لم يتم العثور على بيانات هذا الطلب', 'error');
      return;
    }
    this.activeReturnOrderId = orderId;

    const modal = document.getElementById('customerReturnModal');
    if (!modal) return;

    const infoEl = document.getElementById('returnModalOrderInfo');
    if (infoEl) {
      infoEl.textContent = `الطلب #${order.orderNumber} | تاريخ الطلب: ${new Date(order.date).toLocaleDateString('ar-SA')}`;
    }

    const partialRadio = document.querySelector('input[name="returnScope"][value="partial"]');
    if (partialRadio) partialRadio.checked = true;

    const reasonSelect = document.getElementById('returnReasonSelect');
    if (reasonSelect) reasonSelect.value = '';

    const notesEl = document.getElementById('returnCustomerNotes');
    if (notesEl) notesEl.value = '';

    this.renderReturnModalItems(order, 'partial');
    this.recalculateReturnTotal();

    modal.style.display = 'flex';
  },

  closeReturnModal() {
    const modal = document.getElementById('customerReturnModal');
    if (modal) modal.style.display = 'none';
    this.activeReturnOrderId = null;
  },

  checkItemReturnEligibility(order, item) {
    if (!order || !item) {
      return { eligible: false, reason: 'بيانات الصنف أو الطلب غير متوفرة' };
    }

    if (order.orderStatus === 'ملغي') {
      return { eligible: false, reason: 'الطلب ملغي' };
    }

    // Fallback if item does not have return metadata directly
    let isReturnable = item.isReturnable;
    let returnDays = item.returnDays;
    let isBundle = item.isBundle;

    if (isReturnable === undefined || returnDays === undefined || isBundle === undefined) {
      const prod = window.DB ? window.DB.find('products', item.productId) : null;
      if (prod) {
        if (isReturnable === undefined) isReturnable = prod.isReturnable !== false;
        if (returnDays === undefined) returnDays = prod.returnDays !== undefined ? prod.returnDays : 14;
        if (isBundle === undefined) isBundle = !!prod.isBundle;
      } else {
        if (isReturnable === undefined) isReturnable = true;
        if (returnDays === undefined) returnDays = 14;
        if (isBundle === undefined) isBundle = false;
      }
    }

    if (isReturnable === false) {
      return { eligible: false, reason: 'صنف غير خاضع لسياسة الاسترجاع 🚫' };
    }

    const allowedDays = parseInt(returnDays, 10);
    if (isNaN(allowedDays) || allowedDays <= 0) {
      return { eligible: false, reason: 'صنف غير قابل للاسترجاع (المهلة 0 يوم) 🚫' };
    }

    const parsedOrderDate = order.date ? new Date(order.date).getTime() : Date.now();
    const orderTime = isNaN(parsedOrderDate) ? Date.now() : parsedOrderDate;
    const nowTime = Date.now();
    const elapsedDays = Math.max(0, Math.floor((nowTime - orderTime) / (1000 * 60 * 60 * 24)));

    if (elapsedDays > allowedDays) {
      return { eligible: false, reason: `انتهت مهلة الاسترجاع المحددة (${allowedDays} يوماً) ⏳` };
    }

    const remainingQty = (item.quantity || 1) - (item.returnedQty || 0);
    if (remainingQty <= 0) {
      return { eligible: false, reason: 'تم استرجاع كامل الكمية سابقاً ✅' };
    }

    return {
      eligible: true,
      remainingDays: Math.max(0, allowedDays - elapsedDays),
      allowedDays,
      remainingQty,
      isBundle: !!isBundle
    };
  },

  renderReturnModalItems(order, scope = 'partial') {
    const container = document.getElementById('returnModalItemsContainer');
    if (!container) return;

    const items = order.items || [];
    let eligibleCount = 0;

    container.innerHTML = items.map((item, idx) => {
      const eligibility = this.checkItemReturnEligibility(order, item);
      if (eligibility.eligible) eligibleCount++;

      const isChecked = scope === 'full' && eligibility.eligible;
      const isBundle = item.isBundle || false;

      // Variant specifications display
      const variantTitle = item.variantTitle || '';
      const sizeText = item.size ? `المقاس: ${item.size}` : '';
      const colorText = item.color ? `اللون: ${item.color}` : '';

      return `
        <div class="return-item-card" data-idx="${idx}" data-price="${item.price}" data-eligible="${eligibility.eligible}" style="display:flex; align-items:center; gap:12px; padding:12px 14px; background:${eligibility.eligible ? '#fff' : '#f8fafc'}; border:1px solid ${eligibility.eligible ? '#cbd5e1' : '#e2e8f0'}; border-radius:10px; opacity:${eligibility.eligible ? '1' : '0.8'}; transition:all 0.2s;">
          <div style="display:flex; align-items:center;">
            <input type="checkbox" class="return-item-check" data-idx="${idx}" ${isChecked ? 'checked' : ''} ${!eligibility.eligible ? 'disabled' : ''} onchange="StoreApp.recalculateReturnTotal()" style="width:18px; height:18px; accent-color:#0d5c46; cursor:${eligibility.eligible ? 'pointer' : 'not-allowed'};">
          </div>
          <img src="${item.image}" alt="${item.name}" style="width:52px; height:52px; border-radius:8px; object-fit:cover; border:1px solid #e2e8f0;">
          <div style="flex:1; overflow:hidden;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong style="font-size:0.92rem; color:#1e293b;">${item.name}</strong>
              ${isBundle ? '<span style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-size:0.72rem; padding:2px 8px; border-radius:12px; font-weight:800;"><i class="fa-solid fa-box-archive"></i> باقة تجميعية (استرجاع كامل الباقة فقط)</span>' : ''}
            </div>

            <!-- Specific Variant Info (Size / Color) -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin:4px 0;">
              ${variantTitle ? `<span style="background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;">${variantTitle}</span>` : ''}
              ${sizeText ? `<span style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:800;">${sizeText}</span>` : ''}
              ${colorText ? `<span style="background:#fae8ff; color:#86198f; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:800;">${colorText}</span>` : ''}
              <span style="font-size:0.8rem; color:#64748b;">الكمية بالطلب: ${item.quantity}</span>
            </div>

            <!-- Return Status Badge -->
            <div>
              ${eligibility.eligible ? `
                <span style="display:inline-flex; align-items:center; gap:4px; color:#15803d; font-size:0.75rem; font-weight:800; background:#dcfce7; padding:2px 8px; border-radius:12px;">
                  <i class="fa-solid fa-circle-check"></i> مسموح بالاسترجاع (متبقي ${eligibility.remainingDays} يوم من أصل ${eligibility.allowedDays} يوم)
                </span>
              ` : `
                <span style="display:inline-flex; align-items:center; gap:4px; color:#991b1b; font-size:0.75rem; font-weight:800; background:#fee2e2; padding:2px 8px; border-radius:12px;">
                  <i class="fa-solid fa-circle-xmark"></i> ${eligibility.reason}
                </span>
              `}
            </div>
          </div>

          <!-- Quantity to Return & Price -->
          <div style="text-align:left; display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
            <div style="font-weight:900; color:#0d5c46; font-size:0.95rem;">${item.price} ر.س</div>
            ${eligibility.eligible ? `
              <div style="display:flex; align-items:center; gap:4px;">
                <label style="font-size:0.75rem; color:#64748b;">الكمية:</label>
                ${isBundle ? `
                  <input type="hidden" class="return-qty-select" data-idx="${idx}" value="${eligibility.remainingQty}">
                  <span style="font-size:0.8rem; font-weight:800; color:#b45309;">${eligibility.remainingQty} (كاملة)</span>
                ` : `
                  <select class="return-qty-select" data-idx="${idx}" onchange="StoreApp.recalculateReturnTotal()" style="padding:2px 6px; font-size:0.82rem; border-radius:6px; border:1px solid #cbd5e1; font-weight:700;">
                    ${Array.from({ length: eligibility.remainingQty }, (_, i) => i + 1).map(q => `
                      <option value="${q}" ${q === eligibility.remainingQty ? 'selected' : ''}>${q}</option>
                    `).join('')}
                  </select>
                `}
              </div>
            ` : `
              <span style="font-size:0.75rem; color:#94a3b8;">غير متاح</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    const noticeEl = document.getElementById('returnEligibleNotice');
    if (noticeEl) {
      noticeEl.textContent = `المؤهل للاسترجاع: ${eligibleCount} من أصل ${items.length} صنف`;
    }
  },

  handleReturnScopeChange(scope) {
    const notice = document.getElementById('returnScopeNotice');
    if (scope === 'full') {
      if (notice) {
        notice.innerHTML = `<strong>استرجاع الطلب كاملاً:</strong> تم تحديد كافة الأصناف المسموح بإرجاعها تلقائياً. تم استبعاد أي منتجات انتهت مدتها أو غير خاضعة للاسترجاع وفق سياسة المتجر.`;
        notice.style.color = '#065f46';
      }
      document.querySelectorAll('.return-item-check:not(:disabled)').forEach(cb => cb.checked = true);
    } else {
      if (notice) {
        notice.textContent = 'قم بتحديد المنتج الدقيق والمقاس أو اللون الذي تريد استرجاعه.';
        notice.style.color = '#64748b';
      }
      document.querySelectorAll('.return-item-check:not(:disabled)').forEach(cb => cb.checked = false);
    }
    this.recalculateReturnTotal();
  },

  recalculateReturnTotal() {
    let total = 0;
    const cards = document.querySelectorAll('.return-item-card');
    cards.forEach(card => {
      const cb = card.querySelector('.return-item-check');
      if (cb && cb.checked) {
        const price = parseFloat(card.getAttribute('data-price')) || 0;
        const qtyEl = card.querySelector('.return-qty-select');
        const qty = qtyEl ? (parseInt(qtyEl.value, 10) || 1) : 1;
        total += price * qty;
      }
    });

    const totalEl = document.getElementById('returnCalculatedRefundTotal');
    if (totalEl) {
      totalEl.textContent = `${total.toFixed(2)} ر.س`;
    }
  },

  submitReturnRequest(e) {
    if (e) e.preventDefault();

    if (!this.activeReturnOrderId) {
      this.showToast('لم يتم تحديد الطلب', 'error');
      return;
    }

    const order = window.DB.find('orders', this.activeReturnOrderId);
    if (!order) {
      this.showToast('بيانات الطلب غير موجودة', 'error');
      return;
    }

    const reason = document.getElementById('returnReasonSelect').value;
    if (!reason) {
      this.showToast('يرجى اختيار سبب طلب الاسترجاع', 'error');
      return;
    }

    const scope = (document.querySelector('input[name="returnScope"]:checked') || {}).value || 'partial';
    const refundMethod = document.getElementById('returnRefundMethodSelect').value;
    const notes = document.getElementById('returnCustomerNotes').value.trim();

    const selectedItems = [];
    let refundTotal = 0;

    const cards = document.querySelectorAll('.return-item-card');
    cards.forEach(card => {
      const cb = card.querySelector('.return-item-check');
      if (cb && cb.checked) {
        const idx = parseInt(cb.getAttribute('data-idx'), 10);
        const item = order.items[idx];
        if (item) {
          const qtyEl = card.querySelector('.return-qty-select');
          const qty = qtyEl ? (parseInt(qtyEl.value, 10) || 1) : 1;
          const itemPrice = item.price || 0;

          selectedItems.push({
            productId: item.productId,
            variantId: item.variantId || null,
            variantTitle: item.variantTitle || '',
            size: item.size || '',
            color: item.color || '',
            name: item.name,
            price: itemPrice,
            quantity: qty,
            isBundle: item.isBundle || false
          });

          refundTotal += itemPrice * qty;
        }
      }
    });

    if (selectedItems.length === 0) {
      this.showToast('يرجى تحديد صنف واحد على الأقل للاسترجاع', 'error');
      return;
    }

    const result = window.DB.createReturnRequest(order.id, {
      scope,
      reason,
      refundMethod,
      notes,
      items: selectedItems,
      refundTotal
    });

    if (result.success) {
      this.showToast(`تم تقديم طلب الاسترجاع بنجاح (رقم #${result.returnRequest.id}) وحالته الآن [تم طلب الاسترجاع]. سيتواصل معك المندوب لجدولة الاستلام. لا يُعاد المخزون ولا يُرد المبلغ إلا بعد الفحص واجتيازه بنجاح.`, 'success');
      this.closeReturnModal();
      this.renderAccountOrders();
      this.renderWalletCard();
    } else {
      this.showToast(result.message || 'حدث خطأ أثناء إرسال طلب الاسترجاع', 'error');
    }
  },

  showPage(slug) {
    this.activePageSlug = slug;
    window.location.hash = `page/${slug}`;
    this.switchView('page');
    
    const pages = window.DB.get('pages') || {};
    const page = pages[slug] || { title: 'صفحة المتجر', content: 'المحتوى قيد التحديث.' };

    document.getElementById('pageTitle').textContent = page.title;
    document.getElementById('pageContent').textContent = page.content;
  },

  /* ================= Utilities ================= */
  startCountdown() {
    // 12 hours deal countdown
    let totalSeconds = 12 * 3600 + 45 * 60 + 20;
    setInterval(() => {
      totalSeconds--;
      if (totalSeconds < 0) totalSeconds = 12 * 3600;
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      const elH = document.getElementById('dealHours');
      const elM = document.getElementById('dealMinutes');
      const elS = document.getElementById('dealSeconds');
      if (elH) elH.textContent = String(h).padStart(2, '0');
      if (elM) elM.textContent = String(m).padStart(2, '0');
      if (elS) elS.textContent = String(s).padStart(2, '0');
    }, 1000);
  },

  jumpToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    if (!slides.length) return;

    this.currentSlideIndex = index % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === this.currentSlideIndex);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentSlideIndex);
    });
  },

  startHeroSliderAutoplay() {
    if (this.heroSliderTimer) clearInterval(this.heroSliderTimer);
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;

    this.heroSliderTimer = setInterval(() => {
      const allSlides = document.querySelectorAll('.hero-slide');
      if (allSlides.length <= 1) return;
      let nextIndex = ((this.currentSlideIndex || 0) + 1) % allSlides.length;
      this.jumpToSlide(nextIndex);
    }, 5000);
  },

  scrollToProducts() {
    const el = document.getElementById('bestSellersSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-bell'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

window.StoreApp = StoreApp;
document.addEventListener('DOMContentLoaded', () => StoreApp.init());
