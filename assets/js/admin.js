/**
 * لوحة تحكم التاجر - AL-NUKHBAH ADMIN CONTROLLER
 * Full Management Engine for Products, Orders, Inventory, Theme & ZATCA Invoicing
 */

const AdminApp = {
  activeSection: 'dashboard',
  editingProductId: null,
  editingCategoryId: null,
  editingCouponId: null,
  editingSlideId: null,
  activeOrderId: null,

  init() {
    this.bindSidebar();
    this.showSection('dashboard');
    this.loadAdminProfile();
    this.initImageUploaders();
    this.renderHeroSlidesList();

    // Listen to DB updates
    window.addEventListener('salla_db_changed', () => {
      this.refreshCurrentSection();
    });
  },

  /* ================= Image Upload & Drag-and-Drop Management ================= */
  initImageUploaders() {
    ['prod', 'cat', 'slide', 'bundle'].forEach(type => {
      const dropzone = document.getElementById(
        type === 'prod' ? 'prodImageDropzone' : type === 'cat' ? 'catImageDropzone' : type === 'slide' ? 'slideImageDropzone' : 'bundleImageDropzone'
      );
      if (!dropzone) return;

      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, false);
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.add('drag-over');
        }, false);
      });

      ['dragleave', 'dragend', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.remove('drag-over');
        }, false);
      });

      dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
          this.readFileAndSetImage(files[0], type);
        }
      });
    });
  },

  handleImageFileSelect(input, type) {
    if (input.files && input.files.length > 0) {
      this.readFileAndSetImage(input.files[0], type);
    }
  },

  handleFileInput(input, type) {
    this.handleImageFileSelect(input, type);
  },

  readFileAndSetImage(file, type) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('عذراً، يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP, GIF, SVG)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('حجم الصورة كبير نسبياً (أكثر من 5 ميجابايت). يفضل اختيار صورة مناسبة لسرعة التصفح.', 'warning');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      const label = type === 'prod' ? 'المنتج' : type === 'cat' ? 'التصنيف' : type === 'slide' ? 'البنر' : 'الباقة';
      this.setImagePreview(type, dataUrl, file.name, `تم الرفع من الجهاز (${sizeStr})`);
      this.showToast(`تم تحميل صورة ${label} "${file.name}" ومعاينتها بنجاح!`, 'success');
      this.recalculateBundleMetrics();
    };
    reader.onerror = () => {
      this.showToast('حدث خطأ أثناء قراءة ملف الصورة من جهازك', 'error');
    };
    reader.readAsDataURL(file);
  },

  setImagePreview(type, src, name = '', meta = '') {
    if (!src) return;
    const input = document.getElementById(type === 'prod' ? 'prodImageUrlInput' : type === 'cat' ? 'catImageInput' : type === 'slide' ? 'slideImageUrlInput' : 'bundleImageUrlInput');
    const dropzone = document.getElementById(type === 'prod' ? 'prodImageDropzone' : type === 'cat' ? 'catImageDropzone' : type === 'slide' ? 'slideImageDropzone' : 'bundleImageDropzone');
    const previewCard = document.getElementById(type === 'prod' ? 'prodImagePreviewCard' : type === 'cat' ? 'catImagePreviewCard' : type === 'slide' ? 'slideImagePreviewCard' : 'bundleImagePreviewCard');
    const previewImg = document.getElementById(type === 'prod' ? 'prodImagePreviewImg' : type === 'cat' ? 'catImagePreviewImg' : type === 'slide' ? 'slideImagePreviewImg' : 'bundleImagePreviewImg');
    const previewName = document.getElementById(type === 'prod' ? 'prodImagePreviewName' : type === 'cat' ? 'catImagePreviewName' : type === 'slide' ? 'slideImagePreviewName' : 'bundleImagePreviewName');
    const previewMeta = document.getElementById(type === 'prod' ? 'prodImagePreviewMeta' : type === 'cat' ? 'catImagePreviewMeta' : type === 'slide' ? 'slideImagePreviewMeta' : 'bundleImagePreviewMeta');

    if (input) input.value = src;
    if (previewImg) previewImg.src = src;
    if (previewName) previewName.textContent = name || (type === 'prod' ? 'صورة المنتج' : type === 'cat' ? 'صورة التصنيف' : type === 'slide' ? 'صورة البنر' : 'صورة الباقة');
    if (previewMeta) previewMeta.textContent = meta || 'جاهزة للعرض والحفظ في المتجر';

    if (dropzone) dropzone.style.display = 'none';
    if (previewCard) previewCard.style.display = 'flex';
  },

  removeUploadedImage(type) {
    const input = document.getElementById(type === 'prod' ? 'prodImageUrlInput' : type === 'cat' ? 'catImageInput' : type === 'slide' ? 'slideImageUrlInput' : 'bundleImageUrlInput');
    const fileInput = document.getElementById(type === 'prod' ? 'prodImageFileInput' : type === 'cat' ? 'catImageFileInput' : type === 'slide' ? 'slideImageFileInput' : 'bundleImageFileInput');
    const dropzone = document.getElementById(type === 'prod' ? 'prodImageDropzone' : type === 'cat' ? 'catImageDropzone' : type === 'slide' ? 'slideImageDropzone' : 'bundleImageDropzone');
    const previewCard = document.getElementById(type === 'prod' ? 'prodImagePreviewCard' : type === 'cat' ? 'catImagePreviewCard' : type === 'slide' ? 'slideImagePreviewCard' : 'bundleImagePreviewCard');
    const previewImg = document.getElementById(type === 'prod' ? 'prodImagePreviewImg' : type === 'cat' ? 'catImagePreviewImg' : type === 'slide' ? 'slideImagePreviewImg' : 'bundleImagePreviewImg');

    if (input) input.value = '';
    if (fileInput) fileInput.value = '';
    if (previewImg) previewImg.src = '';

    if (previewCard) previewCard.style.display = 'none';
    if (dropzone) dropzone.style.display = 'block';
  },

  toggleUrlInput(type) {
    const wrapper = document.getElementById(type === 'prod' ? 'prodUrlInputWrapper' : type === 'cat' ? 'catUrlInputWrapper' : type === 'slide' ? 'slideUrlInputWrapper' : 'bundleUrlInputWrapper');
    if (wrapper) {
      const isHidden = wrapper.style.display === 'none';
      wrapper.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        const input = document.getElementById(type === 'prod' ? 'prodImageUrlInput' : type === 'cat' ? 'catImageInput' : type === 'slide' ? 'slideImageUrlInput' : 'bundleImageUrlInput');
        if (input) input.focus();
      }
    }
  },

  handleUrlInput(input, type) {
    const url = input.value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('assets/') || url.startsWith('data:'))) {
      const label = type === 'prod' ? 'صورة المنتج' : type === 'cat' ? 'صورة التصنيف' : type === 'slide' ? 'صورة البنر' : 'صورة الباقة';
      this.setImagePreview(type, url, `${label} (رابط خارجي)`, url);
    }
  },

  bindSidebar() {
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        if (section) this.showSection(section);
      });
    });
  },

  loadAdminProfile() {
    const settings = window.DB.get('settings') || {};
    const titleEl = document.getElementById('adminSidebarStoreName');
    if (titleEl) titleEl.textContent = settings.storeName || 'متجر النخبة';
  },

  toggleMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (backdrop) backdrop.classList.toggle('active');
  },

  closeMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  },

  showSection(sectionName) {
    this.closeMobileSidebar();
    this.activeSection = sectionName;

    // Update sidebar active class
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      if (item.getAttribute('data-section') === sectionName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update section visibility
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`admin-sec-${sectionName}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.renderSectionContent(sectionName);
  },

  refreshCurrentSection() {
    this.renderSectionContent(this.activeSection);
  },

  renderSectionContent(sectionName) {
    switch (sectionName) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'products':
        this.renderProductsTable();
        break;
      case 'bundles':
        this.renderBundles();
        break;
      case 'categories':
        this.renderCategoriesTable();
        break;
      case 'inventory':
        this.renderInventoryTable();
        break;
      case 'orders':
        this.renderOrdersTable();
        break;
      case 'customers':
        this.renderCustomersTable();
        break;
      case 'coupons':
        this.renderCouponsTable();
        break;
      case 'shipping':
        this.renderShippingConfig();
        break;
      case 'payments':
      case 'finance':
        this.renderFinance();
        break;
      case 'invoices':
        this.renderInvoicesTable();
        break;
      case 'reviews':
        this.renderReviewsTable();
        break;
      case 'theme':
        this.renderThemeCustomizer();
        break;
      case 'settings':
        this.renderStoreSettings();
        break;
      case 'audit':
        this.renderAuditLogs();
        break;
    }
  },

  /* ================= 1. Dashboard Overview & Financial Metrics ================= */
  calculateFinancialMetrics() {
    const orders = window.DB.get('orders') || [];
    const products = window.DB.get('products') || [];
    const bundles = window.DB.get('bundles') || [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let allTimeSales = 0;
    let allTimeProfit = 0;
    let yearlySales = 0;
    let yearlyProfit = 0;
    let monthlySales = 0;
    let monthlyProfit = 0;
    let validOrdersCount = 0;

    orders.forEach(o => {
      if (o.orderStatus === 'ملغي') return;

      // Check COD and delivery status
      const isCod = (
        o.paymentMethod === 'cod' ||
        o.paymentMethod === 'الدفع عند الاستلام' ||
        (typeof o.paymentMethod === 'string' && (o.paymentMethod.includes('الاستلام') || o.paymentMethod.toLowerCase().includes('cod'))) ||
        (typeof o.paymentMethod === 'object' && o.paymentMethod !== null && ((o.paymentMethod.id || '').toLowerCase().includes('cod') || (o.paymentMethod.name || '').includes('الاستلام')))
      );
      const isDelivered = (o.shippingStatus === 'تم التسليم' || o.orderStatus === 'مكتمل');

      // Cash On Delivery rule: money and profit do NOT arrive until delivered!
      if (isCod && !isDelivered) return;
      if (!isCod && (o.paymentStatus === 'بانتظار الدفع' || o.paymentStatus === 'معلق' || o.paymentStatus === 'في انتظار الدفع' || o.paymentStatus === 'غير مدفوع')) return;


      const isFullReturn = (o.orderStatus === 'مسترجع' || o.paymentStatus === 'مسترد');
      const orderTotal = Number(o.total) || 0;
      const orderSubtotal = Number(o.subtotal) || orderTotal;
      const orderDiscount = Number(o.discount) || 0;
      const orderDate = new Date(o.date);
      const isYear = orderDate.getFullYear() === currentYear;
      const isMonth = isYear && (orderDate.getMonth() === currentMonth);

      // Cost of Goods Sold (COGS)
      let cogs = 0;
      if (Array.isArray(o.items)) {
        o.items.forEach(it => {
          let unitCost = 0;
          if (it.isBundle) {
            const b = bundles.find(bnd => bnd.productId === it.productId || bnd.id === it.productId);
            if (b && Array.isArray(b.components)) {
              unitCost = b.components.reduce((sum, c) => sum + ((Number(c.costPrice) || 0) * (Number(c.quantity) || 1)), 0) + (Number(b.additionalCosts) || 0);
            } else {
              const prod = products.find(p => p.id === it.productId);
              unitCost = prod && prod.costPrice ? Number(prod.costPrice) : (Number(it.price) * 0.45);
            }
          } else {
            const prod = products.find(p => p.id === it.productId);
            unitCost = prod && typeof prod.costPrice === 'number' && prod.costPrice > 0
              ? prod.costPrice
              : (Number(it.price) * 0.45);
          }
          cogs += unitCost * (Number(it.quantity) || 1);
        });
      }

      // Check returns on this order
      let orderRefundAmount = 0;
      let orderReturnedCogs = 0;

      if (Array.isArray(o.returns)) {
        o.returns.forEach(r => {
          if (r.status === 'مرفوض بعد الفحص' || r.status === 'ملغي') return;
          orderRefundAmount += Number(r.refundTotal) || 0;

          if (Array.isArray(r.items)) {
            r.items.forEach(retIt => {
              const rQty = Number(retIt.quantity) || 1;
              const rPrice = Number(retIt.price) || 0;
              let uCost = 0;
              const prod = products.find(p => p.id === retIt.productId);
              uCost = prod && typeof prod.costPrice === 'number' && prod.costPrice > 0
                ? prod.costPrice
                : (rPrice * 0.45);
              orderReturnedCogs += uCost * rQty;
            });
          }
        });
      }

      if (isFullReturn) {
        orderRefundAmount = Math.max(orderRefundAmount, orderTotal);
        orderReturnedCogs = Math.max(orderReturnedCogs, cogs);
      }

      // Effective Net figures for this order (Deducting refunds and returned profits)
      const effectiveSales = Math.max(0, orderTotal - orderRefundAmount);
      const effectiveNetRevenue = Math.max(0, (orderSubtotal - orderDiscount) - orderRefundAmount);
      const effectiveCogs = Math.max(0, cogs - orderReturnedCogs);
      const effectiveProfit = Math.max(0, effectiveNetRevenue - effectiveCogs);

      if (effectiveSales > 0) {
        validOrdersCount++;
      }

      allTimeSales += effectiveSales;
      allTimeProfit += effectiveProfit;

      if (isYear) {
        yearlySales += effectiveSales;
        yearlyProfit += effectiveProfit;
      }
      if (isMonth) {
        monthlySales += effectiveSales;
        monthlyProfit += effectiveProfit;
      }
    });

    const aov = validOrdersCount > 0 ? (allTimeSales / validOrdersCount) : 0;
    const marginPercent = allTimeSales > 0 ? ((allTimeProfit / allTimeSales) * 100) : 0;

    return {
      allTimeSales,
      allTimeProfit,
      yearlySales,
      yearlyProfit,
      monthlySales,
      monthlyProfit,
      validOrdersCount,
      aov,
      marginPercent,
      currentYear,
      monthName: now.toLocaleDateString('ar-SA', { month: 'long' })
    };
  },

  renderDashboard() {
    const orders = window.DB.get('orders') || [];
    const products = window.DB.get('products') || [];
    const lowStockCount = products.filter(p => p.stock <= (p.alertThreshold || 5)).length;

    const metrics = this.calculateFinancialMetrics();

    // Populate Sales KPIs
    const elMonthSales = document.getElementById('kpiMonthlySales');
    const elYearSales = document.getElementById('kpiYearlySales');
    const elTotalSales = document.getElementById('kpiTotalSales');

    if (elMonthSales) elMonthSales.textContent = `${metrics.monthlySales.toFixed(2)} ر.س`;
    if (elYearSales) elYearSales.textContent = `${metrics.yearlySales.toFixed(2)} ر.س`;
    if (elTotalSales) elTotalSales.textContent = `${metrics.allTimeSales.toFixed(2)} ر.س`;

    // Populate Profit KPIs
    const elMonthProfit = document.getElementById('kpiMonthlyProfit');
    const elYearProfit = document.getElementById('kpiYearlyProfit');
    const elAllTimeProfit = document.getElementById('kpiAllTimeProfit');

    if (elMonthProfit) elMonthProfit.textContent = `${metrics.monthlyProfit.toFixed(2)} ر.س`;
    if (elYearProfit) elYearProfit.textContent = `${metrics.yearlyProfit.toFixed(2)} ر.س`;
    if (elAllTimeProfit) elAllTimeProfit.textContent = `${metrics.allTimeProfit.toFixed(2)} ر.س`;

    // Operational KPIs
    const elTotalOrders = document.getElementById('kpiTotalOrders');
    const elAov = document.getElementById('kpiAvgOrderValue');
    const elMargin = document.getElementById('kpiProfitMargin');
    const elLowStock = document.getElementById('kpiLowStock');

    if (elTotalOrders) elTotalOrders.textContent = orders.length;
    if (elAov) elAov.textContent = `${metrics.aov.toFixed(2)} ر.س`;
    if (elMargin) elMargin.textContent = `${metrics.marginPercent.toFixed(1)}%`;
    if (elLowStock) elLowStock.textContent = lowStockCount;

    // Collect all returns (including individual returns and returned orders)
    const allReturns = [];
    let totalRefunded = 0;
    orders.forEach(o => {
      let orderHasReturnObj = false;
      if (o.returns && Array.isArray(o.returns)) {
        o.returns.forEach(r => {
          if (r.status === 'مرفوض بعد الفحص' || r.status === 'ملغي') return;
          orderHasReturnObj = true;
          allReturns.push({ order: o, returnRequest: r });
          totalRefunded += Number(r.refundTotal) || 0;
        });
      }
      if (!orderHasReturnObj && (o.orderStatus === 'مسترجع' || o.paymentStatus === 'مسترد')) {
        totalRefunded += Number(o.total) || 0;
        allReturns.push({
          order: o,
          returnRequest: {
            id: 'RET-' + (o.orderNumber || o.id),
            status: 'طلب مسترجع بالكامل',
            refundTotal: Number(o.total) || 0,
            reason: 'استرجاع الطلب عبر لوحة التحكم'
          }
        });
      }
    });

    const elRetCount = document.getElementById('kpiReturnsCount');
    const elRetRefunded = document.getElementById('kpiReturnsTotalRefunded');
    if (elRetCount) elRetCount.textContent = allReturns.length;
    if (elRetRefunded) elRetRefunded.textContent = `${totalRefunded.toFixed(2)} ر.س`;

    // Render Live Return Requests Alert Banners
    const alertContainer = document.getElementById('adminReturnsAlertContainer');
    if (alertContainer) {
      if (allReturns.length === 0) {
        alertContainer.innerHTML = '';
      } else {
        alertContainer.innerHTML = allReturns.map(({ order, returnRequest: ret }) => `
          <div class="admin-alert-banner" style="background:#fff7ed; border:1.5px solid #fdba74; border-radius:12px; padding:16px 20px; margin-bottom:14px; box-shadow:0 4px 14px rgba(234,88,12,0.1); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:44px; height:44px; border-radius:50%; background:#ffedd5; color:#ea580c; display:flex; align-items:center; justify-content:center; font-size:1.3rem;">
                <i class="fa-solid fa-rotate-left"></i>
              </div>
              <div>
                <div style="font-weight:900; color:#9a3412; font-size:1.05rem;">
                  🔔 تنبيه تشغيلي: طلب استرجاع مسجل للطلب #${order.orderNumber}
                </div>
                <div style="color:#c2410c; font-size:0.85rem; margin-top:2px;">
                  العميل: <strong>${order.customer ? order.customer.name : 'عميل المتجر'}</strong> | الحالة الحالية: <strong style="color:#9a3412; background:#ffedd5; padding:2px 8px; border-radius:6px;">[${ret.status}]</strong> | القيمة: <strong style="font-weight:900;">${ret.refundTotal.toFixed(2)} ر.س</strong>
                </div>
              </div>
            </div>
            <button type="button" class="btn-admin-primary" style="background:#ea580c; border-color:#ea580c; padding:8px 18px; font-size:0.85rem; font-weight:800;" onclick="AdminApp.viewOrderDetails('${order.id}')">
              <i class="fa-solid fa-eye"></i> معاينة الطلب #${order.orderNumber}
            </button>
          </div>
        `).join('');
      }
    }

    // Badges
    const elMonthBadge = document.getElementById('kpiMonthBadge');
    const elYearBadge = document.getElementById('kpiYearBadge');
    if (elMonthBadge) elMonthBadge.textContent = metrics.monthName;
    if (elYearBadge) elYearBadge.textContent = `عام ${metrics.currentYear}`;

    // Recent orders table
    const recentOrdersTable = document.getElementById('dashboardRecentOrdersTable');
    if (recentOrdersTable) {
      recentOrdersTable.innerHTML = orders.slice(0, 5).map(o => `
        <tr>
          <td><strong>#${o.orderNumber}</strong></td>
          <td>${o.customer ? o.customer.name : 'عميل زائر'}</td>
          <td>${new Date(o.date).toLocaleDateString('ar-SA')}</td>
          <td><strong>${Number(o.total).toFixed(2)} ر.س</strong></td>
          <td><span class="status-pill ${this.getStatusPillClass(o.orderStatus)}">${o.orderStatus}</span></td>
          <td>
            <button class="btn-admin-outline" style="padding:6px 12px; font-size:0.8rem;" onclick="AdminApp.viewOrderDetails('${o.id}')">
              <i class="fa-solid fa-eye"></i> التفاصيل
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Low stock warnings
    const lowStockContainer = document.getElementById('dashboardLowStockList');
    if (lowStockContainer) {
      const lowItems = products.filter(p => p.stock <= (p.alertThreshold || 5));
      if (lowItems.length === 0) {
        lowStockContainer.innerHTML = `<div style="color:#10b981; font-weight:700;"><i class="fa-solid fa-check-circle"></i> كافة المنتجات متوفرة بكميات كافية</div>`;
      } else {
        lowStockContainer.innerHTML = lowItems.map(p => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--admin-border);">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${p.image}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;">
              <div>
                <strong style="font-size:0.9rem;">${p.name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">SKU: ${p.sku}</div>
              </div>
            </div>
            <span style="background:#fef2f2; color:#ef4444; font-weight:800; font-size:0.8rem; padding:4px 10px; border-radius:6px;">
              متبقي ${p.stock} فقط
            </span>
          </div>
        `).join('');
      }
    }
  },

  /* ================= 2. Products Management ================= */
  renderProductsTable() {
    const products = window.DB.get('products') || [];
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${p.image}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; border:1px solid var(--admin-border);">
            <div>
              <strong style="font-size:0.95rem; color:var(--text-main);">${p.name}</strong>
              <div style="font-size:0.78rem; color:var(--text-muted); font-family:monospace;">${p.sku}</div>
            </div>
          </div>
        </td>
        <td>${p.categoryName || '-'}</td>
        <td>
          <strong>${p.salePrice != null && p.salePrice > 0 ? p.salePrice : p.regularPrice} ر.س</strong>
          ${p.salePrice != null && p.salePrice > 0 && p.regularPrice > p.salePrice ? `<div style="font-size:0.75rem; color:var(--text-light); text-decoration:line-through;">${p.regularPrice} ر.س</div>` : ''}
        </td>
        <td>
          <div>
            <strong style="font-size:1rem; ${p.stock <= (p.alertThreshold || 5) ? 'color:#ef4444;' : 'color:#10b981;'}">
              ${p.stock} قطعة
            </strong>
            ${p.variants && p.variants.length > 0 ? `
              <div style="margin-top:3px;">
                <span style="background:#e0f2fe; color:#0369a1; font-size:0.75rem; padding:2px 8px; border-radius:999px; font-weight:700;">
                  <i class="fa-solid fa-layer-group"></i> ${p.variants.length} تركيبات (مقاس ولون)
                </span>
              </div>
            ` : ''}
          </div>
        </td>
        <td>
          <span class="status-pill ${p.status === 'published' ? 'completed' : 'processing'}">
            ${p.status === 'published' ? 'منشور في المتجر' : 'مسودة'}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:8px;">
            <button class="btn-admin-outline" style="padding:6px 12px; font-size:0.8rem;" onclick="AdminApp.editProduct('${p.id}')">
              <i class="fa-solid fa-pen-to-square"></i> تعديل
            </button>
            <button class="btn-admin-outline" style="padding:6px 10px; color:#ef4444;" onclick="AdminApp.deleteProduct('${p.id}')" title="حذف">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openProductModal(productId = null) {
    this.editingProductId = productId;
    const modal = document.getElementById('productFormModal');
    const modalTitle = document.getElementById('productModalTitle');
    const categories = window.DB.get('categories') || [];

    // Populate category dropdown
    const catSelect = document.getElementById('prodCategorySelect');
    if (catSelect) {
      catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    const varCheck = document.getElementById('prodHasVariantsCheck');
    const varTbody = document.getElementById('variantsFormTableBody');
    if (varTbody) varTbody.innerHTML = '';

    if (productId) {
      const prod = window.DB.find('products', productId);
      if (!prod) return;
      modalTitle.textContent = 'تعديل بيانات المنتج';
      document.getElementById('prodNameInput').value = prod.name;
      document.getElementById('prodSkuInput').value = prod.sku;
      document.getElementById('prodCategorySelect').value = prod.categoryId;
      document.getElementById('prodSalePriceInput').value = (prod.salePrice !== undefined && prod.salePrice !== null) ? prod.salePrice : '';
      document.getElementById('prodRegPriceInput').value = (prod.regularPrice !== undefined && prod.regularPrice !== null) ? prod.regularPrice : (prod.salePrice || '');
      document.getElementById('prodCostPriceInput').value = prod.costPrice || 0;
      document.getElementById('prodStockInput').value = prod.stock;
      document.getElementById('prodImageUrlInput').value = prod.image || '';
      document.getElementById('prodDescInput').value = prod.description || '';
      document.getElementById('prodBadgeInput').value = prod.badge || '';

      document.getElementById('prodTypeSelect').value = prod.productType || (prod.isBundle ? 'bundle' : 'product');
      document.getElementById('prodIsReturnableSelect').value = prod.isReturnable === false ? 'false' : 'true';
      document.getElementById('prodReturnDaysInput').value = prod.returnDays !== undefined ? prod.returnDays : 14;
      this.handleReturnableChange(document.getElementById('prodIsReturnableSelect').value);

      if (prod.image) {
        this.setImagePreview('prod', prod.image, prod.name, 'صورة المنتج المحفوظة');
      } else {
        this.removeUploadedImage('prod');
      }

      if (prod.variants && prod.variants.length > 0) {
        if (varCheck) varCheck.checked = true;
        document.getElementById('variantsBuilderWrapper').style.display = 'block';
        document.getElementById('addVariantRowBtn').style.display = 'inline-block';
        document.getElementById('prodStockInput').readOnly = true;
        document.getElementById('prodStockInput').style.background = '#f1f5f9';

        prod.variants.forEach(v => {
          this.addVariantFormRow(v.title, v.sku, v.price, v.stock, v.id);
        });
        this.recalculateVariantFormTotals();
      } else {
        if (varCheck) varCheck.checked = false;
        document.getElementById('variantsBuilderWrapper').style.display = 'none';
        document.getElementById('addVariantRowBtn').style.display = 'none';
        document.getElementById('prodStockInput').readOnly = false;
        document.getElementById('prodStockInput').style.background = '#ffffff';
      }
    } else {
      modalTitle.textContent = 'إضافة منتج أو باقة جديدة للمتجر';
      document.getElementById('productForm').reset();
      this.editingProductId = null;
      this.removeUploadedImage('prod');
      document.getElementById('prodTypeSelect').value = 'product';
      document.getElementById('prodIsReturnableSelect').value = 'true';
      document.getElementById('prodReturnDaysInput').value = 14;
      this.handleReturnableChange('true');
      if (varCheck) varCheck.checked = false;
      document.getElementById('variantsBuilderWrapper').style.display = 'none';
      document.getElementById('addVariantRowBtn').style.display = 'none';
      document.getElementById('prodStockInput').readOnly = false;
      document.getElementById('prodStockInput').style.background = '#ffffff';
    }

    modal.classList.add('active');
  },

  closeProductModal() {
    document.getElementById('productFormModal').classList.remove('active');
  },

  handleProductTypeChange(type) {
    const isBundle = type === 'bundle';
    const badgeInput = document.getElementById('prodBadgeInput');
    if (isBundle && badgeInput && !badgeInput.value) {
      badgeInput.value = 'باقة توفير 🎁';
    }
  },

  handleReturnableChange(val) {
    const isReturnable = val === 'true';
    const wrapper = document.getElementById('prodReturnDaysWrapper');
    if (wrapper) {
      wrapper.style.display = isReturnable ? 'block' : 'none';
    }
  },

  toggleProductVariantsUI() {
    const isChecked = document.getElementById('prodHasVariantsCheck').checked;
    const wrapper = document.getElementById('variantsBuilderWrapper');
    const addBtn = document.getElementById('addVariantRowBtn');
    const stockInput = document.getElementById('prodStockInput');
    const tbody = document.getElementById('variantsFormTableBody');

    if (isChecked) {
      if (wrapper) wrapper.style.display = 'block';
      if (addBtn) addBtn.style.display = 'inline-block';
      if (stockInput) {
        stockInput.readOnly = true;
        stockInput.style.background = '#f1f5f9';
        stockInput.title = 'محسوب تلقائياً من مجموع كميات المتغيرات';
      }
      if (tbody && tbody.children.length === 0) {
        // Add sample default variant rows
        this.addVariantFormRow('S + أحمر', '', '', 5);
        this.addVariantFormRow('S + أخضر', '', '', 10);
      }
      this.recalculateVariantFormTotals();
    } else {
      if (wrapper) wrapper.style.display = 'none';
      if (addBtn) addBtn.style.display = 'none';
      if (stockInput) {
        stockInput.readOnly = false;
        stockInput.style.background = '#ffffff';
        stockInput.title = '';
      }
    }
  },

  addVariantFormRow(title = '', sku = '', price = '', stock = 0, variantId = null) {
    const tbody = document.getElementById('variantsFormTableBody');
    if (!tbody) return;
    const rowId = variantId || ('v-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4));
    const salePrice = price || document.getElementById('prodSalePriceInput').value || 100;
    const prodSku = sku || (document.getElementById('prodSkuInput').value ? document.getElementById('prodSkuInput').value + '-' + (tbody.children.length + 1) : '');

    const tr = document.createElement('tr');
    tr.id = `vrow-${rowId}`;
    tr.setAttribute('data-variant-id', rowId);
    tr.style.borderBottom = '1px solid #e2e8f0';
    tr.innerHTML = `
      <td style="padding:6px;">
        <input type="text" class="admin-input variant-row-title" style="padding:4px 8px; font-size:0.85rem;" value="${title}" placeholder="مثال: S + أحمر" required>
      </td>
      <td style="padding:6px;">
        <input type="text" class="admin-input variant-row-sku" style="padding:4px 8px; font-size:0.85rem; font-family:monospace;" value="${prodSku}" placeholder="SKU-VAR">
      </td>
      <td style="padding:6px; width:110px;">
        <input type="number" class="admin-input variant-row-price" style="padding:4px 8px; font-size:0.85rem;" value="${salePrice}" step="0.5" required>
      </td>
      <td style="padding:6px; width:110px;">
        <input type="number" class="admin-input variant-row-stock" style="padding:4px 8px; font-size:0.85rem; font-weight:700;" value="${stock}" min="0" oninput="AdminApp.recalculateVariantFormTotals()" required>
      </td>
      <td style="padding:6px; text-align:center;">
        <button type="button" class="btn-admin-outline" style="padding:4px 8px; color:#ef4444;" onclick="AdminApp.removeVariantFormRow(this)" title="حذف التركيبة">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
    this.recalculateVariantFormTotals();
  },

  removeVariantFormRow(btn) {
    const tr = btn.closest('tr');
    if (tr) tr.remove();
    this.recalculateVariantFormTotals();
  },

  recalculateVariantFormTotals() {
    const stockInputs = document.querySelectorAll('.variant-row-stock');
    let total = 0;
    stockInputs.forEach(inp => {
      total += parseInt(inp.value, 10) || 0;
    });

    const display = document.getElementById('variantsCalculatedTotalStock');
    if (display) display.textContent = total;

    const stockInput = document.getElementById('prodStockInput');
    const varCheck = document.getElementById('prodHasVariantsCheck');
    if (stockInput && varCheck && varCheck.checked) {
      stockInput.value = total;
    }
  },

  saveProductForm(e) {
    e.preventDefault();
    const name = document.getElementById('prodNameInput').value.trim();
    const sku = document.getElementById('prodSkuInput').value.trim();
    const categoryId = document.getElementById('prodCategorySelect').value;
    const categories = window.DB.get('categories') || [];
    const cat = categories.find(c => c.id === categoryId);

    const regPriceVal = document.getElementById('prodRegPriceInput').value.trim();
    const regularPrice = parseFloat(regPriceVal) || 0;

    const salePriceVal = document.getElementById('prodSalePriceInput').value.trim();
    const salePrice = (salePriceVal !== '' && !isNaN(parseFloat(salePriceVal))) ? parseFloat(salePriceVal) : null;

    const costPrice = parseFloat(document.getElementById('prodCostPriceInput').value) || 0;
    const image = document.getElementById('prodImageUrlInput').value.trim() || 'assets/images/hero_banner_1.jpg';
    const description = document.getElementById('prodDescInput').value.trim();
    const badge = document.getElementById('prodBadgeInput').value.trim();
    const hasVariants = document.getElementById('prodHasVariantsCheck').checked;

    const productType = document.getElementById('prodTypeSelect').value;
    const isBundle = productType === 'bundle';
    const isReturnable = document.getElementById('prodIsReturnableSelect').value === 'true';
    const returnDays = isReturnable ? (parseInt(document.getElementById('prodReturnDaysInput').value, 10) || 0) : 0;

    if (!name || !sku || !regularPrice || regularPrice <= 0) {
      this.showToast('يرجى إدخال اسم المنتج، رمز SKU، والسعر الأصلي الأساسي بشكل صحيح', 'error');
      return;
    }

    let variants = [];
    let calculatedStock = parseInt(document.getElementById('prodStockInput').value) || 0;

    if (hasVariants) {
      const rows = document.querySelectorAll('#variantsFormTableBody tr');
      rows.forEach(tr => {
        const vId = tr.getAttribute('data-variant-id') || ('v-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4));
        const vTitle = tr.querySelector('.variant-row-title').value.trim();
        const vSku = tr.querySelector('.variant-row-sku').value.trim() || sku;
        const vPrice = parseFloat(tr.querySelector('.variant-row-price').value) || salePrice;
        const vStock = parseInt(tr.querySelector('.variant-row-stock').value, 10) || 0;

        if (vTitle) {
          variants.push({
            id: vId,
            title: vTitle,
            sku: vSku,
            price: vPrice,
            regularPrice: regularPrice,
            stock: Math.max(0, vStock)
          });
        }
      });

      // 6. Single Source of Truth: Total stock is strictly the sum of variants
      calculatedStock = variants.reduce((sum, v) => sum + v.stock, 0);
    }

    if (this.editingProductId) {
      const updates = {
        name,
        sku,
        categoryId,
        categoryName: cat ? cat.name : '',
        salePrice,
        regularPrice,
        costPrice,
        stock: calculatedStock,
        hasVariants,
        variants: hasVariants ? variants : [],
        productType,
        isBundle,
        isReturnable,
        returnDays,
        image,
        description,
        badge
      };
      window.DB.update('products', this.editingProductId, updates);
      window.DB.recordAuditLog('تعديل منتج', name, 'مدير المتجر', `تحديث السعر والمخزون (${calculatedStock} قطعة) لـ ${sku}`);
      this.showToast('تم تحديث المنتج وحفظ المتغيرات والمخزون بنجاح!', 'success');
    } else {
      const newProd = {
        name,
        sku,
        categoryId,
        categoryName: cat ? cat.name : '',
        salePrice,
        regularPrice,
        costPrice,
        stock: calculatedStock,
        hasVariants,
        variants: hasVariants ? variants : [],
        productType,
        isBundle,
        isReturnable,
        returnDays,
        alertThreshold: 5,
        rating: 5.0,
        reviewsCount: 1,
        image,
        gallery: [image],
        description,
        badge,
        status: 'published',
        isBestSeller: false,
        isNew: true
      };
      window.DB.insert('products', newProd);
      window.DB.recordAuditLog('إضافة منتج جديد', name, 'مدير المتجر', `إضافة منتج جديد برمز ${sku} بإجمالي مخزون ${calculatedStock} قطعة`);
      this.showToast('تمت إضافة المنتج الجديد مع المتغيرات بنجاح!', 'success');
    }

    this.closeProductModal();
    this.renderProductsTable();
    this.renderInventoryTable();
  },

  editProduct(productId) {
    this.openProductModal(productId);
  },

  deleteProduct(productId) {
    const prod = window.DB.find('products', productId);
    if (!prod) return;
    if (confirm(`هل أنت متأكد من رغبتك في حذف المنتج "${prod.name}" من المتجر؟`)) {
      window.DB.delete('products', productId);
      // Clean up orphaned reviews
      const allReviews = window.DB.get('reviews') || [];
      const remainingReviews = allReviews.filter(r => String(r.productId) !== String(productId));
      const fullData = window.DB.getAllData();
      fullData.reviews = remainingReviews;
      window.DB.saveData(fullData);

      window.DB.recordAuditLog('حذف منتج', prod.name, 'مدير المتجر', `حذف المنتج برمز ${prod.sku}`);
      this.showToast('تم حذف المنتج بنجاح', 'info');
      this.renderProductsTable();
    }
  },

  /* ================= 3. Orders Management ================= */
  renderOrdersTable(filterStatus = 'all') {
    const orders = window.DB.get('orders') || [];
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const filtered = filterStatus === 'all'
      ? orders
      : orders.filter(o => o.orderStatus === filterStatus);

    tbody.innerHTML = filtered.map(o => `
      <tr>
        <td><strong>#${o.orderNumber}</strong></td>
        <td>
          <div style="font-weight:700;">${o.customer ? o.customer.name : 'عميل زائر'}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${o.customer ? o.customer.phone : ''} | ${o.customer ? o.customer.city : ''}</div>
        </td>
        <td>${new Date(o.date).toLocaleDateString('ar-SA')}</td>
        <td><strong>${o.total.toFixed(2)} ر.س</strong></td>
        <td>
          <span class="status-pill ${this.getStatusPillClass(o.orderStatus)}">${o.orderStatus}</span>
        </td>
        <td>
          ${(function() {
            const isCod = (
              o.paymentMethod === 'cod' ||
              o.paymentMethod === 'الدفع عند الاستلام' ||
              (typeof o.paymentMethod === 'string' && (o.paymentMethod.includes('الاستلام') || o.paymentMethod.toLowerCase().includes('cod'))) ||
              (typeof o.paymentMethod === 'object' && o.paymentMethod !== null && ((o.paymentMethod.id || '').toLowerCase().includes('cod') || (o.paymentMethod.name || '').includes('الاستلام')))
            );
            const isDelivered = (o.shippingStatus === 'تم التسليم' || o.orderStatus === 'مكتمل');
            const displayPaymentStatus = (isCod && !isDelivered) ? 'بانتظار الدفع' : (o.paymentStatus || 'مدفوع');
            const isPaid = displayPaymentStatus === 'مدفوع' || displayPaymentStatus === 'مدفوع بالكامل';
            const isPending = displayPaymentStatus.includes('بانتظار') || displayPaymentStatus === 'معلق' || displayPaymentStatus === 'غير مدفوع';
            const color = isPaid ? '#10b981' : (isPending ? '#d97706' : '#ef4444');
            const icon = isPaid ? 'fa-circle-check' : (isPending ? 'fa-clock' : 'fa-circle-xmark');
            const pmText = typeof o.paymentMethod === 'object' && o.paymentMethod !== null ? (o.paymentMethod.name || 'الدفع عند الاستلام') : (o.paymentMethod || 'الدفع عند الاستلام');
            return `
              <span style="font-weight:700; font-size:0.85rem; color:${color}; display:inline-flex; align-items:center; gap:5px;">
                <i class="fa-solid ${icon}"></i> ${displayPaymentStatus}
              </span>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${pmText}</div>
            `;
          })()}
        </td>
        <td>
          <button class="btn-admin-primary" style="padding:6px 14px; font-size:0.85rem;" onclick="AdminApp.viewOrderDetails('${o.id}')">
            <i class="fa-solid fa-file-invoice"></i> إدارة وطباعة
          </button>
        </td>
      </tr>
    `).join('');
  },

  viewOrderDetails(orderId) {
    const order = window.DB.find('orders', orderId);
    if (!order) return;
    this.activeOrderId = orderId;

    const modal = document.getElementById('orderDetailsModal');
    if (!modal) return;

    const cust = order.customer || {};
    const orderNumEl = document.getElementById('modalOrderNumberTitle');
    if (orderNumEl) orderNumEl.textContent = `تفاصيل الطلب #${order.orderNumber || '-'}`;
    
    const dateEl = document.getElementById('modalOrderDate');
    if (dateEl) dateEl.textContent = order.date ? new Date(order.date).toLocaleString('ar-SA') : '-';

    const custNameEl = document.getElementById('modalCustName');
    if (custNameEl) custNameEl.textContent = cust.name || 'عميل المتجر';

    const custPhoneEl = document.getElementById('modalCustPhone');
    if (custPhoneEl) custPhoneEl.textContent = cust.phone || '-';

    const custCityEl = document.getElementById('modalCustCity');
    if (custCityEl) custCityEl.textContent = cust.city || '-';

    const custAddressEl = document.getElementById('modalCustAddress');
    if (custAddressEl) custAddressEl.textContent = cust.address || '-';
    
    // Google Maps Shipping Location & Payment Method
    const mapLocationBox = document.getElementById('modalOrderMapLocation');
    const coordsText = document.getElementById('modalOrderCoordsText');
    const gmapsLink = document.getElementById('modalOrderGoogleMapsUrl');
    const paymentMethodEl = document.getElementById('modalOrderPaymentMethod');

    if (paymentMethodEl) {
      const pmLabels = {
        card: 'بطاقة مدى / ائتمان (Mada / Credit Card)',
        applepay: 'Apple Pay',
        tabby: 'تابي (تقسيط 4 دفعات)',
        tamara: 'تمارا (تقسيط 4 دفعات)',
        cod: 'الدفع عند الاستلام (COD)',
        wallet: 'المحفظة الإلكترونية (Wallet)'
      };
      paymentMethodEl.textContent = pmLabels[order.paymentMethod] || order.paymentMethod || 'غير محدد';
    }

    if (mapLocationBox && coordsText && gmapsLink) {
      if (order.locationCoords && order.locationCoords.lat && order.locationCoords.lng) {
        mapLocationBox.style.display = 'flex';
        coordsText.textContent = `${Number(order.locationCoords.lat).toFixed(5)}, ${Number(order.locationCoords.lng).toFixed(5)} (${order.locationCoords.cityName || 'إحداثيات محددة'})`;
        gmapsLink.href = order.locationCoords.googleMapsUrl || `https://www.google.com/maps?q=${order.locationCoords.lat},${order.locationCoords.lng}`;
      } else {
        mapLocationBox.style.display = 'none';
      }
    }

    // Stock status badge
    const stockBadge = document.getElementById('modalOrderStockBadge');
    if (stockBadge) {
      if (order.stockRestored) {
        stockBadge.innerHTML = `
          <div style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; padding:10px 14px; border-radius:8px; font-size:0.85rem; font-weight:700; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-rotate-left"></i>
            <div>
              <span>حالة المخزون: <strong>تم استرجاع الكميات للمخزون</strong> (${order.stockRestoreReason === 'return' ? 'طلب مرتجع' : 'طلب ملغي'})</span>
              <div style="font-size:0.75rem; color:#60a5fa; font-weight:normal;">تاريخ الاسترجاع: ${order.stockRestoredAt ? new Date(order.stockRestoredAt).toLocaleString('ar-SA') : '-'} (محمي ضد الاسترجاع المكرر)</div>
            </div>
          </div>
        `;
      } else if (order.stockDeducted) {
        stockBadge.innerHTML = `
          <div style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; padding:10px 14px; border-radius:8px; font-size:0.85rem; font-weight:700; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <span>حالة المخزون: <strong>تم الخصم التلقائي بنجاح</strong> من كافة المتغيرات والمخزون الإجمالي</span>
              <div style="font-size:0.75rem; color:#10b981; font-weight:normal;">المصدر: ${order.stockDeductionSource || 'تأكيد الطلب'} | محمي ضد الخصم المكرر بنظام Idempotency</div>
            </div>
          </div>
        `;
      } else {
        stockBadge.innerHTML = `
          <div style="background:#fefce8; color:#854d0e; border:1px solid #fef08a; padding:10px 14px; border-radius:8px; font-size:0.85rem; font-weight:700;">
            <i class="fa-solid fa-triangle-exclamation"></i> حالة المخزون: مكتملة وسليمة.
          </div>
        `;
      }
    }

    // Status selectors
    const stOrdEl = document.getElementById('modalOrderStatusSelect');
    if (stOrdEl) stOrdEl.value = order.orderStatus || 'مكتمل';

    const isCod = (
      order.paymentMethod === 'cod' ||
      order.paymentMethod === 'الدفع عند الاستلام' ||
      (typeof order.paymentMethod === 'string' && (order.paymentMethod.includes('الاستلام') || order.paymentMethod.toLowerCase().includes('cod'))) ||
      (typeof order.paymentMethod === 'object' && order.paymentMethod !== null && ((order.paymentMethod.id || '').toLowerCase().includes('cod') || (order.paymentMethod.name || '').includes('الاستلام')))
    );
    const isDelivered = (order.shippingStatus === 'تم التسليم' || order.orderStatus === 'مكتمل');

    const stPayEl = document.getElementById('modalPaymentStatusSelect');
    if (stPayEl) {
      if (isCod) {
        stPayEl.value = isDelivered ? 'مدفوع' : 'بانتظار الدفع';
      } else {
        stPayEl.value = order.paymentStatus || 'مدفوع';
      }
    }

    const stShipEl = document.getElementById('modalShippingStatusSelect');
    if (stShipEl) {
      stShipEl.value = order.shippingStatus || (isDelivered ? 'تم التسليم' : 'لم يجهز');

      stShipEl.onchange = () => {
        if (isCod) {
          if (stShipEl.value === 'تم التسليم') {
            if (stPayEl) stPayEl.value = 'مدفوع';
            if (stOrdEl && (stOrdEl.value === 'جديد' || stOrdEl.value === 'قيد التجهيز' || stOrdEl.value === 'تم الشحن')) {
              stOrdEl.value = 'مكتمل';
            }
          } else {
            if (stPayEl) stPayEl.value = 'بانتظار الدفع';
            if (stOrdEl && stOrdEl.value === 'مكتمل') {
              stOrdEl.value = 'تم الشحن';
            }
          }
        }
      };
    }

    if (stOrdEl) {
      stOrdEl.onchange = () => {
        if (isCod) {
          if (stOrdEl.value === 'مكتمل') {
            if (stShipEl) stShipEl.value = 'تم التسليم';
            if (stPayEl) stPayEl.value = 'مدفوع';
          } else if (stOrdEl.value === 'ملغي') {
            if (stPayEl) stPayEl.value = 'فشل';
          } else if (stOrdEl.value === 'مسترجع') {
            if (stPayEl) stPayEl.value = 'مسترد';
          } else {
            if (stShipEl && stShipEl.value === 'تم التسليم') {
              stShipEl.value = 'تم الشحن';
            }
            if (stPayEl) stPayEl.value = 'بانتظار الدفع';
          }
        }
      };
    }

    const trkEl = document.getElementById('modalTrackingNumberInput');
    if (trkEl) trkEl.value = order.trackingNumber || '';

    const notesEl = document.getElementById('modalInternalNotes');
    if (notesEl) notesEl.value = order.notes || '';

    // Items table in modal
    const itemsTbody = document.getElementById('modalOrderItemsBody');
    if (itemsTbody) {
      itemsTbody.innerHTML = (order.items || []).map(item => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = parseInt(item.quantity, 10) || 1;
        const itemTotal = itemPrice * itemQty;
        const img = item.image || 'assets/images/product_oud.jpg';
        return `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <img src="${img}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;" onerror="this.src='assets/images/product_oud.jpg'">
                <div>
                  <strong>${item.name || 'منتج'}</strong>
                  ${item.variantTitle ? `<div style="font-size:0.75rem; color:var(--text-muted);">${item.variantTitle}</div>` : ''}
                </div>
              </div>
            </td>
            <td>${itemPrice.toFixed(2)} ر.س</td>
            <td>${itemQty}</td>
            <td><strong>${itemTotal.toFixed(2)} ر.س</strong></td>
          </tr>
        `;
      }).join('');
    }

    // Totals in modal
    const subtotal = Number(order.subtotal !== undefined ? order.subtotal : (order.total || 0));
    const discount = Number(order.discount || 0);
    const shipping = Number(order.shippingCost || 0);
    const total = Number(order.total !== undefined ? order.total : (subtotal - discount + shipping));
    const vat = Number(order.vatAmount !== undefined ? order.vatAmount : (subtotal * 0.15));

    const subEl = document.getElementById('modalOrderSubtotal');
    if (subEl) subEl.textContent = `${subtotal.toFixed(2)} ر.س`;

    const discEl = document.getElementById('modalOrderDiscount');
    if (discEl) discEl.textContent = `-${discount.toFixed(2)} ر.س`;

    const shipEl = document.getElementById('modalOrderShipping');
    if (shipEl) shipEl.textContent = shipping === 0 ? 'مجاني' : `${shipping.toFixed(2)} ر.س`;

    const vatEl = document.getElementById('modalOrderVat');
    if (vatEl) vatEl.textContent = `${vat.toFixed(2)} ر.س`;

    const totEl = document.getElementById('modalOrderTotal');
    if (totEl) totEl.textContent = `${total.toFixed(2)} ر.س`;

    // WhatsApp Direct link
    const waBtn = document.getElementById('modalWhatsAppBtn');
    if (waBtn) {
      if (cust.phone) {
        const cleanPhone = cust.phone.replace(/^0/, '966').replace(/\D/g, '');
        waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`السلام عليكم ${cust.name || ''}، بخصوص طلبكم #${order.orderNumber} من متجر النخبة السعودي:`)}`;
        waBtn.style.display = 'inline-flex';
      } else {
        waBtn.style.display = 'none';
      }
    }

    this.renderOrderModalReturns(order);

    modal.classList.add('active');
  },

  closeOrderModal() {
    document.getElementById('orderDetailsModal').classList.remove('active');
  },

  renderOrderModalReturns(order) {
    const container = document.getElementById('modalOrderReturnsSection');
    if (!container) return;

    const returns = order.returns || [];
    if (returns.length === 0) {
      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-rotate-left" style="color:var(--admin-primary);"></i> طلبات الاسترجاع (0)
          </h4>
          <span style="font-size:0.8rem; color:var(--text-muted);">لا توجد طلبات استرجاع مسجلة لهذا الطلب حتى الآن.</span>
        </div>
      `;
      return;
    }

    const stagesList = [
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

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
        <h4 style="font-size:1.05rem; font-weight:900; color:var(--text-main); margin:0; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-rotate-left" style="color:var(--admin-primary);"></i> طلبات الاسترجاع وإدارة دورة الفحص ورد المبالغ (${returns.length})
        </h4>
        <span style="font-size:0.8rem; color:#0d5c46; background:#ecfdf5; border:1px solid #a7f3d0; padding:3px 10px; border-radius:12px; font-weight:800;">
          <i class="fa-solid fa-shield-halved"></i> نظام معتمد مرتبط بالمخزون والمدفوعات
        </span>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        ${returns.map(ret => {
          const isRejected = ret.status === 'مرفوض بعد الفحص';
          const isFailed = ret.status === 'تعذّر استرداد المبلغ';
          const isCancelled = ret.status === 'ملغي';
          const currentIdx = stagesList.indexOf(ret.status);
          const currentStep = currentIdx >= 0 ? currentIdx + 1 : (isRejected ? 6 : isFailed ? 8 : isCancelled ? 1 : 1);

          let statusBadgeClass = 'background:#fef3c7; color:#b45309; border:1px solid #fde68a;';
          if (ret.status === 'تم استرداد المبلغ') {
            statusBadgeClass = 'background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;';
          } else if (ret.status === 'تم اجتياز الفحص وقبول الاسترجاع') {
            statusBadgeClass = 'background:#dbeafe; color:#1e40af; border:1px solid #bfdbfe;';
          } else if (isRejected) {
            statusBadgeClass = 'background:#fee2e2; color:#b91c1c; border:1px solid #fecaca;';
          } else if (isFailed) {
            statusBadgeClass = 'background:#fff7ed; color:#c2410c; border:1px solid #fed7aa;';
          } else if (isCancelled) {
            statusBadgeClass = 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;';
          }

          return `
            <div style="background:#fff; border:1.5px solid #cbd5e1; border-radius:10px; padding:16px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
              <!-- Return Top Info -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                <div>
                  <strong style="font-size:1rem; color:var(--admin-primary);">طلب استرجاع #${ret.id}</strong>
                  <span style="font-size:0.8rem; color:var(--text-muted); margin-right:8px;">
                    بتاريخ: ${new Date(ret.createdAt).toLocaleString('ar-SA')}
                  </span>
                  <div style="font-size:0.82rem; color:#475569; margin-top:3px;">
                    العميل: <strong>${order.customer ? order.customer.name : 'عميل المتجر'}</strong> (${order.customer ? order.customer.phone : '-'})
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-weight:900; font-size:0.85rem; padding:4px 12px; border-radius:14px; ${statusBadgeClass}">
                    ${ret.status}
                  </span>
                </div>
              </div>

              <!-- 9-Stage Stepper View -->
              <div style="margin:12px 0; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 10px; overflow-x:auto;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; min-width:700px; position:relative;">
                  <div style="position:absolute; top:12px; right:20px; left:20px; height:3px; background:#cbd5e1; z-index:1;"></div>
                  <div style="position:absolute; top:12px; right:20px; width:${Math.min(100, Math.max(0, (currentStep - 1) * 12.5))}%; height:3px; background:#10b981; z-index:1; transition:width 0.3s ease;"></div>

                  ${stagesList.map((stName, idx) => {
                    const stepNum = idx + 1;
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
                      <div style="position:relative; z-index:2; text-align:center; width:72px;">
                        <div style="width:24px; height:24px; border-radius:50%; margin:0 auto; background:${circleBg}; color:${circleColor}; border:${circleBorder}; display:flex; align-items:center; justify-content:center; font-size:0.70rem; font-weight:900;">
                          ${isDone ? '<i class="fa-solid fa-check"></i>' : stepNum}
                        </div>
                        <span style="font-size:0.65rem; line-height:1.2; font-weight:${isCurrent ? '800' : '600'}; color:${isCurrent ? '#0d5c46' : (isDone ? '#10b981' : '#64748b')}; display:block; margin-top:4px;">
                          ${stName}
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Indicators Bar: Stock & Finance Status -->
              <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:0.82rem; flex-wrap:wrap; gap:8px;">
                <div>
                  <strong>حالة المخزون:</strong> 
                  ${ret.stockRestored ? `
                    <span style="color:#15803d; font-weight:800;"><i class="fa-solid fa-boxes-stacked"></i> تم استرجاع الكميات الصالحة للبيع بنجاح ✅ (${ret.stockRestoredAt ? new Date(ret.stockRestoredAt).toLocaleTimeString('ar-SA') : ''})</span>
                  ` : `
                    <span style="color:#b45309; font-weight:700;"><i class="fa-solid fa-lock"></i> لم يُعد للمخزون القابل للبيع (معلق لحين اجتياز الفحص في الحالة 7)</span>
                  `}
                </div>
                <div>
                  <strong>حالة رد المبلغ:</strong> 
                  ${ret.refundProcessed ? `
                    <span style="color:#15803d; font-weight:800;"><i class="fa-solid fa-circle-check"></i> تم استرداد ${ret.refundTotal.toFixed(2)} ر.س بنجاح [TX: ${ret.refundTxId || 'TX-DONE'}]</span>
                  ` : `
                    <span style="color:#64748b; font-weight:700;"><i class="fa-solid fa-hand-holding-dollar"></i> رد المبلغ معلق (${ret.refundTotal.toFixed(2)} ر.س بانتظار اجتياز الفحص والتنفيذ)</span>
                  `}
                </div>
              </div>

              <!-- Items Table -->
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; margin-bottom:12px;">
                <div style="font-size:0.82rem; font-weight:800; color:var(--text-muted); margin-bottom:6px;">المنتجات والتركيبات المحددة للإرجاع:</div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${ret.items.map(it => `
                    <div style="font-size:0.82rem; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:6px 10px; border-radius:4px;">
                      <div>
                        ${it.isBundle ? '<span style="color:#b45309; font-weight:800;">[باقة مجمعة]</span> ' : ''}
                        <strong>${it.name}</strong>
                        ${it.variantTitle ? `<span style="background:#e2e8f0; padding:1px 6px; border-radius:4px; font-size:0.75rem; margin-right:4px;">${it.variantTitle}</span>` : ''}
                        ${it.size ? `<span style="background:#e0e7ff; color:#3730a3; padding:1px 5px; border-radius:4px; font-size:0.72rem; margin-right:4px;">مقاس: ${it.size}</span>` : ''}
                        ${it.color ? `<span style="background:#fae8ff; color:#86198f; padding:1px 5px; border-radius:4px; font-size:0.72rem; margin-right:4px;">لون: ${it.color}</span>` : ''}
                        <span style="color:var(--text-muted); font-weight:700;">× ${it.quantity}</span>
                        ${ret.stockRestored ? (it.isSalable !== false ? '<span style="color:#15803d; font-weight:800; font-size:0.75rem; margin-right:8px;">[أعيد للمخزون]</span>' : `<span style="color:#dc2626; font-weight:800; font-size:0.75rem; margin-right:8px;">[تالف معزول: ${it.damageReason || 'غير صالح'}]</span>`) : ''}
                      </div>
                      <strong style="color:var(--admin-primary);">${(it.price * it.quantity).toFixed(2)} ر.س</strong>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Contextual Action Controls based on Current Status -->
              <div style="background:#f1f5f9; border:1px dashed #cbd5e1; border-radius:8px; padding:12px; margin-bottom:10px;">
                <div style="font-weight:800; font-size:0.85rem; color:#1e293b; margin-bottom:8px;">
                  <i class="fa-solid fa-play" style="color:var(--admin-primary);"></i> الإجراء التشغيلي التالي للمرحلة الحالية:
                </div>

                ${ret.status === 'تم طلب الاسترجاع' ? `
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <button type="button" class="btn-admin-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.advanceReturnStatus('${order.id}', '${ret.id}', 'بانتظار استلام المندوب', 'تم جدولة موعد المندوب لاستلام الشحنة')">
                      <i class="fa-solid fa-motorcycle"></i> تعيين: بانتظار استلام المندوب
                    </button>
                    <span style="font-size:0.78rem; color:#64748b;">(تنبيه: لا يتم استرجاع المخزون ولا رد المبلغ في هذه المرحلة).</span>
                  </div>
                ` : ''}

                ${ret.status === 'بانتظار استلام المندوب' ? `
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <button type="button" class="btn-admin-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.advanceReturnStatus('${order.id}', '${ret.id}', 'تم استلام المنتج من العميل', 'استلم المندوب الشحنة من العميل فعلياً')">
                      <i class="fa-solid fa-box-check"></i> تأكيد: تم استلام المنتج من العميل
                    </button>
                    <span style="font-size:0.78rem; color:#64748b;">(الشحنة مع المندوب - المخزون والمال معلقان).</span>
                  </div>
                ` : ''}

                ${ret.status === 'تم استلام المنتج من العميل' ? `
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <button type="button" class="btn-admin-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.advanceReturnStatus('${order.id}', '${ret.id}', 'المنتج في طريقه إلى المتجر', 'الشحنة في طريقها من المندوب إلى مستودع المتجر')">
                      <i class="fa-solid fa-truck-fast"></i> تحديث: المنتج في طريقه إلى المتجر
                    </button>
                    <span style="font-size:0.78rem; color:#64748b;">(المنتج في الطريق للمتجر - المخزون لم يتغير).</span>
                  </div>
                ` : ''}

                ${ret.status === 'المنتج في طريقه إلى المتجر' ? `
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <button type="button" class="btn-admin-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.advanceReturnStatus('${order.id}', '${ret.id}', 'وصل المنتج إلى المتجر', 'وصلت الشحنة إلى المتجر وتم استلامها وجاهزة للفحص')">
                      <i class="fa-solid fa-warehouse"></i> تسجيل: وصل المنتج إلى المتجر
                    </button>
                    <span style="font-size:0.78rem; color:#64748b;">(تسجيل الوصول الفعلي بالمتجر قبل بدء الفحص).</span>
                  </div>
                ` : ''}

                ${ret.status === 'وصل المنتج إلى المتجر' ? `
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <button type="button" class="btn-admin-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.advanceReturnStatus('${order.id}', '${ret.id}', 'قيد فحص المنتج', 'بدأت إجراءات فحص المنتج والتأكد من حالته')">
                      <i class="fa-solid fa-magnifying-glass"></i> بدء: قيد فحص المنتج
                    </button>
                    <span style="font-size:0.78rem; color:#64748b;">(لا يُعاد المخزون القابل للبيع خلال الفحص إطلاقاً).</span>
                  </div>
                ` : ''}

                ${ret.status === 'قيد فحص المنتج' ? `
                  <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin-top:6px;">
                    <div style="font-weight:800; font-size:0.85rem; color:#0f172a; margin-bottom:8px;">
                      <i class="fa-solid fa-microscope" style="color:var(--admin-primary);"></i> نموذج تقرير الفحص الفني:
                    </div>
                    
                    <div style="margin-bottom:8px;">
                      <label style="font-size:0.78rem; font-weight:700; color:#475569;">فحص صلاحية الأصناف للبيع:</label>
                      <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
                        ${ret.items.map(it => `
                          <div style="display:flex; align-items:center; gap:10px; background:#f8fafc; padding:6px 10px; border-radius:6px; flex-wrap:wrap;">
                            <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.8rem; font-weight:700; cursor:pointer;">
                              <input type="checkbox" id="itemSalable_${ret.id}_${it.productId}_${it.variantId || 'novar'}" checked onchange="document.getElementById('dmgWrap_${ret.id}_${it.productId}_${it.variantId || 'novar'}').style.display = this.checked ? 'none' : 'inline-flex';">
                              ${it.name} ${it.variantTitle ? `(${it.variantTitle})` : ''} × ${it.quantity} - [سليم وصالح للبيع]
                            </label>
                            <span id="dmgWrap_${ret.id}_${it.productId}_${it.variantId || 'novar'}" style="display:none; align-items:center; gap:4px;">
                              <input type="text" id="itemDmgReason_${ret.id}_${it.productId}_${it.variantId || 'novar'}" placeholder="سبب التلف / العزل" style="padding:3px 8px; font-size:0.75rem; border:1px solid #f87171; border-radius:4px; width:180px;">
                            </span>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <div style="margin-bottom:10px;">
                      <label style="font-size:0.78rem; font-weight:700; color:#475569;">ملاحظات الفحص:</label>
                      <input type="text" id="retInspNotes_${ret.id}" value="${ret.inspectionNotes || 'المنتج بحالة ممتازة ومطابق لسياسة الاسترجاع'}" style="width:100%; padding:6px 10px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:6px;">
                    </div>

                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                      <button type="button" class="btn-admin-primary" style="background:#15803d; border-color:#15803d; padding:6px 16px; font-size:0.82rem; font-weight:800;" onclick="AdminApp.passInspection('${order.id}', '${ret.id}')">
                        <i class="fa-solid fa-check"></i> قبول الاسترجاع واجتياز الفحص (إعادة المخزون السليم فقط)
                      </button>
                      <button type="button" class="btn-admin-outline" style="color:#dc2626; border-color:#dc2626; padding:6px 14px; font-size:0.82rem; font-weight:800;" onclick="AdminApp.rejectInspection('${order.id}', '${ret.id}')">
                        <i class="fa-solid fa-xmark"></i> رفض الاسترجاع بعد الفحص
                      </button>
                    </div>
                  </div>
                ` : ''}

                ${ret.status === 'تم اجتياز الفحص وقبول الاسترجاع' ? `
                  <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <button type="button" class="btn-admin-primary" style="background:#2563eb; border-color:#2563eb; padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.advanceReturnStatus('${order.id}', '${ret.id}', 'جارٍ استرداد المبلغ', 'بدء تجهيز التحويل المالي للمبلغ المسترد')">
                      <i class="fa-solid fa-hourglass-half"></i> بدء: جارٍ استرداد المبلغ
                    </button>
                    <button type="button" class="btn-admin-primary" style="background:#15803d; border-color:#15803d; padding:6px 16px; font-size:0.82rem; font-weight:900;" onclick="AdminApp.executeRefund('${order.id}', '${ret.id}')">
                      <i class="fa-solid fa-wallet"></i> تنفيذ رد المبلغ فوراً (${ret.refundTotal.toFixed(2)} ر.س)
                    </button>
                  </div>
                ` : ''}

                ${ret.status === 'جارٍ استرداد المبلغ' || ret.status === 'تعذّر استرداد المبلغ' ? `
                  <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <button type="button" class="btn-admin-primary" style="background:#15803d; border-color:#15803d; padding:6px 16px; font-size:0.82rem; font-weight:900;" onclick="AdminApp.executeRefund('${order.id}', '${ret.id}')">
                      <i class="fa-solid fa-check-double"></i> تأكيد نجاح العملية وإتمام رد المبلغ (${ret.refundTotal.toFixed(2)} ر.س)
                    </button>
                    <button type="button" class="btn-admin-outline" style="color:#ea580c; border-color:#ea580c; padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.failRefund('${order.id}', '${ret.id}')">
                      <i class="fa-solid fa-triangle-exclamation"></i> تسجيل تعذّر الاسترداد (إعادة المحاولة لاحقاً)
                    </button>
                  </div>
                ` : ''}

                ${ret.status === 'تم استرداد المبلغ' ? `
                  <div style="color:#15803d; font-weight:800; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-circle-check"></i> اكتملت عملية الاسترجاع بنجاح. تم استرداد المبلغ ${ret.refundTotal.toFixed(2)} ر.س برقم العملية ${ret.refundTxId || 'TX-DONE'} بتاريخ ${new Date(ret.refundedAt || ret.updatedAt).toLocaleString('ar-SA')}.
                  </div>
                ` : ''}

                ${isRejected ? `
                  <div style="color:#b91c1c; font-weight:800; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-circle-xmark"></i> تم رفض الاسترجاع بعد الفحص: ${ret.rejectionReason || 'غير مطابق للشروط'}. لم يتم رد المبلغ ولم تُعد الأصناف للمخزون القابل للبيع.
                  </div>
                ` : ''}
              </div>

              <!-- History Timeline Log -->
              <details style="margin-top:8px; font-size:0.78rem; color:#475569; background:#fafafa; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px;">
                <summary style="font-weight:700; cursor:pointer;">سجل التحديثات والمراحل السابقة (${(ret.history || []).length})</summary>
                <div style="display:flex; flex-direction:column; gap:4px; margin-top:6px;">
                  ${(ret.history || []).map(h => `
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding:4px 0;">
                      <span><strong>[${h.status}]</strong> - ${h.notes || ''} <small style="color:#64748b;">(بواسطة: ${h.actor || '-'})</small></span>
                      <span style="direction:ltr; font-family:monospace; color:#64748b;">${new Date(h.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  `).join('')}
                </div>
              </details>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  advanceReturnStatus(orderId, returnId, newStatus, defaultNote = '') {
    const res = window.DB.updateReturnRequestStatus(orderId, returnId, newStatus, {
      actor: 'مدير المتجر',
      adminNotes: defaultNote || `تم تحديث الحالة إلى [${newStatus}]`
    });

    if (res.success) {
      this.showToast(`تم تحديث حالة طلب الاسترجاع إلى [${newStatus}] بنجاح!`, 'success');
      const updatedOrder = window.DB.find('orders', orderId);
      this.renderOrderModalReturns(updatedOrder);
      this.renderOrdersTable();
    } else {
      this.showToast(res.message || 'تعذر تحديث طلب الاسترجاع', 'error');
    }
  },

  passInspection(orderId, returnId) {
    const order = window.DB.find('orders', orderId);
    if (!order || !order.returns) return;
    const ret = order.returns.find(r => r.id === returnId);
    if (!ret) return;

    const notesEl = document.getElementById(`retInspNotes_${returnId}`);
    const notes = notesEl ? notesEl.value.trim() : 'اجتاز المنتج الفحص بنجاح ومطابق لسياسة الاسترجاع';

    // Item-level salability inspection checklist
    const itemsInspection = (ret.items || []).map(it => {
      const salableCb = document.getElementById(`itemSalable_${returnId}_${it.productId}_${it.variantId || 'novar'}`);
      const dmgReasonInput = document.getElementById(`itemDmgReason_${returnId}_${it.productId}_${it.variantId || 'novar'}`);
      const isSalable = salableCb ? salableCb.checked : (it.isSalable !== false);
      const damageReason = dmgReasonInput ? dmgReasonInput.value.trim() : '';
      return {
        productId: it.productId,
        variantId: it.variantId || null,
        isSalable: isSalable,
        damageReason: damageReason
      };
    });

    const res = window.DB.updateReturnRequestStatus(orderId, returnId, 'تم اجتياز الفحص وقبول الاسترجاع', {
      actor: 'موظف الفحص والجودة',
      inspectionNotes: notes,
      adminNotes: notes,
      itemsInspection: itemsInspection
    });

    if (res.success) {
      this.showToast('تم قبول الاسترجاع بنجاح وإعادة الكميات السليمة للمخزون! يمكنك الآن رد المبلغ.', 'success');
      const updatedOrder = window.DB.find('orders', orderId);
      this.renderOrderModalReturns(updatedOrder);
      this.renderOrdersTable();
      this.renderInventoryTable();
      this.renderDashboard();
      if (this.currentSection === 'finance' || document.getElementById('admin-sec-finance')) {
        this.renderFinance();
      }
    } else {
      this.showToast(res.message || 'تعذر اجتياز الفحص', 'error');
    }
  },

  rejectInspection(orderId, returnId) {
    const reason = prompt('يرجى توضيح سبب رفض الاسترجاع للعميل:', 'المنتج تالف أو غير مطابق لشروط وسياسة الاسترجاع');
    if (reason === null) return;

    const res = window.DB.updateReturnRequestStatus(orderId, returnId, 'مرفوض بعد الفحص', {
      actor: 'موظف الفحص والجودة',
      rejectionReason: reason,
      adminNotes: reason
    });

    if (res.success) {
      this.showToast('تم رفض طلب الاسترجاع بعد الفحص وحماية المخزون والمدفوعات من أي تغيير.', 'warning');
      const updatedOrder = window.DB.find('orders', orderId);
      this.renderOrderModalReturns(updatedOrder);
      this.renderOrdersTable();
    } else {
      this.showToast(res.message || 'تعذر تحديث طلب الاسترجاع', 'error');
    }
  },

  executeRefund(orderId, returnId) {
    const res = window.DB.executeReturnRefund(orderId, returnId, { actor: 'المدير المالي' });
    if (res.success) {
      this.showToast(`تم استرداد المبلغ بنجاح! رقم المرجع المالي: ${res.refundTxId}`, 'success');
      const updatedOrder = window.DB.find('orders', orderId);
      this.renderOrderModalReturns(updatedOrder);
      this.renderOrdersTable();
      this.renderInventoryTable();
      this.renderDashboard();
      if (this.currentSection === 'finance' || document.getElementById('admin-sec-finance')) {
        this.renderFinance();
      }
    } else {
      this.showToast(res.message || 'تعذر استرداد المبلغ', 'error');
    }
  },

  failRefund(orderId, returnId) {
    const res = window.DB.executeReturnRefund(orderId, returnId, {
      simulateFailure: true,
      errorMessage: 'تعذر الاتصال بمزود الدفع الإلكتروني - تم تعليق العملية لإتاحة إعادة المحاولة الآمنة دون تكرار الدفع'
    });

    this.showToast('تم تسجيل تعذر استرداد المبلغ وتوفير إعادة المحاولة بأمان.', 'warning');
    const updatedOrder = window.DB.find('orders', orderId);
    this.renderOrderModalReturns(updatedOrder);
    this.renderOrdersTable();
  },

  saveOrderStatus() {
    if (!this.activeOrderId) return;
    const order = window.DB.find('orders', this.activeOrderId);
    if (!order) return;

    const prevOrderStatus = order.orderStatus;
    const prevPaymentStatus = order.paymentStatus;
    const newOrderStatus = document.getElementById('modalOrderStatusSelect').value;
    let newPaymentStatus = document.getElementById('modalPaymentStatusSelect').value;
    const newShippingStatus = document.getElementById('modalShippingStatusSelect').value;
    const newTracking = document.getElementById('modalTrackingNumberInput').value.trim();
    const newNotes = document.getElementById('modalInternalNotes').value.trim();

    const isCod = (
      order.paymentMethod === 'cod' ||
      order.paymentMethod === 'الدفع عند الاستلام' ||
      (typeof order.paymentMethod === 'string' && (order.paymentMethod.includes('الاستلام') || order.paymentMethod.toLowerCase().includes('cod'))) ||
      (typeof order.paymentMethod === 'object' && order.paymentMethod !== null && ((order.paymentMethod.id || '').toLowerCase().includes('cod') || (order.paymentMethod.name || '').includes('الاستلام')))
    );

    // Business Rule: For Cash on Delivery, money is ONLY marked 'مدفوع' once delivered ('تم التسليم')
    if (isCod) {
      if (newShippingStatus === 'تم التسليم' || newOrderStatus === 'مكتمل') {
        if (newOrderStatus !== 'ملغي' && newOrderStatus !== 'مسترجع' && newPaymentStatus !== 'فشل' && newPaymentStatus !== 'مسترد') {
          newPaymentStatus = 'مدفوع';
        }
      } else if (newOrderStatus !== 'ملغي' && newOrderStatus !== 'مسترجع') {
        newPaymentStatus = 'بانتظار الدفع';
      }
    }


    let stockMsg = '';

    // 5. Cancellation or Return handling with Double-Restoration Prevention
    if (newOrderStatus === 'ملغي' && prevOrderStatus !== 'ملغي') {
      const res = window.InventoryEngine.restoreOrderStock(order.id, 'cancellation');
      if (res.success) {
        stockMsg = ' (تم استرجاع كميات المنتجات إلى المتغيرات والمخزون الإجمالي)';
      } else if (res.alreadyRestored) {
        stockMsg = ' (المخزون مسترجع مسبقاً - تم منع التكرار)';
      }
    } else if (newOrderStatus === 'مسترجع' || newPaymentStatus === 'مسترد') {
      if (prevOrderStatus !== 'مسترجع' && prevPaymentStatus !== 'مسترد') {
        const res = window.InventoryEngine.restoreOrderStock(order.id, 'return', 'طلب استرجاع من لوحة الإدارة');
        if (res.success) {
          stockMsg = ' (تم تسجيل إرجاع الطلب واستعادة المخزون بنجاح)';
        } else if (res.alreadyRestored) {
          stockMsg = ' (المخزون مسترجع مسبقاً - تم منع التكرار)';
        }
      }
    } else if (order.stockDeducted !== true && newOrderStatus !== 'ملغي' && newOrderStatus !== 'مسترجع') {
      // 3. Deduct if moving into active state for the first time
      const deductRes = window.InventoryEngine.deductOrderStock(order.id, 'admin_order_status_update');
      if (deductRes.success) {
        stockMsg = ' (تم خصم المخزون بنجاح لأول مرة)';
      }
    }

    window.DB.update('orders', this.activeOrderId, {
      orderStatus: newOrderStatus,
      paymentStatus: newPaymentStatus,
      shippingStatus: newShippingStatus,
      trackingNumber: newTracking,
      notes: newNotes
    });

    window.DB.recordAuditLog('تحديث حالة الطلب', `الطلب #${order.orderNumber}`, 'مدير المتجر', `تغيير الحالة إلى "${newOrderStatus}" وبوليصة الشحن "${newTracking}"${stockMsg}`);
    this.showToast(`تم حفظ تحديثات الطلب #${order.orderNumber}${stockMsg}`, 'success');
    this.closeOrderModal();
    this.renderOrdersTable();
    this.renderInventoryTable();
    this.renderDashboard();
    if (this.currentSection === 'finance' || document.getElementById('admin-sec-finance')) {
      this.renderFinance();
    }
  },

  printOfficialTaxInvoice() {
    const order = window.DB.find('orders', this.activeOrderId);
    if (!order) return;

    const printContainer = document.getElementById('taxInvoicePrintArea');
    if (!printContainer) return;

    printContainer.innerHTML = window.ZatcaEngine.generateTaxInvoiceHtml(order);
    window.print();
  },

  /* ================= 4. Categories Management (Full CRUD) ================= */
  renderCategoriesTable() {
    const categories = window.DB.get('categories') || [];
    const products = window.DB.get('products') || [];
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    if (categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-muted);">لا توجد تصنيفات مسجلة. اضغط على "إضافة تصنيف جديد" لإنشاء قسم.</td></tr>`;
      return;
    }

    tbody.innerHTML = categories.map(c => {
      const count = products.filter(p => p.categoryId === c.id).length;
      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${c.image || 'assets/images/product_oud.jpg'}" style="width:44px; height:44px; border-radius:8px; object-fit:cover; border:1px solid var(--admin-border);">
              <div>
                <div style="font-weight:800; font-size:0.95rem; color:var(--text-main);">
                  <i class="fa-solid ${c.icon || 'fa-tag'}" style="color:var(--admin-primary); margin-left:6px;"></i>
                  ${c.name}
                </div>
                ${c.englishName ? `<div style="font-size:0.78rem; color:var(--text-muted);">${c.englishName}</div>` : ''}
              </div>
            </div>
          </td>
          <td><code style="background:var(--admin-bg); padding:4px 8px; border-radius:4px; font-weight:700;">${c.slug}</code></td>
          <td style="max-width:280px; color:var(--text-muted); font-size:0.88rem;">${c.description || '-'}</td>
          <td>
            <span style="background:var(--admin-primary-light); color:var(--admin-primary); font-weight:800; padding:4px 12px; border-radius:999px; font-size:0.82rem;">
              ${count} منتجات
            </span>
          </td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn-admin-primary" style="padding:6px 12px; font-size:0.8rem;" onclick="AdminApp.editCategory('${c.id}')">
                <i class="fa-solid fa-pen-to-square"></i> تعديل
              </button>
              <button class="btn-admin-outline" style="padding:6px 10px; color:#ef4444;" onclick="AdminApp.deleteCategory('${c.id}')" title="حذف">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openCategoryModal(catId = null) {
    this.editingCategoryId = catId;
    const modal = document.getElementById('categoryFormModal');
    const modalTitle = document.getElementById('categoryModalTitle');
    const form = document.getElementById('categoryForm');

    if (catId) {
      const cat = window.DB.find('categories', catId);
      if (!cat) return;
      modalTitle.textContent = 'تعديل بيانات التصنيف';
      document.getElementById('catNameInput').value = cat.name || '';
      document.getElementById('catEnglishNameInput').value = cat.englishName || '';
      document.getElementById('catSlugInput').value = cat.slug || '';
      document.getElementById('catIconSelect').value = cat.icon || 'fa-tag';
      document.getElementById('catImageInput').value = cat.image || '';
      document.getElementById('catDescInput').value = cat.description || '';

      if (cat.image) {
        this.setImagePreview('cat', cat.image, cat.name, 'صورة التصنيف المحفوظة');
      } else {
        this.removeUploadedImage('cat');
      }
    } else {
      modalTitle.textContent = 'إضافة تصنيف جديد للمتجر';
      form.reset();
      this.editingCategoryId = null;
      this.removeUploadedImage('cat');
    }

    modal.classList.add('active');
  },

  closeCategoryModal() {
    document.getElementById('categoryFormModal').classList.remove('active');
    this.editingCategoryId = null;
  },

  saveCategoryForm(e) {
    e.preventDefault();
    const name = document.getElementById('catNameInput').value.trim();
    const englishName = document.getElementById('catEnglishNameInput').value.trim();
    let slug = document.getElementById('catSlugInput').value.trim().toLowerCase().replace(/\s+/g, '-');
    const icon = document.getElementById('catIconSelect').value;
    const image = document.getElementById('catImageInput').value.trim() || 'assets/images/product_oud.jpg';
    const description = document.getElementById('catDescInput').value.trim();

    if (!name || !slug) {
      this.showToast('يرجى إدخال اسم التصنيف والمعرف اللطيف (Slug)', 'error');
      return;
    }

    if (this.editingCategoryId) {
      window.DB.update('categories', this.editingCategoryId, {
        name,
        englishName,
        slug,
        icon,
        image,
        description
      });
      window.DB.recordAuditLog('تعديل تصنيف', name, 'مدير المتجر', `تحديث بيانات القسم ${name} (${slug})`);
      this.showToast('تم تحديث التصنيف بنجاح!', 'success');
    } else {
      const newCat = {
        id: 'cat-' + Date.now(),
        name,
        englishName,
        slug,
        icon,
        image,
        description
      };
      window.DB.insert('categories', newCat);
      window.DB.recordAuditLog('إضافة تصنيف جديد', name, 'مدير المتجر', `إنشاء قسم جديد ${name} (${slug})`);
      this.showToast('تمت إضافة التصنيف الجديد بنجاح!', 'success');
    }

    this.closeCategoryModal();
    this.renderCategoriesTable();
  },

  editCategory(catId) {
    this.openCategoryModal(catId);
  },

  deleteCategory(catId) {
    const cat = window.DB.find('categories', catId);
    if (!cat) return;

    const products = window.DB.get('products') || [];
    const attachedCount = products.filter(p => p.categoryId === catId).length;

    if (attachedCount > 0) {
      if (!confirm(`هذا القسم مرتبط بـ ${attachedCount} منتجات. هل أنت متأكد من حذفه؟`)) {
        return;
      }
    } else {
      if (!confirm(`هل أنت متأكد من حذف القسم "${cat.name}"؟`)) {
        return;
      }
    }

    window.DB.delete('categories', catId);
    window.DB.recordAuditLog('حذف تصنيف', cat.name, 'مدير المتجر', `حذف القسم ${cat.name}`);
    this.showToast('تم حذف التصنيف بنجاح', 'info');
    this.renderCategoriesTable();
  },

  /* ================= 5. Inventory Management & Movements ================= */
  switchInventoryTab(tabName) {
    const stocksCard = document.getElementById('invStocksCard');
    const movementsCard = document.getElementById('invMovementsCard');
    const btnStocks = document.getElementById('invTabBtnStocks');
    const btnMovements = document.getElementById('invTabBtnMovements');

    if (tabName === 'movements') {
      if (stocksCard) stocksCard.style.display = 'none';
      if (movementsCard) movementsCard.style.display = 'block';
      if (btnStocks) {
        btnStocks.className = 'btn-admin-outline';
      }
      if (btnMovements) {
        btnMovements.className = 'btn-admin-primary';
      }
      this.renderInventoryMovementsTable();
    } else {
      if (stocksCard) stocksCard.style.display = 'block';
      if (movementsCard) movementsCard.style.display = 'none';
      if (btnStocks) {
        btnStocks.className = 'btn-admin-primary';
      }
      if (btnMovements) {
        btnMovements.className = 'btn-admin-outline';
      }
      this.renderInventoryTable();
    }
  },

  renderInventoryTable() {
    const products = window.DB.get('products') || [];
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => {
      const hasVariants = p.variants && Array.isArray(p.variants) && p.variants.length > 0;
      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${p.image}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; border:1px solid var(--admin-border);">
              <div>
                <strong style="color:var(--text-main); font-size:0.95rem;">${p.name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${p.sku}</div>
                ${hasVariants ? `
                  <button type="button" class="btn-admin-outline" style="padding:2px 8px; font-size:0.75rem; margin-top:5px; border-color:#0284c7; color:#0284c7; font-weight:700;" onclick="AdminApp.toggleVariantBreakdown('${p.id}')">
                    <i class="fa-solid fa-layer-group"></i> تفاصيل المتغيرات (${p.variants.length} تركيبات) <i class="fa-solid fa-chevron-down" id="chevron-${p.id}"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight:900; font-size:1.1rem; color:var(--admin-primary);">${p.stock} قطعة</div>
            ${hasVariants ? `<div style="font-size:0.72rem; color:#0284c7; font-weight:700;">(محسوب من مجموع المتغيرات)</div>` : ''}
          </td>
          <td>${p.alertThreshold || 5} قطعة</td>
          <td>
            <span style="font-weight:700; ${p.stock <= (p.alertThreshold || 5) ? 'color:#ef4444;' : 'color:#10b981;'}">
              ${p.stock === 0 ? '❌ نفد المخزون' : p.stock <= (p.alertThreshold || 5) ? '⚠️ تنبيه: منخفض المخزون' : '✅ متوفر بكثرة'}
            </span>
          </td>
          <td>
            ${hasVariants ? `
              <span style="font-size:0.8rem; color:var(--text-muted);">عدّل عبر التركيبات أدناه</span>
            ` : `
              <div style="display:flex; gap:6px;">
                <button class="btn-admin-outline" style="padding:4px 10px;" onclick="AdminApp.adjustStock('${p.id}', 5)">+5</button>
                <button class="btn-admin-outline" style="padding:4px 10px;" onclick="AdminApp.adjustStock('${p.id}', 20)">+20</button>
                <button class="btn-admin-outline" style="padding:4px 10px; color:#ef4444;" onclick="AdminApp.adjustStock('${p.id}', -1)">-1</button>
              </div>
            `}
          </td>
        </tr>
        ${hasVariants ? `
          <tr id="variant-row-${p.id}" class="variant-breakdown-row" style="display:none; background:#f8fafc;">
            <td colspan="5" style="padding:12px 20px;">
              <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:14px; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="font-weight:800; font-size:0.88rem; margin-bottom:10px; color:#0f172a; display:flex; justify-content:space-between; align-items:center;">
                  <span><i class="fa-solid fa-tags" style="color:var(--admin-primary);"></i> أرصدة متغيرات المنتج (المصدر الأساسي للمخزون):</span>
                  <span style="font-size:0.8rem; color:#0369a1; background:#e0f2fe; padding:2px 8px; border-radius:6px;">
                    <i class="fa-solid fa-link"></i> تحديث أي تركيبة يُحدث المخزون الإجمالي تلقائياً
                  </span>
                </div>
                <table style="width:100%; font-size:0.85rem; border-collapse:collapse;">
                  <thead>
                    <tr style="background:#f1f5f9; text-align:right;">
                      <th style="padding:8px 12px;">التركيبة (المقاس / اللون)</th>
                      <th style="padding:8px 12px;">كود SKU</th>
                      <th style="padding:8px 12px;">السعر</th>
                      <th style="padding:8px 12px;">الرصيد الحالي</th>
                      <th style="padding:8px 12px;">الحالة</th>
                      <th style="padding:8px 12px;">تعديل سريع للرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${p.variants.map(v => `
                      <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:8px 12px; font-weight:800; color:#1e293b;">${v.title}</td>
                        <td style="padding:8px 12px;"><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">${v.sku || '-'}</code></td>
                        <td style="padding:8px 12px;">${v.price} ر.س</td>
                        <td style="padding:8px 12px;"><strong style="color:var(--admin-primary); font-size:1rem;">${v.stock} قطعة</strong></td>
                        <td style="padding:8px 12px;">
                          <span style="font-weight:700; ${v.stock <= 2 ? 'color:#ef4444;' : 'color:#10b981;'}">
                            ${v.stock === 0 ? '❌ نفد' : v.stock <= 2 ? '⚠️ منخفض' : '✅ متوفر'}
                          </span>
                        </td>
                        <td style="padding:8px 12px;">
                          <div style="display:flex; align-items:center; gap:6px;">
                            <button class="btn-admin-outline" style="padding:3px 9px; font-size:0.75rem;" onclick="AdminApp.adjustVariantStock('${p.id}', '${v.id}', 5)">+5</button>
                            <button class="btn-admin-outline" style="padding:3px 9px; font-size:0.75rem;" onclick="AdminApp.adjustVariantStock('${p.id}', '${v.id}', 1)">+1</button>
                            <button class="btn-admin-outline" style="padding:3px 9px; font-size:0.75rem; color:#ef4444;" onclick="AdminApp.adjustVariantStock('${p.id}', '${v.id}', -1)">-1</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        ` : ''}
      `;
    }).join('');
  },

  toggleVariantBreakdown(productId) {
    const row = document.getElementById(`variant-row-${productId}`);
    const chevron = document.getElementById(`chevron-${productId}`);
    if (!row) return;
    const isHidden = row.style.display === 'none';
    row.style.display = isHidden ? 'table-row' : 'none';
    if (chevron) {
      chevron.className = isHidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
    }
  },

  adjustVariantStock(productId, variantId, delta) {
    const updatedProd = window.InventoryEngine.adjustVariantStock(productId, variantId, delta);
    if (!updatedProd) return;
    const variant = (updatedProd.variants || []).find(v => v.id === variantId);
    this.showToast(`تم تحديث مخزون "${variant ? variant.title : ''}" إلى ${variant ? variant.stock : 0} قطعة، وأصبح إجمالي المنتج ${updatedProd.stock} قطعة بنجاح!`, 'success');
    this.renderInventoryTable();
    this.renderProductsTable();
    // Keep variant row open
    setTimeout(() => {
      const row = document.getElementById(`variant-row-${productId}`);
      if (row) row.style.display = 'table-row';
    }, 10);
  },

  adjustStock(productId, delta) {
    const prod = window.DB.find('products', productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    window.DB.update('products', productId, { stock: newStock });
    window.DB.recordAuditLog('تحديث مخزون يدوي', prod.name, 'مدير المتجر', `تعديل الكمية بمقدار (${delta > 0 ? '+' : ''}${delta}) - الرصيد الحالي: ${newStock}`);
    this.showToast(`تم تحديث مخزون "${prod.name}" إلى ${newStock} قطعة`, 'success');
    this.renderInventoryTable();
    this.renderProductsTable();
  },

  renderInventoryMovementsTable() {
    const movements = window.DB.get('inventory_movements') || [];
    const tbody = document.getElementById('inventoryMovementsTableBody');
    if (!tbody) return;

    if (movements.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">لا توجد حركات مخزون مسجلة بعد.</td></tr>`;
      return;
    }

    const typeBadges = {
      'sale_deduction': '<span style="background:#fee2e2; color:#b91c1c; padding:3px 8px; border-radius:999px; font-size:0.75rem; font-weight:800;">خصم بيع آلي 🛍️</span>',
      'cancel_restoration': '<span style="background:#dcfce7; color:#15803d; padding:3px 8px; border-radius:999px; font-size:0.75rem; font-weight:800;">استرجاع إلغاء طلب 🔄</span>',
      'return_restoration': '<span style="background:#e0e7ff; color:#4338ca; padding:3px 8px; border-radius:999px; font-size:0.75rem; font-weight:800;">استرجاع إرجاع منتج 📦</span>',
      'manual_variant_adjustment': '<span style="background:#f3e8ff; color:#7e22ce; padding:3px 8px; border-radius:999px; font-size:0.75rem; font-weight:800;">تعديل يدوي للتركيبة ⚙️</span>',
      'manual_add': '<span style="background:#dcfce7; color:#15803d; padding:3px 8px; border-radius:999px; font-size:0.75rem; font-weight:800;">توريد مخزون جديد 📥</span>',
      'order': '<span style="background:#fee2e2; color:#b91c1c; padding:3px 8px; border-radius:999px; font-size:0.75rem; font-weight:800;">طلب عميل 🛍️</span>'
    };

    tbody.innerHTML = movements.map(m => `
      <tr>
        <td style="font-size:0.8rem; color:var(--text-muted);">${m.date ? new Date(m.date).toLocaleString('ar-SA') : '-'}</td>
        <td>
          <div style="font-weight:800; color:var(--text-main);">${m.productName}</div>
          ${m.variantTitle ? `<div style="font-size:0.78rem; color:#0369a1; font-weight:700;"><i class="fa-solid fa-tag"></i> ${m.variantTitle}</div>` : ''}
        </td>
        <td>${typeBadges[m.type] || `<span style="background:#f1f5f9; padding:3px 8px; border-radius:999px; font-size:0.75rem;">${m.type}</span>`}</td>
        <td>
          <strong style="font-size:1rem; ${m.quantity < 0 ? 'color:#ef4444;' : 'color:#10b981;'}">
            ${m.quantity > 0 ? '+' : ''}${m.quantity}
          </strong>
        </td>
        <td>
          <strong>${m.remainingStock !== undefined ? m.remainingStock : (m.remaining !== undefined ? m.remaining : '-')}</strong> قطعة
        </td>
        <td>
          <strong style="color:var(--admin-primary);">${m.parentRemainingStock !== undefined ? m.parentRemainingStock + ' قطعة' : '-'}</strong>
        </td>
        <td style="font-size:0.82rem; color:var(--text-muted); max-width:240px;">${m.notes || '-'}</td>
      </tr>
    `).join('');
  },

  /* ================= 6. Coupons & Marketing (Full CRUD) ================= */
  renderCouponsTable() {
    const coupons = window.DB.get('coupons') || [];
    const tbody = document.getElementById('couponsTableBody');
    if (!tbody) return;

    if (coupons.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">لا توجد كوبونات مسجلة. اضغط على "إضافة كوبون جديد" لإنشاء كود خصم.</td></tr>`;
      return;
    }

    tbody.innerHTML = coupons.map(c => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-ticket" style="color:var(--admin-primary);"></i>
            <strong style="color:var(--admin-primary); font-family:monospace; font-size:1.1rem; letter-spacing:1px;">${c.code}</strong>
          </div>
          ${c.description ? `<div style="font-size:0.75rem; color:var(--text-muted);">${c.description}</div>` : ''}
        </td>
        <td>
          <span style="font-weight:800; color:var(--text-main);">
            ${c.type === 'percent' ? `خصم ${c.value}%` : `خصم ثابت ${c.value} ر.س`}
          </span>
        </td>
        <td><strong>${c.minOrder} ر.س</strong></td>
        <td>
          <span>${c.usedCount || 0} / ${c.maxUses || 500}</span>
          <div style="font-size:0.75rem; color:var(--text-muted);">مرة استخدام</div>
        </td>
        <td>${c.expiryDate}</td>
        <td>
          <span class="status-pill ${c.isActive ? 'completed' : 'cancelled'}">
            ${c.isActive ? 'نشط ومفعّل' : 'معطّل'}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-admin-outline" style="padding:6px 10px; font-size:0.8rem;" onclick="AdminApp.toggleCoupon('${c.id}')" title="${c.isActive ? 'تعطيل' : 'تفعيل'}">
              <i class="fa-solid ${c.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}" style="${c.isActive ? 'color:#10b981;' : 'color:#ef4444;'}"></i>
            </button>
            <button class="btn-admin-primary" style="padding:6px 12px; font-size:0.8rem;" onclick="AdminApp.editCoupon('${c.id}')" title="تعديل">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-admin-outline" style="padding:6px 10px; color:#ef4444;" onclick="AdminApp.deleteCoupon('${c.id}')" title="حذف">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openCouponModal(couponId = null) {
    this.editingCouponId = couponId;
    const modal = document.getElementById('couponFormModal');
    const modalTitle = document.getElementById('couponModalTitle');
    const form = document.getElementById('couponForm');

    if (couponId) {
      const coup = window.DB.find('coupons', couponId);
      if (!coup) return;
      modalTitle.textContent = 'تعديل بيانات الكوبون';
      document.getElementById('couponCodeInputField').value = coup.code || '';
      document.getElementById('couponTypeSelect').value = coup.type || 'percent';
      document.getElementById('couponValueInputField').value = coup.value || 10;
      document.getElementById('couponMinOrderInputField').value = coup.minOrder || 100;
      document.getElementById('couponMaxUsesInputField').value = coup.maxUses || 500;
      document.getElementById('couponExpiryInputField').value = coup.expiryDate || '2027-12-31';
      document.getElementById('couponDescInputField').value = coup.description || '';
      document.getElementById('couponActiveCheck').checked = !!coup.isActive;
    } else {
      modalTitle.textContent = 'إضافة كوبون خصم جديد';
      form.reset();
      document.getElementById('couponExpiryInputField').value = '2027-12-31';
      document.getElementById('couponActiveCheck').checked = true;
      this.editingCouponId = null;
    }

    modal.classList.add('active');
  },

  closeCouponModal() {
    document.getElementById('couponFormModal').classList.remove('active');
    this.editingCouponId = null;
  },

  saveCouponForm(e) {
    e.preventDefault();
    const code = document.getElementById('couponCodeInputField').value.trim().toUpperCase();
    const type = document.getElementById('couponTypeSelect').value;
    const value = parseFloat(document.getElementById('couponValueInputField').value) || 0;
    const minOrder = parseFloat(document.getElementById('couponMinOrderInputField').value) || 0;
    const maxUses = parseInt(document.getElementById('couponMaxUsesInputField').value) || 500;
    const expiryDate = document.getElementById('couponExpiryInputField').value;
    const description = document.getElementById('couponDescInputField').value.trim();
    const isActive = document.getElementById('couponActiveCheck').checked;

    if (!code || !value || !expiryDate) {
      this.showToast('يرجى إكمال الحقول الإلزامية للكوبون', 'error');
      return;
    }

    if (this.editingCouponId) {
      window.DB.update('coupons', this.editingCouponId, {
        code,
        type,
        value,
        minOrder,
        maxUses,
        expiryDate,
        description,
        isActive
      });
      window.DB.recordAuditLog('تعديل كوبون', code, 'مدير المتجر', `تحديث الكوبون ${code} (${type === 'percent' ? value + '%' : value + ' ر.س'})`);
      this.showToast('تم تحديث الكوبون بنجاح!', 'success');
    } else {
      const existing = (window.DB.get('coupons') || []).find(c => c.code === code);
      if (existing) {
        this.showToast(`الكود "${code}" موجود مسبقاً، يرجى اختيار كود آخر`, 'error');
        return;
      }

      const newCoupon = {
        id: 'c-' + Date.now(),
        code,
        type,
        value,
        minOrder,
        maxUses,
        usedCount: 0,
        expiryDate,
        description,
        isActive
      };
      window.DB.insert('coupons', newCoupon);
      window.DB.recordAuditLog('إضافة كوبون جديد', code, 'مدير المتجر', `إنشاء كود الخصم ${code} بقيمة ${value} ${type === 'percent' ? '%' : 'ر.س'}`);
      this.showToast(`تمت إضافة الكوبون (${code}) بنجاح! 🎉`, 'success');
    }

    this.closeCouponModal();
    this.renderCouponsTable();
  },

  editCoupon(couponId) {
    this.openCouponModal(couponId);
  },

  deleteCoupon(couponId) {
    const coup = window.DB.find('coupons', couponId);
    if (!coup) return;
    if (confirm(`هل أنت متأكد من حذف الكوبون "${coup.code}"؟`)) {
      window.DB.delete('coupons', couponId);
      window.DB.recordAuditLog('حذف كوبون', coup.code, 'مدير المتجر', `حذف كود الخصم ${coup.code}`);
      this.showToast('تم حذف الكوبون بنجاح', 'info');
      this.renderCouponsTable();
    }
  },

  toggleCoupon(couponId) {
    const coupon = window.DB.find('coupons', couponId);
    if (!coupon) return;
    window.DB.update('coupons', couponId, { isActive: !coupon.isActive });
    window.DB.recordAuditLog('تغيير حالة كوبون', coupon.code, 'مدير المتجر', `تغيير الحالة إلى ${!coupon.isActive ? 'نشط' : 'معطل'}`);
    this.showToast(`تم ${!coupon.isActive ? 'تفعيل' : 'تعطيل'} الكوبون ${coupon.code}`, 'info');
    this.renderCouponsTable();
  },

  /* ================= 7. Customers ================= */
  renderCustomersTable() {
    const customers = window.DB.get('customers') || [];
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    tbody.innerHTML = customers.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td dir="ltr" style="text-align:right;">${c.phone}</td>
        <td>${c.email}</td>
        <td>${c.city}</td>
        <td><strong>${c.totalOrders} طلبات</strong></td>
        <td><strong style="color:var(--admin-primary);">${c.totalSpent} ر.س</strong></td>
      </tr>
    `).join('');
  },

  /* ================= 7.5 Reviews Management (تقييمات ومراجعات المنتجات) ================= */
  renderReviewsTable() {
    const products = window.DB.get('products') || [];
    const reviews = window.DB.get('reviews') || [];
    const tbody = document.getElementById('reviewsProductsTableBody');

    // Calculate KPIs
    const totalCount = reviews.length;
    let avgScore = 0;
    if (totalCount > 0) {
      const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      avgScore = Math.round((sum / totalCount) * 10) / 10;
    }

    const ratedProducts = products.filter(p => {
      const pRevs = reviews.filter(r => String(r.productId) === String(p.id));
      return pRevs.length > 0;
    }).length;

    const kpiTotal = document.getElementById('kpiReviewsTotalCount');
    const kpiAvg = document.getElementById('kpiReviewsStoreAverage');
    const kpiRated = document.getElementById('kpiReviewsRatedProducts');

    if (kpiTotal) kpiTotal.textContent = totalCount;
    if (kpiAvg) kpiAvg.textContent = totalCount > 0 ? `${avgScore.toFixed(1)} ⭐` : '— (لا توجد تقييمات)';
    if (kpiRated) kpiRated.textContent = `${ratedProducts} من ${products.length}`;

    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted);">لا توجد منتجات مسجلة في المتجر.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => {
      const prodRevs = reviews.filter(r => String(r.productId) === String(p.id));
      const count = prodRevs.length;
      let pAvg = 0;
      if (count > 0) {
        const sum = prodRevs.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
        pAvg = Math.round((sum / count) * 10) / 10;
      }

      return `
        <tr class="reviews-product-row" data-name="${p.name.toLowerCase()}" data-sku="${(p.sku || '').toLowerCase()}">
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${p.image}" alt="${p.name}" style="width:44px; height:44px; border-radius:8px; object-fit:cover;">
              <div>
                <strong style="color:var(--text-main); font-size:0.92rem;">${p.name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${p.categoryName || ''}</div>
              </div>
            </div>
          </td>
          <td><span style="font-family:monospace; font-weight:700; color:var(--text-muted);">${p.sku}</span></td>
          <td>${p.categoryName || 'عام'}</td>
          <td>
            ${count > 0 ? `
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:#d97706; font-weight:800; font-size:0.95rem;">${pAvg.toFixed(1)}</span>
                <span style="color:#f59e0b; font-size:0.85rem;">★</span>
              </div>
            ` : `
              <span style="color:var(--text-muted); font-size:0.82rem;">— لا يوجد تقييم</span>
            `}
          </td>
          <td>
            <span style="font-weight:700; color:${count > 0 ? 'var(--text-main)' : 'var(--text-muted)'};">${count} مراجعات</span>
          </td>
          <td style="text-align:center;">
            <button class="btn-admin-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.viewProductReviews('${p.id}')">
              <i class="fa-solid fa-comments"></i> عرض وإدارة التقييمات (${count})
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterReviewsProducts(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.reviews-product-row').forEach(row => {
      const name = row.getAttribute('data-name') || '';
      const sku = row.getAttribute('data-sku') || '';
      if (!q || name.includes(q) || sku.includes(q)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  },

  viewProductReviews(productId) {
    const product = window.DB.find('products', productId);
    if (!product) return;

    const reviews = window.DB.getProductReviews(productId) || [];

    // Fill Modal Header Summary
    const titleEl = document.getElementById('modalReviewsProductTitle');
    const imgEl = document.getElementById('modalRevProdImg');
    const nameEl = document.getElementById('modalRevProdName');
    const skuEl = document.getElementById('modalRevProdSku');
    const priceEl = document.getElementById('modalRevProdPrice');
    const scoreEl = document.getElementById('modalRevProdScore');
    const countEl = document.getElementById('modalRevProdCount');

    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-star" style="color:#f59e0b;"></i> تقييمات ومراجعات منتج: ${product.name}`;
    if (imgEl) imgEl.src = product.image;
    if (nameEl) nameEl.textContent = product.name;
    if (skuEl) skuEl.textContent = product.sku;
    if (priceEl) priceEl.textContent = product.salePrice;

    const count = reviews.length;
    let avg = 0;
    if (count > 0) {
      const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      avg = Math.round((sum / count) * 10) / 10;
    }

    if (scoreEl) scoreEl.textContent = count > 0 ? `${avg.toFixed(1)} ⭐` : '0.0 ⭐ (لا توجد تقييمات)';
    if (countEl) countEl.textContent = `${count} تقييم مسجل`;

    // Render Reviews Table
    const tbody = document.getElementById('modalProductReviewsTbody');
    if (tbody) {
      if (reviews.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted);">
              لا توجد تقييمات مسجلة لهذا المنتج حتى الآن.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = reviews.map(r => {
          const ratingVal = parseInt(r.rating, 10) || 5;
          const stars = Array.from({ length: 5 }, (_, i) => 
            `<span style="color:${i < ratingVal ? '#f59e0b' : '#cbd5e1'}; font-size:0.9rem;">★</span>`
          ).join('');

          return `
            <tr>
              <td>
                <div style="font-weight:800; color:var(--text-main);">${r.authorName}</div>
                <span class="status-pill completed" style="font-size:0.7rem; padding:2px 8px; margin-top:3px; display:inline-block;">
                  <i class="fa-solid fa-circle-check"></i> مشتري موثق
                </span>
              </td>
              <td>
                <div dir="ltr" style="text-align:right; font-family:monospace; font-size:0.85rem;">${r.customerPhone || 'غير محدد'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${r.orderNumber ? '#' + r.orderNumber : ''}</div>
              </td>
              <td>
                <div style="display:flex; align-items:center; gap:2px;">
                  ${stars}
                  <span style="font-weight:800; font-size:0.82rem; margin-right:4px;">(${r.rating}/5)</span>
                </div>
              </td>
              <td><span style="font-size:0.82rem; color:var(--text-muted);">${r.date || 'مؤخراً'}</span></td>
              <td>
                <div style="font-size:0.88rem; line-height:1.6; color:var(--text-main); max-width:320px;">
                  ${r.comment}
                </div>
              </td>
              <td style="text-align:center;">
                <button class="btn-admin-outline" style="color:#ef4444; border-color:#fca5a5; padding:6px 12px; font-size:0.8rem; cursor:pointer;" onclick="AdminApp.deleteSpecificReview('${r.id}', '${productId}')" title="حذف هذا التقييم المحدد نهائياً">
                  <i class="fa-solid fa-trash-can"></i> حذف التقييم
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    const modal = document.getElementById('productReviewsModal');
    if (modal) modal.classList.add('active');
  },

  closeProductReviewsModal() {
    const modal = document.getElementById('productReviewsModal');
    if (modal) modal.classList.remove('active');
  },

  deleteSpecificReview(reviewId, productId) {
    const review = window.DB.find('reviews', reviewId);
    if (!review) return;

    if (!confirm(`هل أنت متأكد من حذف تقييم العميل "${review.authorName}"؟ سيتم حذف التقييم وإعادة احتساب معدل تقييم المنتج تلقائياً.`)) {
      return;
    }

    const success = window.DB.deleteReview(reviewId);
    if (success) {
      this.showToast('تم حذف التقييم بنجاح وتحديث معدل تقييم المنتج! 🗑️', 'success');
      // Refresh modal
      this.viewProductReviews(productId);
      // Refresh main table
      this.renderReviewsTable();
    } else {
      this.showToast('تعذر حذف التقييم', 'error');
    }
  },

  /* ================= 8. Theme Customizer ================= */
  renderThemeCustomizer() {
    const data = window.DB.getAllData();
    const theme = data.theme || {};

    const colorInput = document.getElementById('themePrimaryColorInput');
    if (colorInput && theme.primaryColor) colorInput.value = theme.primaryColor;

    const barText = document.getElementById('themeBarTextInput');
    if (barText && theme.announcementBar) barText.value = theme.announcementBar.text;

    const barEnabled = document.getElementById('themeBarEnabledCheck');
    if (barEnabled && theme.announcementBar) barEnabled.checked = theme.announcementBar.enabled;

    this.renderFlashDealsCustomizer();
    this.renderHeroSlidesList();
  },

  renderFlashDealsCustomizer() {
    const data = window.DB.getAllData();
    const theme = data.theme || {};
    const flash = theme.flashDeals || {
      enabled: theme.sections ? theme.sections.showFlashDeals !== false : true,
      title: 'تخفيضات كبرى تنتهي قريباً',
      badge: 'عروض الصاعقة الحصرية',
      showTimer: true,
      mode: 'auto',
      productIds: []
    };

    const enabledCheck = document.getElementById('flashDealsEnabledCheck');
    if (enabledCheck) enabledCheck.checked = flash.enabled !== false;

    const titleInput = document.getElementById('flashDealsTitleInput');
    if (titleInput) titleInput.value = flash.title || 'تخفيضات كبرى تنتهي قريباً';

    const badgeInput = document.getElementById('flashDealsBadgeInput');
    if (badgeInput) badgeInput.value = flash.badge || 'عروض الصاعقة الحصرية';

    const timerCheck = document.getElementById('flashDealsTimerCheck');
    if (timerCheck) timerCheck.checked = flash.showTimer !== false;

    const isManual = flash.mode === 'manual';
    const autoRadio = document.querySelector('input[name="flashDealsProductMode"][value="auto"]');
    const manualRadio = document.querySelector('input[name="flashDealsProductMode"][value="manual"]');
    if (isManual && manualRadio) {
      manualRadio.checked = true;
    } else if (autoRadio) {
      autoRadio.checked = true;
    }

    this.toggleFlashProductsPicker(isManual);
    this.renderFlashProductsList(flash.productIds || []);
  },

  toggleFlashProductsPicker(show) {
    const container = document.getElementById('flashProductsPickerContainer');
    if (container) {
      container.style.display = show ? 'block' : 'none';
    }
  },

  renderFlashProductsList(selectedIds = []) {
    const list = document.getElementById('flashProductsCheckboxesList');
    if (!list) return;

    const products = window.DB.get('products') || [];
    if (products.length === 0) {
      list.innerHTML = `<p style="grid-column:1/-1; color:var(--text-muted); font-size:0.85rem;">لا توجد منتجات مسجلة في المتجر حالياً.</p>`;
      return;
    }

    list.innerHTML = products.map(p => `
      <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; cursor:pointer; transition:border-color 0.2s;">
        <input type="checkbox" class="flash-prod-checkbox" value="${p.id}" ${selectedIds.includes(p.id) ? 'checked' : ''} style="width:16px; height:16px; accent-color:var(--admin-primary);">
        <img src="${p.image}" alt="${p.name}" style="width:34px; height:34px; border-radius:4px; object-fit:cover; border:1px solid #cbd5e1;">
        <div style="flex:1; overflow:hidden;">
          <div style="font-size:0.82rem; font-weight:700; color:var(--text-main); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${p.name}</div>
          <div style="font-size:0.75rem; color:var(--primary); font-weight:800;">${p.salePrice} ر.س ${p.regularPrice > p.salePrice ? `<span style="text-decoration:line-through; color:#94a3b8; font-size:0.7rem;">${p.regularPrice} ر.س</span>` : ''}</div>
        </div>
      </label>
    `).join('');
  },

  saveFlashDealsSettings(e) {
    if (e) e.preventDefault();

    const enabled = document.getElementById('flashDealsEnabledCheck').checked;
    const title = document.getElementById('flashDealsTitleInput').value.trim() || 'تخفيضات كبرى تنتهي قريباً';
    const badge = document.getElementById('flashDealsBadgeInput').value.trim() || 'عروض الصاعقة الحصرية';
    const showTimer = document.getElementById('flashDealsTimerCheck').checked;
    const modeEl = document.querySelector('input[name="flashDealsProductMode"]:checked');
    const mode = modeEl ? modeEl.value : 'auto';

    const selectedCheckboxes = document.querySelectorAll('.flash-prod-checkbox:checked');
    const productIds = Array.from(selectedCheckboxes).map(cb => cb.value);

    const allData = window.DB.getAllData();
    if (!allData.theme) allData.theme = {};
    allData.theme.flashDeals = {
      enabled,
      title,
      badge,
      showTimer,
      mode,
      productIds
    };

    if (!allData.theme.sections) allData.theme.sections = {};
    allData.theme.sections.showFlashDeals = enabled;

    window.DB.saveData(allData);
    window.DB.recordAuditLog('تحديث قسم عروض الصاعقة', title, 'مدير المتجر', `تم تحديث خيارات العرض، المنتجات، والعداد التنازلي`);
    this.showToast('تم حفظ إعدادات قسم عروض الصاعقة بنجاح! ⚡', 'success');
  },

  saveThemeCustomizer(e) {
    if (e) e.preventDefault();
    const primaryColor = document.getElementById('themePrimaryColorInput').value;
    const barText = document.getElementById('themeBarTextInput').value;
    const barEnabled = document.getElementById('themeBarEnabledCheck').checked;

    const allData = window.DB.getAllData();
    if (!allData.theme) allData.theme = {};
    allData.theme.primaryColor = primaryColor;
    if (!allData.theme.announcementBar) allData.theme.announcementBar = {};
    allData.theme.announcementBar.text = barText;
    allData.theme.announcementBar.enabled = barEnabled;

    window.DB.saveData(allData);
    window.DB.recordAuditLog('تحديث ثيم المتجر', 'تصميم المتجر', 'مدير المتجر', `تغيير اللون الأساسي إلى ${primaryColor}`);
    this.showToast('تم حفظ إعدادات ثيم ومظهر المتجر بنجاح! 🎨', 'success');
  },

  /* ================= Hero Slider Banners Management ================= */
  renderHeroSlidesList() {
    const grid = document.getElementById('heroSlidesGrid');
    if (!grid) return;

    const data = window.DB.getAllData();
    const slides = (data.theme && data.theme.heroSlides) ? data.theme.heroSlides : [];

    if (slides.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:12px;">
          <i class="fa-solid fa-images" style="font-size:2.5rem; color:#94a3b8; margin-bottom:12px;"></i>
          <h4 style="font-size:1.1rem; font-weight:800; color:var(--text-main); margin-bottom:6px;">لا توجد شرائح بنر مضافة حالياً</h4>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:16px;">اضغط على زر "إضافة شريحة / بنر جديد" لإنشاء أول بنر متحرك للمتجر.</p>
          <button type="button" class="btn-admin-primary" onclick="AdminApp.openSlideModal()">
            <i class="fa-solid fa-plus"></i> إضافة شريحة الآن
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = slides.map((slide, index) => `
      <div class="slide-card">
        <div class="slide-card-media">
          <img src="${slide.image || 'assets/images/hero_banner_1.jpg'}" alt="${slide.title}" class="slide-card-img">
          ${slide.badge ? `<span class="slide-card-badge"><i class="fa-solid fa-crown"></i> ${slide.badge}</span>` : ''}
          <span class="slide-card-order-tag">شريحة #${index + 1}</span>
        </div>
        <div class="slide-card-body">
          <h4 class="slide-card-title">${slide.title}</h4>
          <p class="slide-card-subtitle">${slide.subtitle || 'لا يوجد وصف مضاف.'}</p>
          <div class="slide-card-meta">
            <i class="fa-solid fa-arrow-left"></i> زر: <strong>"${slide.buttonText || 'تسوق الآن'}"</strong> (${slide.buttonLink || '#products'})
          </div>
        </div>
        <div class="slide-card-footer">
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn-admin-outline" style="padding:6px 12px; font-size:0.82rem;" onclick="AdminApp.moveHeroSlide('${slide.id}', -1)" title="تقديم الشريحة لأعلى" ${index === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button type="button" class="btn-admin-outline" style="padding:6px 12px; font-size:0.82rem;" onclick="AdminApp.moveHeroSlide('${slide.id}', 1)" title="تأخير الشريحة لأسفل" ${index === slides.length - 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn-admin-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="AdminApp.openSlideModal('${slide.id}')">
              <i class="fa-solid fa-pen-to-square"></i> تعديل
            </button>
            <button type="button" class="btn-admin-outline" style="padding:6px 10px; font-size:0.82rem; color:#ef4444;" onclick="AdminApp.deleteHeroSlide('${slide.id}')" title="حذف الشريحة">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  openSlideModal(slideId = null) {
    this.editingSlideId = slideId;
    const modal = document.getElementById('slideFormModal');
    const modalTitle = document.getElementById('slideModalTitle');
    const form = document.getElementById('slideForm');

    const data = window.DB.getAllData();
    const slides = (data.theme && data.theme.heroSlides) ? data.theme.heroSlides : [];

    if (slideId) {
      const slide = slides.find(s => String(s.id) === String(slideId));
      if (!slide) return;
      modalTitle.textContent = 'تعديل بيانات البنر الرئيسي';
      document.getElementById('slideTitleInput').value = slide.title || '';
      document.getElementById('slideSubtitleInput').value = slide.subtitle || '';
      document.getElementById('slideBadgeInput').value = slide.badge || '';
      document.getElementById('slideBtnTextInput').value = slide.buttonText || '';
      document.getElementById('slideBtnLinkInput').value = slide.buttonLink || '#products';
      document.getElementById('slideImageUrlInput').value = slide.image || '';

      if (slide.image) {
        this.setImagePreview('slide', slide.image, slide.title, 'صورة البنر المحفوظة');
      } else {
        this.removeUploadedImage('slide');
      }
    } else {
      modalTitle.textContent = 'إضافة بنر / شريحة رئيسية جديدة';
      form.reset();
      this.editingSlideId = null;
      document.getElementById('slideBtnTextInput').value = 'تسوق الآن';
      document.getElementById('slideBtnLinkInput').value = '#products';
      this.removeUploadedImage('slide');
    }

    modal.classList.add('active');
  },

  closeSlideModal() {
    document.getElementById('slideFormModal').classList.remove('active');
    this.editingSlideId = null;
  },

  saveSlideForm(e) {
    e.preventDefault();
    const title = document.getElementById('slideTitleInput').value.trim();
    const subtitle = document.getElementById('slideSubtitleInput').value.trim();
    const badge = document.getElementById('slideBadgeInput').value.trim();
    const buttonText = document.getElementById('slideBtnTextInput').value.trim();
    const buttonLink = document.getElementById('slideBtnLinkInput').value.trim() || '#products';
    const image = document.getElementById('slideImageUrlInput').value.trim() || 'assets/images/hero_banner_1.jpg';

    if (!title || !subtitle || !buttonText) {
      this.showToast('يرجى ملء عنوان البنر، الوصف، ونص الزر', 'error');
      return;
    }

    const allData = window.DB.getAllData();
    if (!allData.theme) allData.theme = {};
    if (!allData.theme.heroSlides) allData.theme.heroSlides = [];

    if (this.editingSlideId) {
      const idx = allData.theme.heroSlides.findIndex(s => String(s.id) === String(this.editingSlideId));
      if (idx !== -1) {
        allData.theme.heroSlides[idx] = {
          ...allData.theme.heroSlides[idx],
          title,
          subtitle,
          badge,
          buttonText,
          buttonLink,
          image
        };
        window.DB.saveData(allData);
        window.DB.recordAuditLog('تعديل بنر رئيسي', title, 'مدير المتجر', 'تحديث نصوص وصورة البنر الرئيسي');
        this.showToast('تم تحديث بيانات البنر وتطبيقها في المتجر بنجاح! 🎉', 'success');
      }
    } else {
      const newSlide = {
        id: 'slide-' + Date.now(),
        title,
        subtitle,
        badge,
        buttonText,
        buttonLink,
        image
      };
      allData.theme.heroSlides.push(newSlide);
      window.DB.saveData(allData);
      window.DB.recordAuditLog('إضافة بنر رئيسي جديد', title, 'مدير المتجر', 'إضافة شريحة بنر جديدة في واجهة المتجر');
      this.showToast('تمت إضافة البنر الجديد بنجاح وأصبح متاحاً في المتجر! 🎉', 'success');
    }

    this.closeSlideModal();
    this.renderHeroSlidesList();
  },

  deleteHeroSlide(slideId) {
    const allData = window.DB.getAllData();
    if (!allData.theme || !allData.theme.heroSlides) return;

    const slide = allData.theme.heroSlides.find(s => String(s.id) === String(slideId));
    if (!slide) return;

    if (allData.theme.heroSlides.length <= 1) {
      if (!confirm('تنبيه: هذه هي الشريحة الوحيدة المتبقية في المتجر. هل أنت متأكد من حذفها؟')) return;
    } else {
      if (!confirm(`هل أنت متأكد من حذف البنر "${slide.title}"؟`)) return;
    }

    allData.theme.heroSlides = allData.theme.heroSlides.filter(s => String(s.id) !== String(slideId));
    window.DB.saveData(allData);
    window.DB.recordAuditLog('حذف بنر رئيسي', slide.title, 'مدير المتجر', 'حذف شريحة بنر من واجهة المتجر');
    this.showToast('تم حذف شريحة البنر بنجاح', 'info');
    this.renderHeroSlidesList();
  },

  moveHeroSlide(slideId, direction) {
    const allData = window.DB.getAllData();
    if (!allData.theme || !allData.theme.heroSlides) return;

    const slides = allData.theme.heroSlides;
    const index = slides.findIndex(s => String(s.id) === String(slideId));
    if (index === -1) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIndex];
    slides[targetIndex] = temp;

    window.DB.saveData(allData);
    this.renderHeroSlidesList();
    this.showToast('تم تحديث ترتيب الشرائح بنجاح', 'success');
  },

  /* ================= 9. Store Settings ================= */
  renderStoreSettings() {
    const settings = window.DB.get('settings') || {};
    document.getElementById('setStoreName').value = settings.storeName || '';
    document.getElementById('setStoreSlogan').value = settings.storeSlogan || '';
    document.getElementById('setCrNumber').value = settings.crNumber || '';
    document.getElementById('setVatNumber').value = settings.vatNumber || '';
    document.getElementById('setSupportPhone').value = settings.supportPhone || '';
    document.getElementById('setSupportEmail').value = settings.supportEmail || '';
    document.getElementById('setFreeShippingThreshold').value = settings.freeShippingThreshold || 350;
  },

  saveStoreSettings(e) {
    if (e) e.preventDefault();
    const storeName = document.getElementById('setStoreName').value.trim();
    const storeSlogan = document.getElementById('setStoreSlogan').value.trim();
    const crNumber = document.getElementById('setCrNumber').value.trim();
    const vatNumber = document.getElementById('setVatNumber').value.trim();
    const supportPhone = document.getElementById('setSupportPhone').value.trim();
    const supportEmail = document.getElementById('setSupportEmail').value.trim();
    const freeShippingThreshold = parseFloat(document.getElementById('setFreeShippingThreshold').value) || 350;

    window.DB.update('settings', null, {
      storeName,
      storeSlogan,
      crNumber,
      vatNumber,
      supportPhone,
      supportEmail,
      freeShippingThreshold
    });

    window.DB.recordAuditLog('تحديث إعدادات المتجر', 'الإعدادات العامة', 'مدير المتجر', 'تحديث بيانات المنشأة والضرائب');
    this.showToast('تم حفظ إعدادات المتجر العامة بنجاح!', 'success');
    this.loadAdminProfile();
  },

  resetDemoData() {
    if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط بيانات المتجر الافتراضية؟')) {
      window.DB.resetDemoData();
      this.showToast('تمت إعادة ضبط البيانات بنجاح!', 'info');
      setTimeout(() => location.reload(), 500);
    }
  },

  /* ================= 10. Audit Logs ================= */
  renderAuditLogs() {
    const logs = window.DB.get('audit_logs') || [];
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody) return;

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td><strong>${l.action}</strong></td>
        <td>${l.target}</td>
        <td>${l.user}</td>
        <td>${new Date(l.timestamp).toLocaleString('ar-SA')}</td>
        <td style="color:var(--text-muted); font-size:0.85rem;">${l.details}</td>
      </tr>
    `).join('');
  },

  /* ================= 11. Bundles & Offers Management (نظام الباقات والعروض) ================= */
  editingBundleId: null,

  renderBundles() {
    const bundles = window.DB.get('bundles') || [];
    const orders = window.DB.get('orders') || [];
    const tbody = document.getElementById('bundlesTableBody');

    // Calculate Bundles KPIs
    const totalCount = bundles.length;
    let totalSold = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    bundles.forEach(b => {
      const sold = b.soldCount || 0;
      totalSold += sold;
      totalRevenue += sold * (b.salePrice || 0);
      const unitProfit = Math.max(0, (b.salePrice || 0) - (b.totalCost || 0));
      totalProfit += sold * unitProfit;
    });

    const kpiCount = document.getElementById('kpiBundlesTotalCount');
    const kpiSold = document.getElementById('kpiBundlesTotalSold');
    const kpiRev = document.getElementById('kpiBundlesTotalRevenue');
    const kpiProf = document.getElementById('kpiBundlesTotalProfit');

    if (kpiCount) kpiCount.textContent = totalCount;
    if (kpiSold) kpiSold.textContent = totalSold;
    if (kpiRev) kpiRev.textContent = totalRevenue.toFixed(2) + ' ر.س';
    if (kpiProf) kpiProf.textContent = totalProfit.toFixed(2) + ' ر.س';

    if (!tbody) return;

    if (bundles.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:36px; color:var(--text-muted);">لا توجد باقات أو عروض ترويجية مسجلة حتى الآن. اضغط على "إنشاء باقة جديدة" للبدء.</td></tr>`;
      return;
    }

    tbody.innerHTML = bundles.map(b => {
      const invEngine = window.InventoryEngine || window.StoreInventoryEngine;
      const availableCapacity = (invEngine && typeof invEngine.calculateAvailableBundles === 'function')
        ? invEngine.calculateAvailableBundles(b)
        : Math.min(b.remainingOfferQty || 0, 999);

      const isActive = b.status === 'active';
      const isOfferExhausted = (b.remainingOfferQty || 0) <= 0;
      const isStockExhausted = availableCapacity <= 0;

      let availabilityBadge = '';
      if (!isActive) {
        availabilityBadge = `<span class="status-pill cancelled" style="font-size:0.75rem;">غير نشطة</span>`;
      } else if (isOfferExhausted) {
        availabilityBadge = `<span class="status-pill cancelled" style="font-size:0.75rem; background:#fee2e2; color:#b91c1c;">انتهى العرض</span>`;
      } else if (isStockExhausted) {
        availabilityBadge = `<span class="status-pill cancelled" style="font-size:0.75rem; background:#fef3c7; color:#b45309;">نفد مخزون المكونات</span>`;
      } else {
        availabilityBadge = `<span class="status-pill completed" style="font-size:0.75rem; background:#dcfce7; color:#15803d;">متوفرة (${availableCapacity} باقة)</span>`;
      }

      const compCount = Array.isArray(b.components) ? b.components.length : 0;
      const piecesCount = Array.isArray(b.components) ? b.components.reduce((sum, c) => sum + (c.quantity || 1), 0) : 0;

      return `
        <tr class="bundle-row-item" data-name="${(b.name || '').toLowerCase()}" data-status="${b.status || 'active'}">
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${b.image || 'assets/images/hero_banner_1.jpg'}" alt="${b.name}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; border:1px solid #e2e8f0;">
              <div>
                <strong style="color:var(--text-main); font-size:0.92rem; display:block;">${b.name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.description || ''}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="status-pill ${isActive ? 'completed' : 'cancelled'}" style="font-size:0.75rem;">
              ${isActive ? 'نشطة' : 'غير نشطة'}
            </span>
          </td>
          <td>
            <strong style="color:var(--admin-primary); font-size:1rem;">${b.salePrice} ر.س</strong>
            ${b.totalCost ? `<div style="font-size:0.72rem; color:var(--text-muted);">التكلفة: ${b.totalCost} ر.س</div>` : ''}
          </td>
          <td>
            <div style="font-weight:700; font-size:0.85rem; color:var(--text-main);">${compCount} أصناف (${piecesCount} قطع)</div>
          </td>
          <td><strong style="font-size:0.95rem;">${b.offerQty || 0}</strong></td>
          <td><strong style="color:#2563eb; font-size:0.95rem;">${b.soldCount || 0}</strong></td>
          <td>
            <strong style="color:${(b.remainingOfferQty || 0) <= 2 ? '#ef4444' : '#059669'}; font-size:1rem;">
              ${b.remainingOfferQty !== undefined ? b.remainingOfferQty : (b.offerQty || 0)}
            </strong>
          </td>
          <td>
            <strong style="color:${availableCapacity <= 2 ? '#ef4444' : '#0891b2'}; font-size:1rem;">
              ${availableCapacity}
            </strong>
          </td>
          <td>${availabilityBadge}</td>
          <td>
            ${b.isReturnable ? `
              <span style="color:#059669; font-size:0.78rem; font-weight:700; background:#dcfce7; padding:2px 8px; border-radius:4px;">
                قابلة (${b.returnDays || 14} يوم)
              </span>
            ` : `
              <span style="color:#64748b; font-size:0.78rem; font-weight:700; background:#f1f5f9; padding:2px 8px; border-radius:4px;">
                غير قابلة
              </span>
            `}
          </td>
          <td style="text-align:center;">
            <div style="display:flex; justify-content:center; gap:6px;">
              <button class="btn-admin-outline" style="padding:4px 10px; font-size:0.8rem;" onclick="AdminApp.openBundleModal('${b.id}')" title="تعديل الباقة">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-admin-outline" style="padding:4px 10px; font-size:0.8rem; color:${isActive ? '#d97706' : '#16a34a'};" onclick="AdminApp.toggleBundleStatus('${b.id}')" title="${isActive ? 'تعطيل الباقة' : 'تفعيل الباقة'}">
                <i class="fa-solid ${isActive ? 'fa-pause' : 'fa-play'}"></i>
              </button>
              <button class="btn-admin-outline" style="padding:4px 10px; font-size:0.8rem; color:#ef4444;" onclick="AdminApp.deleteBundle('${b.id}')" title="حذف الباقة">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterBundlesTable(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.bundle-row-item').forEach(row => {
      const name = row.getAttribute('data-name') || '';
      if (!q || name.includes(q)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  },

  filterBundlesByStatus(status) {
    document.querySelectorAll('.bundle-row-item').forEach(row => {
      const rowStatus = row.getAttribute('data-status') || 'active';
      if (status === 'all' || rowStatus === status) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  },

  openBundleModal(bundleId = null) {
    this.editingBundleId = bundleId;
    const modal = document.getElementById('bundleFormModal');
    const modalTitle = document.getElementById('bundleModalTitle');
    const compList = document.getElementById('bundleComponentsList');
    if (compList) compList.innerHTML = '';

    if (bundleId) {
      const bundle = window.DB.find('bundles', bundleId);
      if (!bundle) return;
      modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:var(--admin-primary); margin-left:6px;"></i> تعديل الباقة والعرض: ${bundle.name}`;
      document.getElementById('bundleNameInput').value = bundle.name || '';
      document.getElementById('bundleDescInput').value = bundle.description || '';
      document.getElementById('bundleStatusSelect').value = bundle.status || 'active';
      document.getElementById('bundleOfferQtyInput').value = bundle.offerQty || 5;
      document.getElementById('bundleIsReturnableSelect').value = bundle.isReturnable === false ? 'false' : 'true';
      document.getElementById('bundleReturnDaysInput').value = bundle.returnDays !== undefined ? bundle.returnDays : 14;
      document.getElementById('bundleSalePriceInput').value = bundle.salePrice || '';
      document.getElementById('bundleExtraCostsInput').value = bundle.extraCosts || 0;
      this.handleBundleReturnPolicyChange(bundle.isReturnable === false ? 'false' : 'true');

      if (bundle.image) {
        this.setImagePreview('bundle', bundle.image, bundle.name, 'صورة الباقة المحفوظة');
      } else {
        this.removeUploadedImage('bundle');
      }

      if (Array.isArray(bundle.components) && bundle.components.length > 0) {
        bundle.components.forEach(c => this.addBundleComponentRow(c));
      } else {
        this.addBundleComponentRow();
      }
    } else {
      modalTitle.innerHTML = `<i class="fa-solid fa-gift" style="color:var(--admin-primary); margin-left:6px;"></i> إنشاء باقة وعرض جديد`;
      document.getElementById('bundleForm').reset();
      this.editingBundleId = null;
      document.getElementById('bundleStatusSelect').value = 'active';
      document.getElementById('bundleOfferQtyInput').value = 5;
      document.getElementById('bundleIsReturnableSelect').value = 'true';
      document.getElementById('bundleReturnDaysInput').value = 14;
      document.getElementById('bundleExtraCostsInput').value = 0;
      this.handleBundleReturnPolicyChange('true');
      this.removeUploadedImage('bundle');
      this.addBundleComponentRow();
    }

    this.recalculateBundleMetrics();
    if (modal) modal.classList.add('active');
  },

  closeBundleModal() {
    const modal = document.getElementById('bundleFormModal');
    if (modal) modal.classList.remove('active');
    this.editingBundleId = null;
  },

  handleBundleReturnPolicyChange(val) {
    const isReturnable = val === 'true';
    const wrapper = document.getElementById('bundleReturnDaysWrapper');
    if (wrapper) wrapper.style.display = isReturnable ? 'block' : 'none';
  },

  addBundleComponentRow(compData = null) {
    const list = document.getElementById('bundleComponentsList');
    if (!list) return;

    const products = (window.DB.get('products') || []).filter(p => !p.isBundle);
    if (products.length === 0) {
      this.showToast('لا توجد منتجات مسجلة في المتجر لإضافتها للباقة! يرجى إضافة منتجات فردية أولاً.', 'error');
      return;
    }

    const rowId = 'bcomp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const selectedProdId = compData ? compData.productId : products[0].id;
    const initialQty = compData ? compData.quantity : 1;
    const initialMode = compData ? (compData.variantMode || 'fixed') : 'fixed';
    const initialVariantId = compData ? (compData.fixedVariantId || '') : '';

    const rowDiv = document.createElement('div');
    rowDiv.id = rowId;
    rowDiv.className = 'bundle-comp-row';
    rowDiv.style.background = '#ffffff';
    rowDiv.style.border = '1px solid #cbd5e1';
    rowDiv.style.borderRadius = '8px';
    rowDiv.style.padding = '12px';
    rowDiv.style.display = 'grid';
    rowDiv.style.gridTemplateColumns = '2fr 1fr 2fr auto';
    rowDiv.style.gap = '10px';
    rowDiv.style.alignItems = 'center';

    rowDiv.innerHTML = `
      <div>
        <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">المنتج الأصلي *</label>
        <select class="admin-select comp-prod-select" onchange="AdminApp.handleBundleComponentProductChange('${rowId}', this.value)" style="padding:6px; font-size:0.85rem;">
          ${products.map(p => `<option value="${p.id}" ${String(p.id) === String(selectedProdId) ? 'selected' : ''}>${p.name} (مخزون: ${p.stock})</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">الكمية بالباقة *</label>
        <input type="number" class="admin-input comp-qty-input" min="1" value="${initialQty}" style="padding:6px; font-size:0.85rem;" oninput="AdminApp.recalculateBundleMetrics()">
      </div>
      <div id="${rowId}-variant-section">
        <!-- Variant Controls rendered by handleBundleComponentProductChange -->
      </div>
      <div style="padding-top:16px;">
        <button type="button" class="btn-admin-outline" style="color:#ef4444; border-color:#fca5a5; padding:6px 10px;" onclick="AdminApp.removeBundleComponentRow('${rowId}')" title="حذف هذا المكون">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    list.appendChild(rowDiv);
    this.handleBundleComponentProductChange(rowId, selectedProdId, initialMode, initialVariantId);
    this.recalculateBundleMetrics();
  },

  handleBundleComponentProductChange(rowId, prodId, currentMode = 'fixed', currentVarId = '') {
    const section = document.getElementById(`${rowId}-variant-section`);
    if (!section) return;

    const product = window.DB.find('products', prodId);
    if (!product) return;

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

    if (!hasVariants) {
      section.innerHTML = `
        <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">خيارات المنتج</label>
        <div style="font-size:0.8rem; color:#64748b; background:#f1f5f9; padding:6px 10px; border-radius:6px;">
          <i class="fa-solid fa-check"></i> منتج قياسي (بدون مقاسات أو ألوان)
        </div>
      `;
    } else {
      section.innerHTML = `
        <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">خيارات المقاس / اللون *</label>
        <div style="display:flex; gap:6px;">
          <select class="admin-select comp-var-mode-select" onchange="AdminApp.toggleComponentVariantDropdown('${rowId}', this.value)" style="padding:6px; font-size:0.8rem; flex:1;">
            <option value="fixed" ${currentMode === 'fixed' ? 'selected' : ''}>تثبيت متغير محدد</option>
            <option value="customer_choice" ${currentMode === 'customer_choice' ? 'selected' : ''}>السماح للعميل بالاختيار</option>
          </select>
          <select class="admin-select comp-var-id-select" id="${rowId}-var-select" style="padding:6px; font-size:0.8rem; flex:1; display:${currentMode === 'fixed' ? 'block' : 'none'};">
            ${product.variants.map(v => `<option value="${v.id}" ${String(v.id) === String(currentVarId) ? 'selected' : ''}>${v.title} (${v.stock} قطعة)</option>`).join('')}
          </select>
        </div>
      `;
    }

    this.recalculateBundleMetrics();
  },

  toggleComponentVariantDropdown(rowId, mode) {
    const sel = document.getElementById(`${rowId}-var-select`);
    if (sel) sel.style.display = mode === 'fixed' ? 'block' : 'none';
    this.recalculateBundleMetrics();
  },

  removeBundleComponentRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) row.remove();
    this.recalculateBundleMetrics();
  },

  recalculateBundleMetrics() {
    const rows = document.querySelectorAll('#bundleComponentsList .bundle-comp-row');
    const extraCost = parseFloat(document.getElementById('bundleExtraCostsInput').value) || 0;
    const salePrice = parseFloat(document.getElementById('bundleSalePriceInput').value) || 0;
    const offerQty = parseInt(document.getElementById('bundleOfferQtyInput').value, 10) || 5;

    let typesSet = new Set();
    let totalPieces = 0;
    let itemsCost = 0;
    let possibleCapacity = 999999;

    rows.forEach(r => {
      const prodSelect = r.querySelector('.comp-prod-select');
      const qtyInput = r.querySelector('.comp-qty-input');
      const prodId = prodSelect ? prodSelect.value : null;
      const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

      if (prodId) {
        typesSet.add(prodId);
        totalPieces += qty;
        const prod = window.DB.find('products', prodId);
        if (prod) {
          const unitCost = prod.costPrice !== undefined ? prod.costPrice : (prod.regularPrice || 0);
          itemsCost += (unitCost * qty);

          // Calculate capacity for this component
          let compStock = prod.stock || 0;
          const varModeSelect = r.querySelector('.comp-var-mode-select');
          const varIdSelect = r.querySelector('.comp-var-id-select');
          if (varModeSelect && varModeSelect.value === 'fixed' && varIdSelect) {
            const v = (prod.variants || []).find(x => String(x.id) === String(varIdSelect.value));
            if (v) compStock = v.stock || 0;
          }
          const compCapacity = Math.floor(compStock / qty);
          if (compCapacity < possibleCapacity) {
            possibleCapacity = compCapacity;
          }
        }
      }
    });

    if (rows.length === 0) possibleCapacity = 0;
    if (possibleCapacity === 999999) possibleCapacity = 0;

    const totalCost = itemsCost + extraCost;
    const grossProfit = salePrice - totalCost;
    const margin = salePrice > 0 ? ((grossProfit / salePrice) * 100).toFixed(1) : 0;

    const elTypes = document.getElementById('bmTypesCount');
    const elPieces = document.getElementById('bmPiecesCount');
    const elItemsCost = document.getElementById('bmItemsCost');
    const elExtra = document.getElementById('bmExtraCost');
    const elTotalCost = document.getElementById('bmTotalCost');
    const elSale = document.getElementById('bmSalePrice');
    const elProfit = document.getElementById('bmGrossProfit');
    const elMargin = document.getElementById('bmProfitMargin');
    const elBadge = document.getElementById('bundleStockCapacityBadge');
    const elWarning = document.getElementById('bundleLossWarning');
    const elNotice = document.getElementById('bundleStockNotice');
    const elNoticeText = document.getElementById('bundleStockNoticeText');

    if (elTypes) elTypes.textContent = typesSet.size;
    if (elPieces) elPieces.textContent = totalPieces;
    if (elItemsCost) elItemsCost.textContent = itemsCost.toFixed(2) + ' ر.س';
    if (elExtra) elExtra.textContent = extraCost.toFixed(2) + ' ر.س';
    if (elTotalCost) elTotalCost.textContent = totalCost.toFixed(2) + ' ر.س';
    if (elSale) elSale.textContent = salePrice.toFixed(2) + ' ر.س';
    if (elProfit) {
      elProfit.textContent = grossProfit.toFixed(2) + ' ر.س';
      elProfit.style.color = grossProfit >= 0 ? '#15803d' : '#b91c1c';
    }
    if (elMargin) {
      elMargin.textContent = margin + '%';
      elMargin.style.color = grossProfit >= 0 ? '#15803d' : '#b91c1c';
    }

    if (elBadge) {
      elBadge.textContent = `المتاح تكوينه من المخزون: ${possibleCapacity} باقة`;
      elBadge.style.background = possibleCapacity >= offerQty ? '#dcfce7' : '#fee2e2';
      elBadge.style.color = possibleCapacity >= offerQty ? '#15803d' : '#b91c1c';
    }

    if (elWarning) {
      elWarning.style.display = (salePrice > 0 && salePrice < totalCost) ? 'block' : 'none';
    }

    if (elNotice && elNoticeText) {
      if (possibleCapacity < offerQty) {
        elNotice.style.display = 'block';
        elNoticeText.textContent = `تنبيه: مخزون المكونات الحالي يكفي فقط لـ ${possibleCapacity} باقة، بينما حد العرض ${offerQty}. سيتمكن العميل من شراء حتى ${possibleCapacity} فقط لحين تزويد المخزون.`;
      } else {
        elNotice.style.display = 'none';
      }
    }
  },

  saveBundleForm(e) {
    e.preventDefault();
    const name = document.getElementById('bundleNameInput').value.trim();
    const description = document.getElementById('bundleDescInput').value.trim();
    const status = document.getElementById('bundleStatusSelect').value;
    const offerQty = parseInt(document.getElementById('bundleOfferQtyInput').value, 10) || 5;
    const isReturnable = document.getElementById('bundleIsReturnableSelect').value === 'true';
    const returnDays = isReturnable ? (parseInt(document.getElementById('bundleReturnDaysInput').value, 10) || 14) : 0;
    const salePrice = parseFloat(document.getElementById('bundleSalePriceInput').value) || 0;
    const extraCosts = parseFloat(document.getElementById('bundleExtraCostsInput').value) || 0;
    const image = document.getElementById('bundleImageUrlInput').value.trim() || 'assets/images/hero_banner_1.jpg';

    if (!name || salePrice <= 0 || offerQty <= 0) {
      this.showToast('يرجى ملء جميع الحقول الإلزامية وتحديد سعر بيع وكمية عرض صالحة', 'error');
      return;
    }

    const rows = document.querySelectorAll('#bundleComponentsList .bundle-comp-row');
    if (rows.length === 0) {
      this.showToast('يجب إضافة منتج واحد على الأقل داخل الباقة', 'error');
      return;
    }

    let components = [];
    let itemsCost = 0;

    rows.forEach(r => {
      const prodSelect = r.querySelector('.comp-prod-select');
      const qtyInput = r.querySelector('.comp-qty-input');
      const varModeSelect = r.querySelector('.comp-var-mode-select');
      const varIdSelect = r.querySelector('.comp-var-id-select');

      const prodId = prodSelect ? prodSelect.value : null;
      const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;
      const varMode = varModeSelect ? varModeSelect.value : 'fixed';
      const fixedVarId = (varMode === 'fixed' && varIdSelect) ? varIdSelect.value : null;

      if (prodId) {
        const prod = window.DB.find('products', prodId);
        if (prod) {
          const unitCost = prod.costPrice !== undefined ? prod.costPrice : (prod.regularPrice || 0);
          itemsCost += (unitCost * qty);

          let varTitle = '';
          if (fixedVarId && Array.isArray(prod.variants)) {
            const v = prod.variants.find(x => String(x.id) === String(fixedVarId));
            if (v) varTitle = v.title;
          }

          components.push({
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            image: prod.image,
            unitCost: unitCost,
            regularPrice: prod.regularPrice || prod.salePrice || 0,
            quantity: qty,
            variantMode: varMode,
            fixedVariantId: fixedVarId,
            fixedVariantTitle: varTitle,
            variants: prod.variants || []
          });
        }
      }
    });

    const totalCost = itemsCost + extraCosts;

    if (this.editingBundleId) {
      const existing = window.DB.find('bundles', this.editingBundleId);
      if (!existing) return;

      const sold = existing.soldCount || 0;
      if (offerQty < sold) {
        this.showToast(`لا يمكن تقليل كمية العرض عن عدد الباقات المباعة بالفعل (${sold} باقة)`, 'error');
        return;
      }

      // Preserve remaining offer quantity proportionally
      const diff = offerQty - (existing.offerQty || 0);
      const newRemaining = Math.max(0, (existing.remainingOfferQty !== undefined ? existing.remainingOfferQty : existing.offerQty) + diff);

      const updates = {
        name,
        description,
        status,
        image,
        offerQty,
        remainingOfferQty: newRemaining,
        isReturnable,
        returnDays,
        salePrice,
        extraCosts,
        components,
        itemsCost,
        totalCost,
        updatedAt: new Date().toISOString()
      };

      window.DB.update('bundles', this.editingBundleId, updates);
      window.DB.recordAuditLog('تعديل باقة', name, 'مدير المتجر', `تحديث بيانات الباقة والعرض ${name}`);
      this.showToast('تم حفظ تعديلات الباقة بنجاح! 🎁', 'success');
    } else {
      const newBundle = {
        id: 'bundle-' + Date.now(),
        name,
        description,
        status,
        image,
        offerQty,
        remainingOfferQty: offerQty,
        soldCount: 0,
        isReturnable,
        returnDays,
        salePrice,
        extraCosts,
        components,
        itemsCost,
        totalCost,
        createdAt: new Date().toISOString()
      };

      window.DB.insert('bundles', newBundle);
      window.DB.recordAuditLog('إنشاء باقة جديدة', name, 'مدير المتجر', `إنشاء باقة جديدة بكمية عرض ${offerQty} وسعر ${salePrice} ر.س`);
      this.showToast('تم إنشاء الباقة والعرض الترويجي بنجاح! 🎉', 'success');
    }

    this.closeBundleModal();
    this.renderBundles();
  },

  toggleBundleStatus(bundleId) {
    const bundle = window.DB.find('bundles', bundleId);
    if (!bundle) return;
    const newStatus = bundle.status === 'active' ? 'inactive' : 'active';
    window.DB.update('bundles', bundleId, { status: newStatus });
    window.DB.recordAuditLog(
      newStatus === 'active' ? 'تفعيل باقة' : 'إيقاف باقة مؤقتاً',
      bundle.name,
      'مدير المتجر',
      `تم تغيير حالة الباقة إلى ${newStatus}`
    );
    this.showToast(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} الباقة بنجاح`, 'info');
    this.renderBundles();
  },

  deleteBundle(bundleId) {
    const bundle = window.DB.find('bundles', bundleId);
    if (!bundle) return;

    if (!confirm(`هل أنت متأكد من حذف الباقة "${bundle.name}"؟ ملاحظة: لن يؤثر الحذف على سجلات وفواتير الطلبات السابقة.`)) {
      return;
    }

    window.DB.delete('bundles', bundleId);
    window.DB.recordAuditLog('حذف باقة', bundle.name, 'مدير المتجر', 'حذف الباقة من قائمة العروض');
    this.showToast('تم حذف الباقة بنجاح 🗑️', 'info');
    this.renderBundles();
  },

  /* ================= 12. Financial & Accounting Management (الإدارة المالية والمحاسبية للمتجر بالكامل) ================= */
  activeFinancialPeriod: 'all',

  setFinancialPeriod(period, btn) {
    this.activeFinancialPeriod = period;
    document.querySelectorAll('.fin-period-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const customWrapper = document.getElementById('customDateRangeInputs');
    if (customWrapper) {
      customWrapper.style.display = period === 'custom' ? 'flex' : 'none';
    }

    if (period !== 'custom') {
      this.renderFinance();
    }
  },

  applyCustomFinancialRange() {
    this.renderFinance();
  },

  renderFinance() {
    let opts = { period: this.activeFinancialPeriod || 'all' };
    if (this.activeFinancialPeriod === 'custom') {
      const s = document.getElementById('finStartDateInput');
      const e = document.getElementById('finEndDateInput');
      if (s && s.value) opts.startDate = s.value;
      if (e && e.value) opts.endDate = e.value;
    }

    const fin = (window.DB && typeof window.DB.calculateComprehensiveFinancials === 'function')
      ? window.DB.calculateComprehensiveFinancials(opts)
      : {
          grossSales: 0, discounts: 0, netSales: 0, collectedAmount: 0,
          pendingAmount: 0, cancelledAmount: 0, cancelledOrdersCount: 0,
          refundedAmount: 0, cogs: 0, grossProfit: 0, totalExpenses: 0,
          netProfit: 0, vatCollected: 0, inventoryValuation: 0, profitMarginPercent: 0
        };

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = (typeof val === 'number') ? val.toFixed(2) + ' ر.س' : val;
    };

    setVal('finGrossSales', fin.grossSales);
    setVal('finDiscounts', fin.discounts);
    setVal('finNetSales', fin.netSales);
    setVal('finCollectedAmount', fin.collectedAmount);
    setVal('finPendingAmount', fin.pendingAmount);
    setVal('finCancelledAmount', fin.cancelledAmount);
    setVal('finRefundedAmount', fin.refundedAmount);
    setVal('finCogsAmount', fin.cogs);
    setVal('finGrossProfit', fin.grossProfit);
    setVal('finTotalExpenses', fin.totalExpenses);
    setVal('finNetProfit', fin.netProfit);
    setVal('finVatCollected', fin.vatCollected);
    setVal('finInventoryValuation', fin.inventoryValuation);

    const cancelLabel = document.getElementById('finCancelledCountLabel');
    if (cancelLabel) cancelLabel.textContent = `${fin.cancelledOrdersCount || 0} طلبات ملغاة`;

    const marginLabel = document.getElementById('finProfitMarginLabel');
    if (marginLabel) marginLabel.textContent = `هامش الربح الصافي: ${fin.profitMarginPercent || 0}%`;

    this.renderExpenses();
    this.renderFinancialStatement(fin);
  },

  renderExpenses() {
    const expenses = window.DB.get('expenses') || [];
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;

    if (expenses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">لا توجد مصروفات أو رسوم تشغيلية مسجلة حالياً.</td></tr>`;
      return;
    }

    tbody.innerHTML = expenses.map(e => `
      <tr>
        <td>
          <div style="font-weight:800; color:var(--text-main); font-size:0.9rem;">${e.title}</div>
          <span class="status-pill new" style="font-size:0.72rem; padding:2px 8px; margin-top:3px; display:inline-block;">${e.category}</span>
        </td>
        <td><strong style="color:#b91c1c; font-size:1rem;">${parseFloat(e.amount).toFixed(2)} ر.س</strong></td>
        <td><span style="font-size:0.85rem; color:var(--text-muted);">${e.date || 'اليوم'}</span></td>
        <td><span style="font-family:monospace; font-size:0.85rem;">${e.reference || '—'}</span></td>
        <td><div style="font-size:0.82rem; color:var(--text-muted); max-width:240px;">${e.notes || '—'}</div></td>
        <td style="text-align:center;">
          <button class="btn-admin-outline" style="color:#ef4444; border-color:#fca5a5; padding:4px 8px; font-size:0.78rem;" onclick="AdminApp.deleteExpense('${e.id}')" title="حذف هذا المصروف">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  openExpenseModal() {
    const modal = document.getElementById('expenseFormModal');
    if (!modal) return;
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDateInput').value = new Date().toISOString().split('T')[0];
    modal.classList.add('active');
  },

  closeExpenseModal() {
    const modal = document.getElementById('expenseFormModal');
    if (modal) modal.classList.remove('active');
  },

  saveExpenseForm(e) {
    e.preventDefault();
    const category = document.getElementById('expenseCategorySelect').value;
    const title = document.getElementById('expenseTitleInput').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmountInput').value) || 0;
    const date = document.getElementById('expenseDateInput').value;
    const reference = document.getElementById('expenseRefInput').value.trim();
    const notes = document.getElementById('expenseNotesInput').value.trim();

    if (!title || amount <= 0 || !date) {
      this.showToast('يرجى إدخال بيان وتصنيف وتاريخ ومبلغ المصروف بشكل صحيح', 'error');
      return;
    }

    const newExpense = {
      id: 'exp-' + Date.now(),
      category,
      title,
      amount,
      date,
      reference,
      notes,
      createdAt: new Date().toISOString()
    };

    window.DB.insert('expenses', newExpense);
    window.DB.recordAuditLog('تسجيل مصروف تشغيلي', title, 'مدير المتجر', `تسجيل مصروف بقيمة ${amount} ر.س لتصنيف ${category}`);
    this.showToast('تم حفظ المصروف في السجلات المالية بنجاح! 💰', 'success');

    this.closeExpenseModal();
    this.renderFinance();
  },

  deleteExpense(expId) {
    const exp = window.DB.find('expenses', expId);
    if (!exp) return;

    if (!confirm(`هل أنت متأكد من حذف مصروف "${exp.title}" بقيمة ${exp.amount} ر.س؟`)) {
      return;
    }

    window.DB.delete('expenses', expId);
    window.DB.recordAuditLog('حذف مصروف تشغيلي', exp.title, 'مدير المتجر', `حذف قيد مصروف بقيمة ${exp.amount} ر.س`);
    this.showToast('تم حذف المصروف بنجاح', 'info');
    this.renderFinance();
  },

  renderFinancialStatement(fin) {
    const tbody = document.getElementById('financialStatementTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
      <tr style="background:#f8fafc; font-weight:800;">
        <td style="padding:10px 14px;">1. إجمالي إيرادات المبيعات (Gross Sales)</td>
        <td style="text-align:left; padding:10px 14px; color:#2563eb;">+ ${fin.grossSales.toFixed(2)} ر.س</td>
      </tr>
      <tr>
        <td style="padding:8px 14px; padding-right:28px; color:var(--text-muted);">( - ) الخصومات والكوبونات الممنوحة (Discounts)</td>
        <td style="text-align:left; padding:8px 14px; color:#d97706;">- ${fin.discounts.toFixed(2)} ر.س</td>
      </tr>
      <tr>
        <td style="padding:8px 14px; padding-right:28px; color:var(--text-muted);">( - ) المبالغ المستردة وقيمة مرتجعات العملاء (Refunds & Returns)</td>
        <td style="text-align:left; padding:8px 14px; color:#ef4444;">- ${fin.refundedAmount.toFixed(2)} ر.س</td>
      </tr>
      <tr style="background:#f1f5f9; font-weight:800;">
        <td style="padding:10px 14px;">= صافي المبيعات المحققة (Net Sales)</td>
        <td style="text-align:left; padding:10px 14px; color:#10b981;">${fin.netSales.toFixed(2)} ر.س</td>
      </tr>
      <tr>
        <td style="padding:8px 14px; padding-right:28px; color:var(--text-muted);">( - ) تكلفة البضاعة المباعة بعد استبعاد المرتجع للمخزون (COGS)</td>
        <td style="text-align:left; padding:8px 14px; color:#ea580c;">- ${fin.cogs.toFixed(2)} ر.س</td>
      </tr>
      <tr style="background:#e0f2fe; font-weight:900;">
        <td style="padding:10px 14px; color:#0369a1;">= إجمالي الربح التشغيلي (Gross Profit)</td>
        <td style="text-align:left; padding:10px 14px; color:#0369a1;">${fin.grossProfit.toFixed(2)} ر.س</td>
      </tr>
      <tr>
        <td style="padding:8px 14px; padding-right:28px; color:var(--text-muted);">( - ) المصروفات التشغيلية ورسوم الدفع والشحن (Operating Expenses)</td>
        <td style="text-align:left; padding:8px 14px; color:#e11d48;">- ${fin.totalExpenses.toFixed(2)} ر.س</td>
      </tr>
      <tr style="background:#dcfce7; font-weight:900; font-size:1.05rem;">
        <td style="padding:12px 14px; color:#15803d;">= صافي الربح النهائي الخاضع للضريبة (Net Profit)</td>
        <td style="text-align:left; padding:12px 14px; color:#15803d;">${fin.netProfit.toFixed(2)} ر.س</td>
      </tr>
      <tr style="font-size:0.85rem; color:var(--text-muted);">
        <td style="padding:8px 14px;">ضريبة القيمة المضافة 15% المحصلة بعد خصم ضريبة المرتجعات (لا تُحتسب كربح للمتجر):</td>
        <td style="text-align:left; padding:8px 14px; font-weight:700; color:#4f46e5;">${fin.vatCollected.toFixed(2)} ر.س</td>
      </tr>
      <tr style="font-size:0.85rem; color:var(--text-muted);">
        <td style="padding:8px 14px;">قيمة المخزون الحالي الإجمالية بسعر التكلفة الداخلية (Valuation at Cost):</td>
        <td style="text-align:left; padding:8px 14px; font-weight:700; color:#0284c7;">${fin.inventoryValuation.toFixed(2)} ر.س</td>
      </tr>
    `;
  },

  exportFinancialReport() {
    this.showToast('جاري تصدير التقرير المالي الموحد بصيغة قابلة للمراجعة المحاسبية...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  },

  /* ================= Helpers ================= */
  getStatusPillClass(status) {
    switch (status) {
      case 'جديد': return 'new';
      case 'قيد التجهيز': return 'processing';
      case 'تم الشحن': return 'shipped';
      case 'مكتمل': return 'completed';
      case 'ملغي': return 'cancelled';
      case 'مسترجع': return 'cancelled';
            default: return 'new';
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('adminToastContainer');
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

window.AdminApp = AdminApp;
document.addEventListener('DOMContentLoaded', () => AdminApp.init());
