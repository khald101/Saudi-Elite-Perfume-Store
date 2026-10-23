/**
 * Salla Store - Authentication & Permissions Engine
 * Supports: Store Manager (Khald@123.com / Khald1234), Customer Accounts,
 * Secure Salting & SHA-256 Hashing, Role-Based Access Control, Gated Actions.
 */

window.Auth = {
  SALT: 'salla_salt_2026',
  SESSION_KEY: 'salla_active_user',
  PENDING_ACTION_KEY: 'salla_pending_auth_action',

  async sha256(message) {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback simple hash for non-crypto environments
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const chr = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  },

  async hashPassword(password, salt = this.SALT) {
    return await this.sha256(salt + String(password));
  },

  getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY) || localStorage.getItem(this.SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading auth session:', e);
    }
    return null;
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const u = this.getCurrentUser();
    return !!(u && u.role === 'admin');
  },

  async login(email, password, remember = true) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');

    if (!cleanEmail || !cleanPassword) {
      return { success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' };
    }

    const users = window.DB.get('users') || [];
    const user = users.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);

    if (!user) {
      return { 
        success: false, 
        notFound: true,
        message: 'الحساب غير موجود. يمكنك إنشاء حساب جديد مجاناً في ثوانٍ!' 
      };
    }

    const computedHash = await this.hashPassword(cleanPassword, user.salt || this.SALT);
    if (computedHash !== user.passwordHash) {
      return { success: false, message: 'كلمة المرور غير صحيحة، يرجى التحقق وإعادة المحاولة.' };
    }

    // Prepare safe session user (omit passwordHash and salt)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role === 'admin' ? 'admin' : 'customer'
    };

    const sessionData = JSON.stringify(safeUser);
    sessionStorage.setItem(this.SESSION_KEY, sessionData);
    if (remember) {
      localStorage.setItem(this.SESSION_KEY, sessionData);
    }

    // Record Audit Log
    window.DB.recordAuditLog(
      'تسجيل دخول ناجح',
      safeUser.name,
      safeUser.role === 'admin' ? 'مدير المتجر' : 'عميل',
      `تم تسجيل الدخول بنجاح عبر البريد ${safeUser.email}`
    );

    this.updateUI();

    return {
      success: true,
      user: safeUser,
      isAdmin: safeUser.role === 'admin',
      redirect: safeUser.role === 'admin' ? 'admin.html' : null
    };
  },

  async register({ name, email, password, phone = '' }) {
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');
    const cleanPhone = String(phone || '').trim();

    if (!cleanName) {
      return { success: false, message: 'يرجى إدخال الاسم بالكامل.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'صيغة البريد الإلكتروني غير صحيحة.' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, message: 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل لضمان أمان حسابك.' };
    }

    const users = window.DB.get('users') || [];
    const exists = users.some(u => u.email && u.email.trim().toLowerCase() === cleanEmail);

    if (exists) {
      return {
        success: false,
        error: 'email_exists',
        message: 'البريد الإلكتروني مسجل بالفعل لدينا! يرجى تسجيل الدخول بدلاً من ذلك.'
      };
    }

    // Generate unique salt and hash
    const salt = 'salt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const passwordHash = await this.hashPassword(cleanPassword, salt);

    // Strictly assign role 'customer' for all public registrations
    const newUser = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || '050' + Math.floor(1000000 + Math.random() * 9000000),
      role: 'customer',
      salt,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    window.DB.insert('users', newUser);

    // Initialize customer wallet
    const allWallets = window.DB.getAllData().wallets || {};
    if (!allWallets[newUser.phone]) {
      window.DB.getWallet(newUser.phone);
    }

    window.DB.recordAuditLog(
      'إنشاء حساب عميل جديد',
      newUser.name,
      'نظام التسجيل',
      `تم إنشاء حساب عميل جديد برقم جوال ${newUser.phone} وبريد ${newUser.email}`
    );

    // Automatically log in newly registered user
    return await this.login(cleanEmail, cleanPassword, true);
  },

  logout() {
    const user = this.getCurrentUser();
    sessionStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    try { sessionStorage.clear(); } catch(e){}
    if (user) {
      window.DB.recordAuditLog(
        'تسجيل خروج',
        user.name,
        user.role === 'admin' ? 'مدير المتجر' : 'عميل',
        'تم تسجيل الخروج بنجاح'
      );
    }

    this.updateUI();

    // If on admin.html, redirect immediately to storefront
    if (window.location.pathname.includes('admin.html')) {
      window.location.href = 'index.html';
    } else {
      if (window.StoreApp && typeof window.StoreApp.showHome === 'function') {
        window.StoreApp.showHome();
      }
      if (window.StoreApp && typeof window.StoreApp.showToast === 'function') {
        window.StoreApp.showToast('تم تسجيل الخروج بنجاح', 'info');
      }
    }
  },

  setPendingAction(action) {
    try {
      sessionStorage.setItem(this.PENDING_ACTION_KEY, JSON.stringify(action));
    } catch (e) {}
  },

  getPendingAction() {
    try {
      const raw = sessionStorage.getItem(this.PENDING_ACTION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  clearPendingAction() {
    sessionStorage.removeItem(this.PENDING_ACTION_KEY);
  },

  executePendingAction() {
    const action = this.getPendingAction();
    if (!action) return;
    this.clearPendingAction();

    setTimeout(() => {
      if (action.type === 'add_to_cart' && window.StoreApp) {
        const prod = window.DB.find('products', action.payload.productId);
        if (prod) {
          const vr = action.payload.variantId ? (prod.variants || []).find(v => v.id === action.payload.variantId) : null;
          window.StoreApp.addToCart(prod, vr, action.payload.qty || 1);
          window.StoreApp.openCartDrawer();
        }
      } else if (action.type === 'review' && window.StoreApp) {
        window.StoreApp.openReviewModal(action.payload.productId);
      } else if (action.type === 'account' && window.StoreApp) {
        window.StoreApp.showAccount();
      }
    }, 400);
  },

  promptLogin(pendingAction = null, message = 'يرجى تسجيل الدخول لمتابعة هذه العملية') {
    if (pendingAction) {
      this.setPendingAction(pendingAction);
    }
    this.openAuthModal('login', message);
  },

  requireAdmin() {
    if (!this.isAdmin()) {
      alert('عذراً، لا يمكنك دخول هذه الصفحة');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  openAuthModal(tab = 'login', noticeMessage = '') {
    const modal = document.getElementById('authModalOverlay');
    if (!modal) return;

    this.switchAuthTab(tab);
    
    const noticeEl = document.getElementById('authModalNotice');
    if (noticeEl) {
      if (noticeMessage) {
        noticeEl.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${noticeMessage}`;
        noticeEl.style.display = 'block';
      } else {
        noticeEl.style.display = 'none';
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeAuthModal() {
    const modal = document.getElementById('authModalOverlay');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
  },

  switchAuthTab(tab) {
    const loginForm = document.getElementById('authLoginForm');
    const registerForm = document.getElementById('authRegisterForm');
    const tabLogin = document.getElementById('authTabBtnLogin');
    const tabReg = document.getElementById('authTabBtnRegister');
    const modalTitle = document.getElementById('authModalTitle');

    if (tab === 'register') {
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabReg) tabReg.classList.add('active');
      if (modalTitle) modalTitle.textContent = 'إنشاء حساب جديد في متجر النخبة';
    } else {
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabReg) tabReg.classList.remove('active');
      if (modalTitle) modalTitle.textContent = 'تسجيل الدخول إلى حسابك';
    }
  },

  updateUI() {
    const user = this.getCurrentUser();
    const isAdmin = this.isAdmin();

    // 1. Admin dashboard button in navbar (ONLY VISIBLE TO STORE MANAGER)
    const adminNavBtn = document.getElementById('navAdminDashboardBtn');
    if (adminNavBtn) {
      adminNavBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }

    // 2. User account button / avatar in navbar
    const authActionBtn = document.getElementById('navAuthActionBtn');
    const authUserName = document.getElementById('navAuthUserName');
    if (authActionBtn) {
      if (user) {
        authActionBtn.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem;">
              ${user.name.charAt(0)}
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.82rem; font-weight:800; display:block; color:var(--text-main);">${user.name}</span>
              <span style="font-size:0.72rem; color:${isAdmin ? '#ea580c; font-weight:800;' : 'var(--text-muted);'}">
                ${isAdmin ? 'مدير المتجر' : 'عميل مميز'}
              </span>
            </div>
            <button onclick="event.stopPropagation(); Auth.logout();" title="تسجيل الخروج" style="background:none; border:none; color:#ef4444; font-size:0.9rem; padding:4px 6px; cursor:pointer;">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        `;
        authActionBtn.onclick = () => {
          if (window.StoreApp && typeof window.StoreApp.showAccount === 'function') {
            window.StoreApp.showAccount();
          }
        };
      } else {
        authActionBtn.innerHTML = `
          <button type="button" class="btn-outline" id="navLoginBtn" style="padding:6px 14px; font-size:0.85rem; border-radius:20px; font-weight:800; display:inline-flex; align-items:center; gap:6px; cursor:pointer;" onclick="event.preventDefault(); Auth.openAuthModal('login')">
            <i class="fa-solid fa-user"></i> تسجيل الدخول
          </button>
        `;
        authActionBtn.onclick = (e) => { e.preventDefault(); Auth.openAuthModal('login'); };
      }
    }

    // 3. Update customer portal greeting if active
    if (user && window.StoreApp) {
      const greetingEl = document.getElementById('accountUserGreeting');
      if (greetingEl) {
        greetingEl.textContent = `مرحباً بك مجدداً، ${user.name} 👋`;
      }
    }
  },

  showAlert(message, type = 'error') {
    const box = document.getElementById('authAlertBox');
    if (!box) return;
    box.style.display = 'block';
    box.style.background = type === 'success' ? '#f0fdf4' : type === 'info' ? '#eff6ff' : '#fef2f2';
    box.style.border = `1px solid ${type === 'success' ? '#bbf7d0' : type === 'info' ? '#bfdbfe' : '#fecaca'}`;
    box.style.color = type === 'success' ? '#166534' : type === 'info' ? '#1e40af' : '#991b1b';
    box.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${message}`;
  },

  hideAlert() {
    const box = document.getElementById('authAlertBox');
    if (box) box.style.display = 'none';
  },

  async handleLoginSubmit() {
    this.hideAlert();
    const emailInput = document.getElementById('authLoginEmail');
    const passInput = document.getElementById('authLoginPassword');
    const rememberInput = document.getElementById('authLoginRemember');
    const submitBtn = document.getElementById('authLoginSubmitBtn');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const remember = rememberInput ? rememberInput.checked : true;

    if (!email || !password) {
      this.showAlert('يرجى إدخال البريد الإلكتروني وكلمة المرور.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق...';
    }

    try {
      const res = await this.login(email, password, remember);
      if (res.success) {
        this.showAlert(`مرحباً بك، ${res.user.name}! تم تسجيل الدخول بنجاح.`, 'success');
        setTimeout(() => {
          this.closeAuthModal();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> تسجيل الدخول';
          }
          if (res.isAdmin) {
            window.location.href = 'admin.html';
          } else {
            this.executePendingAction();
          }
        }, 500);
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> تسجيل الدخول';
        }
        if (res.notFound) {
          this.showAlert(
            `${res.message} <a href="#" onclick="event.preventDefault(); Auth.switchAuthTab('register');" style="text-decoration:underline; font-weight:800; color:inherit; margin-right:6px;">اضغط هنا لإنشاء حساب الآن</a>`,
            'error'
          );
        } else {
          this.showAlert(res.message, 'error');
        }
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> تسجيل الدخول';
      }
      this.showAlert('حدث خطأ غير متوقع أثناء تسجيل الدخول: ' + err.message, 'error');
    }
  },

  async handleRegisterSubmit() {
    this.hideAlert();
    const nameInput = document.getElementById('authRegName');
    const emailInput = document.getElementById('authRegEmail');
    const phoneInput = document.getElementById('authRegPhone');
    const passInput = document.getElementById('authRegPassword');
    const submitBtn = document.getElementById('authRegSubmitBtn');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!name || !email || !password) {
      this.showAlert('يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور).', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
    }

    try {
      const res = await this.register({ name, email, phone, password });
      if (res.success) {
        this.showAlert(`تهانينا ${res.user.name}! تم إنشاء حسابك وتسجيل الدخول بنجاح.`, 'success');
        setTimeout(() => {
          this.closeAuthModal();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> إتمام إنشاء الحساب';
          }
          this.executePendingAction();
        }, 500);
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> إتمام إنشاء الحساب';
        }
        if (res.error === 'email_exists') {
          this.showAlert(
            `${res.message} <a href="#" onclick="event.preventDefault(); Auth.switchAuthTab('login');" style="text-decoration:underline; font-weight:800; color:inherit; margin-right:6px;">اضغط هنا لتسجيل الدخول</a>`,
            'error'
          );
        } else {
          this.showAlert(res.message, 'error');
        }
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> إتمام إنشاء الحساب';
      }
      this.showAlert('حدث خطأ أثناء إنشاء الحساب: ' + err.message, 'error');
    }
  }
};

// Auto-run UI sync on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.Auth.updateUI();
  if (!window.location.pathname.includes('admin.html') && !window.Auth.isLoggedIn()) {
    setTimeout(() => {
      window.Auth.openAuthModal('login', 'أهلاً بك في متجر النخبة! يرجى تسجيل الدخول أو إنشاء حساب جديد للبدء بالتسوق.');
    }, 400);
  }
});
