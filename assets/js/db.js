/**
 * Salla-like E-Commerce Database & Reactive State Layer
 * LocalStorage Persistence with Full Real-time Sync & Seed Data
 */

const DB_KEY = 'SALLA_ENTERPRISE_STORE_V1';

const DEFAULT_SEED_DATA = {
  settings: {
    storeName: "متجر النخبة السعودي",
    storeSlogan: "وجهتكم الأولى للمنتجات الفاخرة والأصالة السعودية",
    crNumber: "1010987654", // السجل التجاري
    vatNumber: "310123456700003", // الرقم الضريبي
    currency: "ر.س",
    vatRate: 0.15, // 15% VAT
    freeShippingThreshold: 350,
    supportPhone: "+966 50 123 4567",
    supportWhatsApp: "966501234567",
    supportEmail: "care@alnukhbah.sa",
    storeAddress: "الرياض، حي العليا، طريق الملك فهد، المملكة العربية السعودية",
    maintenanceMode: false,
    social: {
      instagram: "https://instagram.com",
      twitter: "https://x.com",
      tiktok: "https://tiktok.com",
      snapchat: "https://snapchat.com"
    }
  },

  theme: {
    primaryColor: "#0d5c46", // Salla Emerald
    primaryHover: "#094333",
    secondaryColor: "#c29b38", // Royal Gold
    accentColor: "#2563eb",
    bgColor: "#f8fafc",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    announcementBar: {
      enabled: true,
      text: "✨ عروض موسم الرياض: شحن مجاني لكافة الطلبات فوق 350 ر.س وكود خصم 10% إضافي (كود: SALLA10) 🚚",
      link: "#"
    },
    heroSlides: [
  {
    id: 1,
    title: "فخامة العطور الملكية ودهن العود المعتق",
    subtitle: "تشكيلة حصرية من أندر أدهان العود الطبيعية وعطور النيش الشرقية والفرنسية الفاخرة",
    buttonText: "تسوق العطور الملكية",
    buttonLink: "#productsSection",
    badge: "إصدارات نيش حصرية 2026",
    image: "assets/images/perfume_royal_noir.jpg"
  },
  {
    id: 2,
    title: "سحر المسك والعنبر وبخور المناسبات",
    subtitle: "باقات إهداء ملكية فاخرة ومباخر كريستالية ذكية لإضفاء أرقى نفحات الطيب على مناسباتكم",
    buttonText: "اكتشف الباقات الفاخرة",
    buttonLink: "#productsSection",
    badge: "توصيل سريع مجاني لكافة مناطق المملكة",
    image: "assets/images/perfume_gift_set.jpg"
  }
],
    sections: {
      showTrustBadges: true,
      showCategories: true,
      showFlashDeals: true,
      showBestSellers: true,
      showNewArrivals: true,
      showReviews: true,
      showBrands: true,
      showNewsletter: true
    },
    flashDeals: {
      enabled: true,
      title: "تخفيضات كبرى تنتهي قريباً",
      badge: "عروض الصاعقة الحصرية",
      showTimer: true,
      mode: "auto",
      productIds: []
    }
  },

  categories: [
  {
    id: "cat-niche-perfumes",
    name: "عطور نيش فاخرة",
    englishName: "Niche Perfumes",
    slug: "niche-perfumes",
    icon: "fa-crown",
    description: "عطور النيش الملكية المركزة بمكونات شرقية وعالمية نادرة وثبات يدوم لأيام",
    image: "assets/images/perfume_royal_noir.jpg"
  },
  {
    id: "cat-oud-bukhoor",
    name: "دهن العود وبخور ملكي",
    englishName: "Oud & Bukhoor",
    slug: "oud-bukhoor",
    icon: "fa-fire-burner",
    description: "أنقى أدهان العود الطبيعية المعتقة وكسر العود المروكي والكلمنتان دبل سوبر",
    image: "assets/images/perfume_bukhoor_moroki.jpg"
  },
  {
    id: "cat-musk-amber",
    name: "المسك والعنبر الملكي",
    englishName: "Musk & Amber",
    slug: "musk-amber",
    icon: "fa-gem",
    description: "أفخر أنواع مسك الطهارة والمسك الأبيض والبودري والعنبر الشمامي الفاخر",
    image: "assets/images/perfume_gold_musk.jpg"
  },
  {
    id: "cat-rose-hair",
    name: "عطور الورد ومعطرات الشعر",
    englishName: "Rose & Hair Mists",
    slug: "rose-hair-mists",
    icon: "fa-spray-can-sparkles",
    description: "دهن الورد الطائفي النخبوي ومعطرات الشعر الحريرية بخلاصة الزيوت المغذية",
    image: "assets/images/perfume_rose_taif.jpg"
  },
  {
    id: "cat-perfumes-bundles",
    name: "باقات وهدايا العطور الملكية",
    englishName: "Perfume Gift Sets",
    slug: "perfume-bundles",
    icon: "fa-gift",
    description: "صناديق ومجموعات إهداء فاخرة تجمع خيرة العطور والأدهان في بوكسات مخملية ملكية",
    image: "assets/images/perfume_gift_set.jpg"
  }
],

  products: [
  {
    id: "prod-1",
    name: "دهن عود ملكي معتق فاخر - إصدار خاص 50 مل",
    sku: "OUD-ROYAL-50",
    categoryId: "cat-oud-bukhoor",
    categoryName: "دهن العود وبخور ملكي",
    regularPrice: 480,
    salePrice: 349,
    costPrice: 160,
    stock: 18,
    alertThreshold: 5,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 32,
    badge: "الأكثر مبيعاً 🔥",
    image: "assets/images/product_oud.jpg",
    gallery: ["assets/images/product_oud.jpg", "assets/images/perfume_royal_noir.jpg"],
    description: "عطر دهن العود الملكي المستخلص من أشجار العود العتيقة والمعتق لأكثر من عشرين عاماً. يتميز بثبات فائق يمتد لأيام مع نوتات عنبرية دافئة ونفحات من دهن الورد الطائفي الفاخر.",
    specs: [
      { label: "الحجم", value: "50 مل أو 100 مل" },
      { label: "نوع التركيز", value: "Extrait de Parfum (ثبات 72 ساعة)" },
      { label: "المنشأ", value: "زيوت عود كمبودي وطائفي نقية" },
      { label: "الضمان", value: "ضمان ذهبي للاسترجاع الفوري" }
    ],
    variants: [
      { id: "v1-1", title: "حجم 50 مل (عبوة كريستال)", price: 349, regularPrice: 480, stock: 12, sku: "OUD-ROYAL-50" },
      { id: "v1-2", title: "حجم 100 مل (عبوة ملكية مزدوجة)", price: 599, regularPrice: 790, stock: 6, sku: "OUD-ROYAL-100" }
    ],
    status: "published"
  },
  {
    id: "prod-2",
    name: "عطر الطيب الملكي - نايت رويال إكستريت دي بارفان 100 مل",
    sku: "PERF-ROYAL-NOIR-100",
    categoryId: "cat-niche-perfumes",
    categoryName: "عطور نيش فاخرة",
    regularPrice: 790,
    salePrice: 580,
    costPrice: 240,
    stock: 24,
    alertThreshold: 6,
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    rating: 5.0,
    reviewsCount: 28,
    badge: "إصدار نيش ملكي 🔥",
    image: "assets/images/perfume_royal_noir.jpg",
    gallery: ["assets/images/perfume_royal_noir.jpg", "assets/images/product_oud.jpg"],
    description: "عطر نيش أسطوري يجمع فخامة العود الأسود المعتق مع زهور السوسن والجلود الإيطالية ولمسات العنبر الداكن في زجاجة كريستال سوداء مرصعة بالذهب 24 قيراط.",
    specs: [
      { label: "الحجم", value: "100 مل" },
      { label: "التركيز", value: "Pure Extrait de Parfum 35%" },
      { label: "النوتات العليا", value: "زعفران كشميري، هيل أسود" },
      { label: "قلب العطر", value: "عود ملكي، ورد جوري داكن، جلد فاخر" },
      { label: "قاعدة العطر", value: "عنبر خام، خشب الصندل، باتشولي" }
    ],
    variants: [
      { id: "v2-1", title: "عبوة 100 مل الفاخرة (غطاء التاج الذهبي)", price: 580, regularPrice: 790, stock: 24, sku: "PERF-ROYAL-NOIR-100" }
    ],
    status: "published"
  },
  {
    id: "prod-3",
    name: "عطر مكنار الذهب - عنبر وتوباكو وفانيلا مدغشقر 100 مل",
    sku: "PERF-GOLD-MUSK-100",
    categoryId: "cat-niche-perfumes",
    categoryName: "عطور نيش فاخرة",
    regularPrice: 650,
    salePrice: 490,
    costPrice: 210,
    stock: 19,
    alertThreshold: 5,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    rating: 4.9,
    reviewsCount: 21,
    badge: "الأكثر طلباً ⚡",
    image: "assets/images/perfume_gold_musk.jpg",
    gallery: ["assets/images/perfume_gold_musk.jpg", "assets/images/product_oud.jpg"],
    description: "سحر الذهب السائل في زجاجة محفورة بدقة ملكية. توليفة دافئة آسرة من التوباكو الملكي والعنبر البلوري وفانيلا بوربون مع لمسات عسلية دافئة.",
    specs: [
      { label: "الحجم", value: "100 مل" },
      { label: "التركيز", value: "Eau de Parfum Intense" },
      { label: "الافتتاحية", value: "توباكو معسل، قرفة سيلانية" },
      { label: "القلب", value: "عنبر بلوري، حبوب التونكا، كاكاو" },
      { label: "القاعدة", value: "فانيلا مدغشقر، أخشاب ثمينة" }
    ],
    variants: [
      { id: "v3-1", title: "حجم 100 مل (إصدار الذهب الملكي)", price: 490, regularPrice: 650, stock: 19, sku: "PERF-GOLD-MUSK-100" }
    ],
    status: "published"
  },
  {
    id: "prod-4",
    name: "عطر أورا دي روز - خلاصة الورد الطائفي وخشب الصندل 100 مل",
    sku: "PERF-ROSE-TAIF-100",
    categoryId: "cat-rose-hair",
    categoryName: "عطور الورد ومعطرات الشعر",
    regularPrice: 590,
    salePrice: 440,
    costPrice: 180,
    stock: 22,
    alertThreshold: 5,
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    rating: 5.0,
    reviewsCount: 19,
    badge: "رائحة ناعمة فواحة ✨",
    image: "assets/images/perfume_rose_taif.jpg",
    gallery: ["assets/images/perfume_rose_taif.jpg", "assets/images/product_oud.jpg"],
    description: "تحفة عطرية ناعمة راقية مستوحاة من بساتين الورد الطائفي في بواكير الصباح ممتزجة مع المسك الأبيض وخشب الصندل السيلاني النقي.",
    specs: [
      { label: "الحجم", value: "100 مل" },
      { label: "التركيز", value: "Eau de Parfum" },
      { label: "المكونات", value: "ورد طائفي أصيل، مسك أبيض، صندل، بيوني" }
    ],
    variants: [
      { id: "v4-1", title: "حجم 100 مل (عبوة بلورية فاخرة)", price: 440, regularPrice: 590, stock: 22, sku: "PERF-ROSE-TAIF-100" }
    ],
    status: "published"
  },
  {
    id: "prod-5",
    name: "عطر ليدر ليذر نيش - جلود فاخرة وزعفران إسباني 100 مل",
    sku: "PERF-LEATHER-100",
    categoryId: "cat-niche-perfumes",
    categoryName: "عطور نيش فاخرة",
    regularPrice: 720,
    salePrice: 520,
    costPrice: 220,
    stock: 15,
    alertThreshold: 4,
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    rating: 4.8,
    reviewsCount: 16,
    badge: "فخامة استثنائية 💎",
    image: "assets/images/perfume_royal_noir.jpg",
    gallery: ["assets/images/perfume_royal_noir.jpg"],
    description: "عطر الهيبة والحضور القوي الذي يعكس فخامة الخيول العربية والجلود المعتقة مع نفحات التوت البري والزعفران الإسباني النادر.",
    specs: [
      { label: "الحجم", value: "100 مل" },
      { label: "التركيز", value: "Extrait de Parfum" }
    ],
    variants: [
      { id: "v5-1", title: "حجم 100 مل", price: 520, regularPrice: 720, stock: 15, sku: "PERF-LEATHER-100" }
    ],
    status: "published"
  },
  {
    id: "prod-6",
    name: "عطر سمو الباشا - برغموت ملكي وهيل أندونيسي وخشب الأرز 100 مل",
    sku: "PERF-PASHA-100",
    categoryId: "cat-niche-perfumes",
    categoryName: "عطور نيش فاخرة",
    regularPrice: 620,
    salePrice: 460,
    costPrice: 190,
    stock: 17,
    alertThreshold: 5,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    rating: 4.9,
    reviewsCount: 14,
    badge: "عطر رجالي راقي 👑",
    image: "assets/images/perfume_gold_musk.jpg",
    gallery: ["assets/images/perfume_gold_musk.jpg"],
    description: "توليفة منعشة شرقية تجمع حمضيات كالابريا مع الهيل الأسود وأخشاب الأرز وخشب الغاياك لإطلالة رسمية لا تُنسى.",
    specs: [{ label: "الحجم", value: "100 مل" }],
    variants: [{ id: "v6-1", title: "حجم 100 مل", price: 460, regularPrice: 620, stock: 17, sku: "PERF-PASHA-100" }],
    status: "published"
  },
  {
    id: "prod-7",
    name: "عود مروكي أصيل دبل سوبر ملكي - أوقية فاخرة (30 جرام)",
    sku: "OUD-MAROKI-30G",
    categoryId: "cat-oud-bukhoor",
    categoryName: "دهن العود وبخور ملكي",
    regularPrice: 520,
    salePrice: 380,
    costPrice: 160,
    stock: 28,
    alertThreshold: 7,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 45,
    badge: "عود طبيعي معتمد 🌿",
    image: "assets/images/perfume_bukhoor_moroki.jpg",
    gallery: ["assets/images/perfume_bukhoor_moroki.jpg"],
    description: "كسر عود مروكي طبيعي محسن فاخر دبل سوبر، مشبع بالدهن ويزبد على الجمر بكثافة ونكهة سويتية باردة تملأ أرجاء المكان بالفخامة.",
    specs: [
      { label: "الوزن", value: "أوقية (30 جرام)" },
      { label: "الدرجة", value: "دبل سوبر ملكي (Double Super)" },
      { label: "الاستخدام", value: "المناسبات والقصور والضيافة الفاخرة" }
    ],
    variants: [
      { id: "v7-1", title: "أوقية فاخرة (30 جرام)", price: 380, regularPrice: 520, stock: 20, sku: "OUD-MAROKI-30G" },
      { id: "v7-2", title: "أوقيتين (60 جرام) مع علبة مخملية", price: 690, regularPrice: 980, stock: 8, sku: "OUD-MAROKI-60G" }
    ],
    status: "published"
  },
  {
    id: "prod-8",
    name: "دهن عود كلمنتان غابات مالينو بيور معتق - ربع تولة",
    sku: "OUD-KALIMANTAN-QT",
    categoryId: "cat-oud-bukhoor",
    categoryName: "دهن العود وبخور ملكي",
    regularPrice: 600,
    salePrice: 420,
    costPrice: 180,
    stock: 14,
    alertThreshold: 4,
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 26,
    badge: "نكهة سويتية بخورية 🪵",
    image: "assets/images/product_oud.jpg",
    gallery: ["assets/images/product_oud.jpg"],
    description: "دهن عود كلمنتان طبيعي بيور 100% مستخرج من غابات مالينو، معتق لمدة تتجاوز 15 سنة بنكهة خشبية بخورية سويتية ذات ثبات استثنائي.",
    specs: [{ label: "الحجم", value: "ربع تولة (3 مل)" }],
    variants: [{ id: "v8-1", title: "ربع تولة (3 مل)", price: 420, regularPrice: 600, stock: 14, sku: "OUD-KALIMANTAN-QT" }],
    status: "published"
  },
  {
    id: "prod-9",
    name: "بخور رقائق لاوسي طبيعي خاص بالمناسبات - 50 جرام",
    sku: "BUKHOOR-LAOS-50G",
    categoryId: "cat-oud-bukhoor",
    categoryName: "دهن العود وبخور ملكي",
    regularPrice: 440,
    salePrice: 310,
    costPrice: 130,
    stock: 20,
    alertThreshold: 5,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    rating: 4.8,
    reviewsCount: 18,
    badge: "فوحان للمجالس 💨",
    image: "assets/images/perfume_bukhoor_moroki.jpg",
    gallery: ["assets/images/perfume_bukhoor_moroki.jpg"],
    description: "رقائق عود لاوسي طبيعية سماكة مثالية للاستخدام المباشر على الفحم أو المباخر الذكية بنفحات ترابية عطرية هادئة تدوم طويلاً.",
    specs: [{ label: "الوزن", value: "50 جرام" }],
    variants: [{ id: "v9-1", title: "علبة 50 جرام", price: 310, regularPrice: 440, stock: 20, sku: "BUKHOOR-LAOS-50G" }],
    status: "published"
  },
  {
    id: "prod-10",
    name: "مبخرة النخبة الملكية الكريستالية الذكية شحن متنقلة",
    sku: "CENSER-ROYAL-SMART",
    categoryId: "cat-oud-bukhoor",
    categoryName: "دهن العود وبخور ملكي",
    regularPrice: 260,
    salePrice: 185,
    costPrice: 75,
    stock: 35,
    alertThreshold: 8,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    rating: 4.9,
    reviewsCount: 52,
    badge: "شحن USB سريع 🔋",
    image: "assets/images/product_oud.jpg",
    gallery: ["assets/images/product_oud.jpg"],
    description: "مبخرة إلكترونية فاخرة بتصميم كريستالي مطلي بالذهب، تعمل ببطارية ليثيوم قابلة للشحن بتقنية التسخين السريع للسيارة والمكتب والمنزل.",
    specs: [{ label: "نوع الشحن", value: "Type-C سريع" }, { label: "اللون", value: "ذهبي ملكي / أسود ملكي" }],
    variants: [
      { id: "v10-1", title: "اللون الذهبي الملكي", price: 185, regularPrice: 260, stock: 20, sku: "CENSER-SMART-GOLD" },
      { id: "v10-2", title: "اللون الأسود الملكي المطفي", price: 185, regularPrice: 260, stock: 15, sku: "CENSER-SMART-BLACK" }
    ],
    status: "published"
  },
  {
    id: "prod-11",
    name: "دهن عود تراد الحطب المعتق الذهبي - ربع تولة",
    sku: "OUD-TRAD-QT",
    categoryId: "cat-oud-bukhoor",
    categoryName: "دهن العود وبخور ملكي",
    regularPrice: 490,
    salePrice: 360,
    costPrice: 150,
    stock: 16,
    alertThreshold: 4,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    rating: 4.9,
    reviewsCount: 22,
    badge: "فوحان وثبات 48 ساعة ⏳",
    image: "assets/images/product_oud.jpg",
    gallery: ["assets/images/product_oud.jpg"],
    description: "دهن عود تراد مطبوخ على الحطب بالطريقة التقليدية العريقة، ذو نكهة زهرية بخورية دافئة وثبات استثنائي على الثياب والجلد.",
    specs: [{ label: "الحجم", value: "ربع تولة (3 مل)" }],
    variants: [{ id: "v11-1", title: "ربع تولة (3 مل)", price: 360, regularPrice: 490, stock: 16, sku: "OUD-TRAD-QT" }],
    status: "published"
  },
  {
    id: "prod-12",
    name: "مسك الختام الملكي - توليفة المسك النقي مع أزهار السوسن والعنبر",
    sku: "MUSK-KHITAM-QT",
    categoryId: "cat-musk-amber",
    categoryName: "المسك والعنبر الملكي",
    regularPrice: 280,
    salePrice: 195,
    costPrice: 70,
    stock: 40,
    alertThreshold: 8,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 38,
    badge: "مسك أصيل فاخر 🌸",
    image: "assets/images/perfume_gold_musk.jpg",
    gallery: ["assets/images/perfume_gold_musk.jpg"],
    description: "توليفة مسك الختام الشهيرة بنفحات زهرية وعنبرية منعشة، تمنح إحساساً ملكياً بالنظافة والانتعاش يدوم طوال اليوم.",
    specs: [{ label: "الحجم", value: "ربع تولة (3 مل)" }],
    variants: [{ id: "v12-1", title: "ربع تولة فاخرة في مرواد كريستال", price: 195, regularPrice: 280, stock: 40, sku: "MUSK-KHITAM-QT" }],
    status: "published"
  },
  {
    id: "prod-13",
    name: "عطر مسك البودرة الحريري - إحساس النظافة الفاخرة 75 مل",
    sku: "PERF-POWDER-MUSK-75",
    categoryId: "cat-musk-amber",
    categoryName: "المسك والعنبر الملكي",
    regularPrice: 370,
    salePrice: 260,
    costPrice: 95,
    stock: 25,
    alertThreshold: 6,
    isFeatured: false,
    isBestSeller: true,
    isNew: true,
    rating: 4.9,
    reviewsCount: 29,
    badge: "انتعاش مخملي 🤍",
    image: "assets/images/perfume_rose_taif.jpg",
    gallery: ["assets/images/perfume_rose_taif.jpg"],
    description: "عطر البودرة الحريرية والمسك الأبيض الخالص مع زهرة القطن والياسمين، يمنحك شعوراً فورياً بالنعومة والهدوء بعد الاستحمام.",
    specs: [{ label: "الحجم", value: "75 مل" }],
    variants: [{ id: "v13-1", title: "عبوة 75 مل زجاج أبيض غير لامع", price: 260, regularPrice: 370, stock: 25, sku: "PERF-POWDER-MUSK-75" }],
    status: "published"
  },
  {
    id: "prod-14",
    name: "عنبر شمامي ملكي قديم معتق - ربع تولة نادرة",
    sku: "AMBER-SHAMAMI-QT",
    categoryId: "cat-musk-amber",
    categoryName: "المسك والعنبر الملكي",
    regularPrice: 550,
    salePrice: 390,
    costPrice: 160,
    stock: 11,
    alertThreshold: 3,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    rating: 5.0,
    reviewsCount: 15,
    badge: "عنبر أصيل نادر 🍯",
    image: "assets/images/perfume_gold_musk.jpg",
    gallery: ["assets/images/perfume_gold_musk.jpg"],
    description: "عنبر شمامي حوت طبيعي معتق لسنوات بنكهة عنبرية بلسمية دافئة، يستخدم لتعطير الشماغ والملابس الرسمية والمناسبات الخاصة.",
    specs: [{ label: "الحجم", value: "ربع تولة (3 مل)" }],
    variants: [{ id: "v14-1", title: "ربع تولة في قارورة كريستال محفورة", price: 390, regularPrice: 550, stock: 11, sku: "AMBER-SHAMAMI-QT" }],
    status: "published"
  },
  {
    id: "prod-15",
    name: "مسك الرمان المنعش مع التوت البري والمسك الصافي 100 مل",
    sku: "PERF-POMEGRANATE-100",
    categoryId: "cat-musk-amber",
    categoryName: "المسك والعنبر الملكي",
    regularPrice: 320,
    salePrice: 230,
    costPrice: 85,
    stock: 32,
    alertThreshold: 7,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    rating: 4.8,
    reviewsCount: 23,
    badge: "عطر رمان صيفي منعش 🍇",
    image: "assets/images/perfume_rose_taif.jpg",
    gallery: ["assets/images/perfume_rose_taif.jpg"],
    description: "انفجار عطري منعش من حبيبات الرمان الأحمر والتوت البري مع قاعدة نقية من المسك الصافي، مثالي للاستخدام اليومي والنهاري.",
    specs: [{ label: "الحجم", value: "100 مل" }],
    variants: [{ id: "v15-1", title: "حجم 100 مل", price: 230, regularPrice: 320, stock: 32, sku: "PERF-POMEGRANATE-100" }],
    status: "published"
  },
  {
    id: "prod-16",
    name: "دهن ورد طائفي نمرة 1 قطفة أولى فاخر - ربع تولة",
    sku: "WARD-TAIFI-QT",
    categoryId: "cat-rose-hair",
    categoryName: "عطور الورد ومعطرات الشعر",
    regularPrice: 650,
    salePrice: 450,
    costPrice: 200,
    stock: 12,
    alertThreshold: 3,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 34,
    badge: "ورد عرائسي فاخر 🌹",
    image: "assets/images/perfume_rose_taif.jpg",
    gallery: ["assets/images/perfume_rose_taif.jpg"],
    description: "دهن الورد الطائفي النخبوي الأول المستخرج من أخصب مزارع الهدا والشفا بالطائف، مقطوف فجراً لضمان أعلى تركيز عطري طبيعي وأصيل.",
    specs: [{ label: "الحجم", value: "ربع تولة (3 مل)" }],
    variants: [{ id: "v16-1", title: "ربع تولة نخب أول", price: 450, regularPrice: 650, stock: 12, sku: "WARD-TAIFI-QT" }],
    status: "published"
  },
  {
    id: "prod-17",
    name: "معطر الشعر الملكي الملكي بفيتامين E وخلاصة العود 50 مل",
    sku: "HAIR-MIST-OUD-50",
    categoryId: "cat-rose-hair",
    categoryName: "عطور الورد ومعطرات الشعر",
    regularPrice: 270,
    salePrice: 195,
    costPrice: 70,
    stock: 26,
    alertThreshold: 5,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    rating: 4.9,
    reviewsCount: 20,
    badge: "يغذي ويمنح لمعاناً 💫",
    image: "assets/images/perfume_royal_noir.jpg",
    gallery: ["assets/images/perfume_royal_noir.jpg"],
    description: "معطر شعر فاخر وخفيف خالٍ من الكحول وغني بفيتامين E وزيت الأرجان، يعطر الشعر بنفحات العود الملكي دون أن يسبب جفافاً أو تلفاً.",
    specs: [{ label: "الحجم", value: "50 مل" }],
    variants: [{ id: "v17-1", title: "عبوة 50 مل بخاخ رذاذ ناعم", price: 195, regularPrice: 270, stock: 26, sku: "HAIR-MIST-OUD-50" }],
    status: "published"
  },
  {
    id: "prod-18",
    name: "معطر شعر وجسم سيلك روز بلمعان ذهبي جذاب 50 مل",
    sku: "BODY-MIST-SILK-50",
    categoryId: "cat-rose-hair",
    categoryName: "عطور الورد ومعطرات الشعر",
    regularPrice: 290,
    salePrice: 210,
    costPrice: 75,
    stock: 22,
    alertThreshold: 5,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    rating: 4.8,
    reviewsCount: 17,
    badge: "لمعان وبريق ناعم ✨",
    image: "assets/images/perfume_rose_taif.jpg",
    gallery: ["assets/images/perfume_rose_taif.jpg"],
    description: "رذاذ عطري ناعم للجسم والشعر برائحة الورد الناعم والمسك الأبيض مع جزيئات بريق ذهبية ناعمة تمنح البشرة والشعر إشراقة ساحرة.",
    specs: [{ label: "الحجم", value: "50 مل" }],
    variants: [{ id: "v18-1", title: "عبوة 50 مل", price: 210, regularPrice: 290, stock: 22, sku: "BODY-MIST-SILK-50" }],
    status: "published"
  },
  {
    id: "prod-19",
    name: "باقة العطور الملكية الفاخرة (صندوق الطيب الملكي الثلاثي VIP)",
    sku: "BUNDLE-ROYAL-VIP",
    categoryId: "cat-perfumes-bundles",
    categoryName: "باقات وهدايا العطور الملكية",
    regularPrice: 1100,
    salePrice: 780,
    costPrice: 350,
    stock: 15,
    alertThreshold: 3,
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    isBundle: true,
    rating: 5.0,
    reviewsCount: 42,
    badge: "صندوق VIP خشبي فاخر 🎁",
    image: "assets/images/perfume_gift_set.jpg",
    gallery: ["assets/images/perfume_gift_set.jpg", "assets/images/perfume_royal_noir.jpg", "assets/images/perfume_gold_musk.jpg"],
    description: "صندوق إهداء خشبي ملكي مطلي باللكر الأخضر الزمردي ومبطن بالمخمل الأسود، يضم 3 عطور نيش أيقونية (عطر الطيب الملكي + عطر مكنار الذهب + عطر أورا دي روز).",
    specs: [
      { label: "المحتويات", value: "3 عطور نيش فاخرة بحجم 100 مل لكل عطر" },
      { label: "التغليف", value: "صندوق خشبي ملكي فاخر مع قفل ذهبي وبطاقة إهداء مذهبة" }
    ],
    variants: [
      { id: "v19-1", title: "الصندوق الملكي الفاخر (3 عطور نيش)", price: 780, regularPrice: 1100, stock: 15, sku: "BUNDLE-ROYAL-VIP" }
    ],
    status: "published"
  },
  {
    id: "prod-20",
    name: "باقة رويال عود & بخور (عود مروكي دبل سوبر + دهن كلمنتان + مبخرة ذكية)",
    sku: "BUNDLE-OUD-EXPERIENCE",
    categoryId: "cat-perfumes-bundles",
    categoryName: "باقات وهدايا العطور الملكية",
    regularPrice: 980,
    salePrice: 699,
    costPrice: 310,
    stock: 20,
    alertThreshold: 4,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    isBundle: true,
    rating: 5.0,
    reviewsCount: 37,
    badge: "طقم الضيافة الكامل 👑",
    image: "assets/images/perfume_bukhoor_moroki.jpg",
    gallery: ["assets/images/perfume_bukhoor_moroki.jpg", "assets/images/product_oud.jpg"],
    description: "الباقة المتكاملة لعشاق العود الأصيل: أوقية عود مروكي دبل سوبر، ربع تولة دهن عود كلمنتان بيور، والمبخرة الكريستالية الذكية في علبة هدايا ملكية فاخرة.",
    specs: [
      { label: "المحتويات", value: "عود مروكي 30 جرام + دهن كلمنتان ربع تولة + مبخرة ذكية قابلة للشحن" }
    ],
    variants: [
      { id: "v20-1", title: "طقم الضيافة المتكامل في بوكس هدايا فاخر", price: 699, regularPrice: 980, stock: 20, sku: "BUNDLE-OUD-EXPERIENCE" }
    ],
    status: "published"
  }
],

  coupons: [
    {
      id: "c-1",
      code: "SALLA10",
      type: "percent",
      value: 10,
      minOrder: 100,
      maxUses: 500,
      usedCount: 78,
      expiryDate: "2027-12-31",
      isActive: true,
      description: "خصم 10% للعملاء الجدد والمميزين"
    },
    {
      id: "c-2",
      code: "RAMADAN",
      type: "percent",
      value: 15,
      minOrder: 250,
      maxUses: 200,
      usedCount: 34,
      expiryDate: "2027-04-30",
      isActive: true,
      description: "خصم 15% لموسم العطاء"
    },
    {
      id: "c-3",
      code: "VIP50",
      type: "fixed",
      value: 50,
      minOrder: 300,
      maxUses: 100,
      usedCount: 15,
      expiryDate: "2027-08-31",
      isActive: true,
      description: "خصم 50 ر.س للطلبات الكبيرة"
    }
  ],

  shipping_methods: [
    {
      id: "ship-smsa",
      name: "سمسا إكسبريس (SMSA Express)",
      carrier: "SMSA",
      cost: 28,
      estimatedDays: "1 - 2 يوم عمل",
      isDefault: true,
      isActive: true,
      notes: "توصيل سريع وموثوق إلى باب البيت في جميع مدن وقرى المملكة"
    },
    {
      id: "ship-aramex",
      name: "أرامكس الشحن المباشر (Aramex)",
      carrier: "Aramex",
      cost: 24,
      estimatedDays: "2 - 3 أيام عمل",
      isDefault: false,
      isActive: true,
      notes: "شحن سريع وتتبع متواصل للشحنة"
    },
    {
      id: "ship-express",
      name: "مندوب توصيل فوري (نفس اليوم)",
      carrier: "مندوب خاص",
      cost: 35,
      estimatedDays: "خلال 4 ساعات (الرياض وجدة)",
      isDefault: false,
      isActive: true,
      notes: "للطلبات المستعجلة قبل الساعة 6 مساءً"
    }
  ],

  payment_methods: [
    {
      id: "pay-mada",
      name: "مدى (Mada)",
      type: "debit_card",
      icon: "fa-credit-card",
      fee: 0,
      isActive: true,
      badge: "الأكثر استخداماً في السعودية"
    },
    {
      id: "pay-apple",
      name: "Apple Pay",
      type: "apple_pay",
      icon: "fa-apple-pay",
      fee: 0,
      isActive: true,
      badge: "دفع سريع بلمسة واحدة"
    },
    {
      id: "pay-card",
      name: "بطاقة ائتمانية (Visa / MasterCard)",
      type: "credit_card",
      icon: "fa-brands fa-cc-visa",
      fee: 0,
      isActive: true,
      badge: "آمن ومشفر"
    },
    {
      id: "pay-tamara",
      name: "تمارا (قسّمها على 4 دفعات)",
      type: "installments",
      icon: "fa-calendar-check",
      fee: 0,
      isActive: true,
      badge: "بدون فوائد وبدون رسوم خفية"
    },
    {
      id: "pay-cod",
      name: "الدفع عند الاستلام (COD)",
      type: "cash_on_delivery",
      icon: "fa-money-bill-wave",
      fee: 15,
      isActive: true,
      badge: "رسوم إضافية 15 ر.س"
    }
  ],

  orders: [
  {
    id: "ord-1001",
    orderNumber: "ORD-98421",
    date: "2026-10-18T16:30:00Z",
    customer: {
      name: "عبدالله بن فهد الشمري",
      phone: "0501234567",
      email: "abdullah.sh@gmail.com",
      city: "الرياض",
      district: "حي النرجس",
      address: "شارع عثمان بن عفان، فيلا 24"
    },
    items: [
      {
        productId: "prod-1",
        variantTitle: "حجم 50 مل (عبوة كريستال)",
        name: "دهن عود ملكي معتق فاخر - إصدار خاص 50 مل",
        price: 349,
        quantity: 1,
        image: "assets/images/product_oud.jpg"
      },
      {
        productId: "prod-3",
        variantTitle: "حجم 100 مل (إصدار الذهب الملكي)",
        name: "عطر مكنار الذهب - عنبر وتوباكو وفانيلا مدغشقر 100 مل",
        price: 490,
        quantity: 1,
        image: "assets/images/perfume_gold_musk.jpg"
      }
    ],
    subtotal: 839,
    discount: 83.9,
    shippingCost: 0,
    vatAmount: 98.49,
    total: 755.10,
    couponCode: "SALLA10",
    orderStatus: "قيد التجهيز",
    paymentStatus: "مدفوع",
    shippingStatus: "قيد التجهيز",
    paymentMethod: "مدى (Mada)",
    shippingMethod: "سمسا إكسبريس (SMSA Express)",
    trackingNumber: "SMSA-894719321",
    notes: "العميل طلب تغليف هدية فاخر مجاني مع بطاقة تهنئة بالخط الذهبي.",
    stockDeducted: true,
    stockDeductedAt: "2026-10-18T16:30:00Z",
    stockRestored: false,
    returns: []
  },
  {
    id: "ord-1002",
    orderNumber: "ORD-98420",
    date: "2026-10-17T11:15:00Z",
    customer: {
      name: "سارة بنت خالد العتيبي",
      phone: "0559876543",
      email: "sara.otb@outlook.com",
      city: "جدة",
      district: "حي الشاطئ",
      address: "طريق الكورنيش، برج السحاب، شقة 1402"
    },
    items: [
      {
        productId: "prod-2",
        variantId: "v2-1",
        variantTitle: "عبوة 100 مل الفاخرة (غطاء التاج الذهبي)",
        name: "عطر الطيب الملكي - نايت رويال إكستريت دي بارفان 100 مل",
        price: 580,
        quantity: 1,
        image: "assets/images/perfume_royal_noir.jpg"
      }
    ],
    subtotal: 580,
    discount: 0,
    shippingCost: 0,
    vatAmount: 75.65,
    total: 580,
    couponCode: null,
    orderStatus: "تم الشحن",
    paymentStatus: "مدفوع",
    shippingStatus: "تم الشحن",
    paymentMethod: "Apple Pay",
    shippingMethod: "أرامكس الشحن المباشر (Aramex)",
    trackingNumber: "ARMX-773821092",
    notes: "تم تسليم الشحنة لمندوب أرامكس بنجاح.",
    stockDeducted: true,
    stockDeductedAt: "2026-10-17T11:15:00Z",
    stockRestored: false,
    returns: []
  },
  {
    id: "ord-1003",
    orderNumber: "ORD-98419",
    date: "2026-10-16T20:45:00Z",
    customer: {
      name: "محمد بن سلطان القحطاني",
      phone: "0543322110",
      email: "m.qahtani@saudicorp.com",
      city: "الدمام",
      district: "حي المزروعية",
      address: "شارع الأمير نايف، عمارة 8"
    },
    items: [
      {
        productId: "prod-10",
        variantId: "v10-1",
        variantTitle: "اللون الذهبي الملكي",
        name: "مبخرة النخبة الملكية الكريستالية الذكية شحن متنقلة",
        price: 185,
        quantity: 2,
        image: "assets/images/product_oud.jpg"
      }
    ],
    subtotal: 370,
    discount: 0,
    shippingCost: 0,
    vatAmount: 48.26,
    total: 370,
    couponCode: null,
    orderStatus: "مكتمل",
    paymentStatus: "مدفوع",
    shippingStatus: "تم التسليم",
    paymentMethod: "مدى (Mada)",
    shippingMethod: "سمسا إكسبريس (SMSA Express)",
    trackingNumber: "SMSA-110948322",
    notes: "تم استلام الطلب وتقييم المنتج بخمس نجوم.",
    stockDeducted: true,
    stockDeductedAt: "2026-10-16T20:45:00Z",
    stockRestored: false,
    returns: []
  },
  {
    id: "ord-1004",
    orderNumber: "ORD-98418",
    date: "2026-10-15T14:20:00Z",
    customer: {
      name: "ريم بنت عبدالعزيز الدوسري",
      phone: "0564455667",
      email: "reem.d@gmail.com",
      city: "مكة المكرمة",
      district: "حي العوالي",
      address: "شارع إبراهيم الجفالي، فيلا 12"
    },
    items: [
      {
        productId: "prod-4",
        variantId: "v4-1",
        variantTitle: "حجم 100 مل (عبوة بلورية فاخرة)",
        name: "عطر أورا دي روز - خلاصة الورد الطائفي وخشب الصندل 100 مل",
        price: 440,
        quantity: 1,
        image: "assets/images/perfume_rose_taif.jpg"
      }
    ],
    subtotal: 440,
    discount: 44.0,
    shippingCost: 0,
    vatAmount: 51.65,
    total: 396.00,
    couponCode: "SALLA10",
    orderStatus: "مكتمل",
    paymentStatus: "مدفوع",
    shippingStatus: "تم التسليم",
    paymentMethod: "بطاقة ائتمانية (Visa / MasterCard)",
    shippingMethod: "سمسا إكسبريس (SMSA Express)",
    trackingNumber: "SMSA-559283711",
    notes: "اكتمل الطلب وتم إصدار الفاتورة الضريبية.",
    stockDeducted: true,
    stockDeductedAt: "2026-10-15T14:20:00Z",
    stockRestored: false,
    returns: []
  },
  {
    id: "ord-1005",
    orderNumber: "ORD-98425",
    date: new Date().toISOString(),
    customer: {
      name: "سلطان بن فهد المطيري",
      phone: "0509988776",
      email: "sultan.m@gmail.com",
      city: "الرياض",
      district: "حي الملقا",
      address: "طريق أنس بن مالك، فيلا 18"
    },
    items: [
      {
        productId: "prod-7",
        variantId: "v7-1",
        variantTitle: "أوقية فاخرة (30 جرام)",
        name: "عود مروكي أصيل دبل سوبر ملكي - أوقية فاخرة (30 جرام)",
        price: 380,
        quantity: 1,
        isReturnable: true,
        returnDays: 14,
        isBundle: false,
        image: "assets/images/perfume_bukhoor_moroki.jpg"
      },
      {
        productId: "prod-7",
        variantId: "v7-2",
        variantTitle: "أوقيتين (60 جرام) مع علبة مخملية",
        name: "عود مروكي أصيل دبل سوبر ملكي - أوقية فاخرة (30 جرام)",
        price: 690,
        quantity: 1,
        isReturnable: true,
        returnDays: 14,
        isBundle: false,
        image: "assets/images/perfume_bukhoor_moroki.jpg"
      },
      {
        productId: "prod-19",
        variantId: "v19-1",
        variantTitle: "الصندوق الملكي الفاخر (3 عطور نيش)",
        name: "باقة العطور الملكية الفاخرة (صندوق الطيب الملكي الثلاثي VIP)",
        price: 780,
        quantity: 1,
        isReturnable: true,
        returnDays: 14,
        isBundle: true,
        image: "assets/images/perfume_gift_set.jpg"
      },
      {
        productId: "prod-14",
        variantId: "v14-1",
        variantTitle: "ربع تولة في قارورة كريستال محفورة",
        name: "عنبر شمامي ملكي قديم معتق - ربع تولة نادرة",
        price: 390,
        quantity: 1,
        isReturnable: false,
        returnDays: 0,
        isBundle: false,
        image: "assets/images/perfume_gold_musk.jpg"
      }
    ],
    subtotal: 2240,
    discount: 0,
    shippingCost: 0,
    vatAmount: 292.17,
    total: 2240,
    couponCode: null,
    orderStatus: "مكتمل",
    paymentStatus: "مدفوع",
    shippingStatus: "تم التسليم",
    paymentMethod: "مدى (Mada)",
    shippingMethod: "سمسا إكسبريس (SMSA Express)",
    trackingNumber: "SMSA-773910482",
    notes: "طلب تجربة الاسترجاع الجزئي والكلي للمنتجات والباقات الملكية.",
    stockDeducted: true,
    stockDeductedAt: "2026-10-20T10:30:00Z",
    stockRestored: false,
    returns: []
  },
  {
    id: "ord-1006",
    orderNumber: "ORD-98426",
    date: "2026-10-21T09:00:00Z",
    customer: {
      name: "فيصل بن سعد الدوسري",
      phone: "0531122334",
      email: "faisal.d@gmail.com",
      city: "الخبر",
      district: "حي الحزام الذهبي",
      address: "شارع اليرموك، فيلا 9"
    },
    items: [
      {
        productId: "prod-12",
        variantId: "v12-1",
        variantTitle: "ربع تولة فاخرة في مرواد كريستال",
        name: "مسك الختام الملكي - توليفة المسك النقي مع أزهار السوسن والعنبر",
        price: 195,
        quantity: 1,
        image: "assets/images/perfume_gold_musk.jpg"
      }
    ],
    subtotal: 195,
    discount: 0,
    shippingCost: 28,
    vatAmount: 29.09,
    total: 223,
    couponCode: null,
    orderStatus: "مكتمل",
    paymentStatus: "مدفوع",
    shippingStatus: "تم التسليم",
    paymentMethod: "الدفع عند الاستلام (COD)",
    shippingMethod: "سمسا إكسبريس (SMSA Express)",
    trackingNumber: "SMSA-661829031",
    notes: "تم تحصيل المبلغ عند الاستلام بنجاح وتأكيد المحاسبة المالية.",
    stockDeducted: true,
    stockDeductedAt: "2026-10-21T09:00:00Z",
    stockRestored: false,
    returns: []
  }
],

  customers: [
    {
      id: "cust-1",
      name: "عبدالله بن فهد الشمري",
      phone: "0501234567",
      email: "abdullah.sh@gmail.com",
      city: "الرياض",
      totalOrders: 3,
      totalSpent: 1240,
      registeredAt: "2026-08-10"
    },
    {
      id: "cust-2",
      name: "سارة بنت خالد العتيبي",
      phone: "0559876543",
      email: "sara.otb@outlook.com",
      city: "جدة",
      totalOrders: 2,
      totalSpent: 980,
      registeredAt: "2026-09-02"
    },
    {
      id: "cust-3",
      name: "محمد بن سلطان القحطاني",
      phone: "0543322110",
      email: "m.qahtani@saudicorp.com",
      city: "الدمام",
      totalOrders: 1,
      totalSpent: 266,
      registeredAt: "2026-10-01"
    },
    {
      id: "cust-4",
      name: "ريم بنت عبدالعزيز الدوسري",
      phone: "0564455667",
      email: "reem.d@gmail.com",
      city: "مكة المكرمة",
      totalOrders: 4,
      totalSpent: 1680,
      registeredAt: "2026-07-15"
    }
  ],

  inventory_movements: [
  {
    id: "inv-1",
    date: "2026-10-19T10:00:00Z",
    productName: "دهن عود ملكي معتق فاخر - إصدار خاص 50 مل",
    type: "order",
    quantity: -1,
    remaining: 18,
    notes: "خصم آلي للطلب #ORD-98421"
  },
  {
    id: "inv-2",
    date: "2026-10-18T14:30:00Z",
    productName: "عطر الطيب الملكي - نايت رويال إكستريت دي بارفان 100 مل",
    type: "order",
    quantity: -1,
    remaining: 24,
    notes: "خصم آلي للطلب #ORD-98420"
  },
  {
    id: "inv-3",
    date: "2026-10-15T09:00:00Z",
    productName: "عود مروكي أصيل دبل سوبر ملكي - أوقية فاخرة (30 جرام)",
    type: "manual_add",
    quantity: +20,
    remaining: 28,
    notes: "توريد دفعة عود مروكي طبيعي معتمد جديدة"
  }
],

  reviews: [
  {
    id: "rev-1",
    productId: "prod-1",
    authorName: "سلطان بن فهد التميمي",
    customerPhone: "0501234567",
    orderNumber: "ORD-98421",
    rating: 5,
    date: "2026-10-18",
    comment: "ما شاء الله تبارك الله، دهن العود فخم جداً وريحته ثابته بالثوب والشماغ يومين كاملين! تغليف راقي ويبيض الوجه كهدية فاخرة.",
    verifiedBuyer: true,
    isApproved: true
  },
  {
    id: "rev-2",
    productId: "prod-2",
    authorName: "سارة بنت خالد العتيبي",
    customerPhone: "0559876543",
    orderNumber: "ORD-98420",
    rating: 5,
    date: "2026-10-17",
    comment: "عطر نايت رويال الأسود قمة في الفخامة والرقي، ثبات فوحان غير طبيعي والكل يسألني عنه بالمناسبات. فخامة تستحق كل ريال.",
    verifiedBuyer: true,
    isApproved: true
  },
  {
    id: "rev-3",
    productId: "prod-3",
    authorName: "عبدالله بن فهد الشمري",
    customerPhone: "0501234567",
    orderNumber: "ORD-98421",
    rating: 5,
    date: "2026-10-16",
    comment: "عطر مكنار الذهب مزيج ساحر من العنبر والتوباكو والفانيلا، دافئ وشتوي وفخم جداً للمجالس والمناسبات الرسمية.",
    verifiedBuyer: true,
    isApproved: true
  },
  {
    id: "rev-4",
    productId: "prod-7",
    authorName: "محمد بن سلطان القحطاني",
    customerPhone: "0543322110",
    orderNumber: "ORD-98419",
    rating: 5,
    date: "2026-10-15",
    comment: "العود المروكي دبل سوبر ملكي يزبد على الجمر بكثافة ورائحته تفتح النفس بدون أي احتراق. بيض الله وجوهكم.",
    verifiedBuyer: true,
    isApproved: true
  },
  {
    id: "rev-5",
    productId: "prod-4",
    authorName: "ريم بنت عبدالعزيز الدوسري",
    customerPhone: "0564455667",
    orderNumber: "ORD-98418",
    rating: 5,
    date: "2026-10-14",
    comment: "عطر أورا دي روز بالورد الطائفي الناعم خيالي وفواح، يعطي إحساس بالنظافة والانتعاش الملكي طوال اليوم.",
    verifiedBuyer: true,
    isApproved: true
  },
  {
    id: "rev-6",
    productId: "prod-10",
    authorName: "عبدالرحمن بن خالد السبيعي",
    customerPhone: "0505556677",
    orderNumber: "ORD-RET-5555",
    rating: 5,
    date: "2026-10-19",
    comment: "المبخرة الكريستالية الذكية شحنها سريع جداً وعملية جداً بالسيارة والمكتب، شكلها فخم ومظهرها يواجه.",
    verifiedBuyer: true,
    isApproved: true
  }
],

  pages: {
    about: {
      title: "من نحن",
      content: `متجر النخبة السعودي هو علامة تجارية سعودية رائدة وموثقة بسجل تجاري رقم 1010987654 ورقم ضريبي معتمد. نسعى لتقديم أرقى المنتجات التي تجمع بين عبق الأصالة وفخامة العصر، مع ضمان جودة بنسبة 100% وشحن سريع لكافة مناطق المملكة وخارجها.`
    },
    returns: {
      title: "سياسة الاستبدال والاسترجاع",
      content: `يحق لعملاء متجر النخبة استرجاع أو استبدال أي منتج خلال 14 يوماً من تاريخ استلام الشحنة، شريطة أن يكون المنتج بحالته الأصلية غير مستخدم ومرفقاً معه الفاتورة الضريبية والغلاف الأصلي. يتم تحويل قيمة المنتج لحساب العميل البنكي فور استلام الشحنة وفحصها خلال 48 ساعة.`
    },
    privacy: {
      title: "سياسة الخصوصية وأمن المعلومات",
      content: `نحن نلتزم التزاماً تاماً بنظام حماية البيانات الشخصية الصادر في المملكة العربية السعودية. لا نقوم بمشاركة أي معلومات شخصية أو أرقام هواتف أو بيانات بنكية مع أي أطراف خارجية، وجميع عمليات الدفع الإلكتروني مشفرة بالكامل عبر بروتوكولات بنكية متوافقة مع متطلبات البنك المركزي السعودي (ساما).`
    },
    shipping: {
      title: "الشحن والتوصيل",
      content: `نتعاون مع كبرى شركات الشحن الوطنية (سمسا، أرامكس) لضمان وصول طلباتكم بسرعة وأمان. التوصيل داخل الرياض وجدة خلال 24 - 48 ساعة، ولباقي مدن المملكة خلال 2 - 3 أيام عمل. نوفر ميزة الشحن المجاني التلقائي لأي طلب تتجاوز قيمته 350 ر.س.`
    },
    faq: {
      title: "الأسئلة الشائعة",
      content: `هل المنتجات أصلية؟ نعم جميع منتجاتنا أصلية 100% مع ضمان ذهبي.\nكيف أتتبع طلبي؟ فور تجهيز الطلب، يصلكم رقم التتبع برابط مباشر لشركة الشحن.\nما هي طرق الدفع المتاحة؟ نقبل مدى، Apple Pay، فيزا وماستركارد، تمارا، والدفع عند الاستلام.`
    }
  },

  audit_logs: [
    {
      id: "log-1",
      action: "تهيئة المتجر",
      target: "النظام",
      user: "مدير المتجر الرئيسي",
      timestamp: "2026-10-19T12:00:00Z",
      details: "تم تنصيب قاعدة البيانات وتفعيل إعدادات سلة وربط الفوترة الإلكترونية ZATCA."
    }
  ],

  wallets: {
    "default": {
      balance: 150.00,
      transactions: [
        {
          id: "tx-init-1",
          type: "credit",
          amount: 150.00,
          date: "2026-10-20T10:00:00Z",
          description: "رصيد ترحيبي افتتاحي في المحفظة الرقمية",
          orderNumber: null
        }
      ]
    }
  },

  users: [
    {
      id: "usr-admin-khald",
      name: "خالد العنزي (مدير المتجر)",
      email: "Khald@123.com",
      phone: "0509998877",
      role: "admin",
      salt: "salla_salt_2026",
      passwordHash: "4b6c711006ce29e1e28585a292c9c04e3d6d6b81bd13e6e61e3da5182f6f2408",
      createdAt: "2026-10-01T00:00:00Z"
    },
    {
      id: "usr-cust-1",
      name: "سلطان بن فهد التميمي",
      email: "sultan.tamimi@gmail.com",
      phone: "0501234567",
      role: "customer",
      salt: "salla_salt_2026",
      passwordHash: "4b6c711006ce29e1e28585a292c9c04e3d6d6b81bd13e6e61e3da5182f6f2408",
      createdAt: "2026-10-05T00:00:00Z"
    },
    {
      id: "usr-cust-2",
      name: "سارة بنت خالد القحطاني",
      email: "sara.alqahtani@gmail.com",
      phone: "0559876543",
      role: "customer",
      salt: "salla_salt_2026",
      passwordHash: "4b6c711006ce29e1e28585a292c9c04e3d6d6b81bd13e6e61e3da5182f6f2408",
      createdAt: "2026-10-06T00:00:00Z"
    }
  ],

  expenses: [
    {
      id: "exp-1",
      date: "2026-10-15T10:00:00Z",
      category: "payment_fees",
      categoryLabel: "رسوم بوابات الدفع الإلكتروني",
      amount: 145.50,
      description: "رسوم تسوية مدفوعات مدى وفيزا والبطاقات المصرفية",
      reference: "INV-PAY-1001",
      createdBy: "مدير المتجر"
    },
    {
      id: "exp-2",
      date: "2026-10-16T14:30:00Z",
      category: "packaging",
      categoryLabel: "مواد التغليف والكراتين الفاخرة",
      amount: 220.00,
      description: "شراء علب ملكية وكراتين شحن قوية وأكياس قماشية مخصصة",
      reference: "INV-BOX-554",
      createdBy: "مدير المتجر"
    },
    {
      id: "exp-3",
      date: "2026-10-18T11:00:00Z",
      category: "marketing",
      categoryLabel: "تسويق وإعلانات رقمية",
      amount: 450.00,
      description: "حملة إعلانات ممولة في تيك توك وسناب شات لموسم الرياض",
      reference: "CAMP-RYD-01",
      createdBy: "مدير المتجر"
    },
    {
      id: "exp-4",
      date: "2026-10-19T09:15:00Z",
      category: "shipping_costs",
      categoryLabel: "رسوم شحن وتوصيل مدفوعة للناقل",
      amount: 180.00,
      description: "تسوية بوالص الشحن السريع مع سمسا وأرامكس",
      reference: "SMSA-OCT-88",
      createdBy: "مدير المتجر"
    }
  ],

  bundles: [
  {
    id: "bundle-1",
    productId: "prod-19",
    name: "باقة العطور الملكية الفاخرة (صندوق الطيب الملكي الثلاثي VIP)",
    image: "assets/images/perfume_gift_set.jpg",
    description: "مجموعة إهداء ملكية استثنائية تضم 3 عطور نيش فاخرة (عطر الطيب الملكي الأسود + عطر مكنار الذهب + عطر أورا دي روز الطائفي) في صندوق خشبي ملكي فاخر مبطن بالمخمل الأسود.",
    status: "active",
    components: [
      {
        productId: "prod-2",
        productName: "عطر الطيب الملكي - نايت رويال إكستريت دي بارفان 100 مل",
        productImage: "assets/images/perfume_royal_noir.jpg",
        costPrice: 240,
        regularPrice: 790,
        quantity: 1,
        variantMode: "single"
      },
      {
        productId: "prod-3",
        productName: "عطر مكنار الذهب - عنبر وتوباكو وفانيلا مدغشقر 100 مل",
        productImage: "assets/images/perfume_gold_musk.jpg",
        costPrice: 210,
        regularPrice: 650,
        quantity: 1,
        variantMode: "single"
      },
      {
        productId: "prod-4",
        productName: "عطر أورا دي روز - ورد طائفي وخشب الصندل 100 مل",
        productImage: "assets/images/perfume_rose_taif.jpg",
        costPrice: 180,
        regularPrice: 590,
        quantity: 1,
        variantMode: "single"
      }
    ],
    offerQty: 25,
    soldQty: 5,
    remainingOfferQty: 20,
    isReturnable: true,
    returnDays: 14,
    salePrice: 780,
    additionalCosts: 50,
    createdAt: "2026-10-19T10:00:00Z",
    updatedAt: "2026-10-19T10:00:00Z"
  },
  {
    id: "bundle-2",
    productId: "prod-20",
    name: "باقة رويال عود & بخور (عود مروكي دبل سوبر + دهن كلمنتان + مبخرة ذكية)",
    image: "assets/images/perfume_bukhoor_moroki.jpg",
    description: "باقة الضيافة والمناسبات الفاخرة: أوقية عود مروكي طبيعي دبل سوبر مع ربع تولة دهن عود كلمنتان بيور معتق والمبخرة الكريستالية الذكية القابلة للشحن.",
    status: "active",
    components: [
      {
        productId: "prod-7",
        productName: "عود مروكي أصيل دبل سوبر ملكي - أوقية فاخرة (30 جرام)",
        productImage: "assets/images/perfume_bukhoor_moroki.jpg",
        costPrice: 160,
        regularPrice: 520,
        quantity: 1,
        variantMode: "single"
      },
      {
        productId: "prod-8",
        productName: "دهن عود كلمنتان غابات مالينو بيور معتق - ربع تولة",
        productImage: "assets/images/product_oud.jpg",
        costPrice: 180,
        regularPrice: 600,
        quantity: 1,
        variantMode: "single"
      },
      {
        productId: "prod-10",
        productName: "مبخرة النخبة الملكية الكريستالية الذكية شحن متنقلة",
        productImage: "assets/images/product_oud.jpg",
        costPrice: 75,
        regularPrice: 260,
        quantity: 1,
        variantMode: "single"
      }
    ],
    offerQty: 30,
    soldQty: 6,
    remainingOfferQty: 24,
    isReturnable: true,
    returnDays: 14,
    salePrice: 699,
    additionalCosts: 30,
    createdAt: "2026-10-19T10:00:00Z",
    updatedAt: "2026-10-19T10:00:00Z"
  }
]
};

class StoreDB {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    try {
      const existing = localStorage.getItem(DB_KEY);
      if (!existing) {
        this.saveData(DEFAULT_SEED_DATA);
      } else {
        // Validate basic integrity
        const parsed = JSON.parse(existing);
        if (!parsed.products || !parsed.settings) {
          this.saveData(DEFAULT_SEED_DATA);
        } else {
          this.syncInventoryIntegrity(parsed);
        }
      }
    } catch (e) {
      console.warn('LocalStorage error or quota exceeded, loading seed data in memory:', e);
      this.memoryData = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    }
  }

  syncInventoryIntegrity(data) {
    let modified = false;
    if (!data.products) data.products = [];

    // Migration Check: If old non-perfume categories or products are present, or products < 20, update catalog
    const hasOldNonPerfumes = (data.categories && data.categories.some(c => c.id === 'cat-electronics' || c.id === 'cat-coffee' || c.id === 'cat-fashion'))
      || (data.products && data.products.some(p => p.categoryId === 'cat-electronics' || p.categoryId === 'cat-coffee' || p.categoryId === 'cat-fashion' || String(p.name).includes('ساعة') || String(p.name).includes('تيشيرت') || String(p.name).includes('بن خولاني')));

    if (hasOldNonPerfumes || data.products.length < 20) {
      data.categories = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.categories));
      data.products = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.products));
      data.bundles = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.bundles));
      if (data.theme) {
        data.theme.heroSlides = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.theme.heroSlides));
      }
      if (data.settings) {
        data.settings.storeName = DEFAULT_SEED_DATA.settings.storeName;
        data.settings.storeSlogan = DEFAULT_SEED_DATA.settings.storeSlogan;
      }
      data.reviews = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.reviews));
      data.inventory_movements = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.inventory_movements));
      modified = true;
    }

    // 1. Ensure prod-1 flagship exists
    if (!data.products.some(p => p.id === 'prod-1')) {
      const p1 = DEFAULT_SEED_DATA.products.find(p => p.id === 'prod-1');
      if (p1) {
        data.products.unshift(JSON.parse(JSON.stringify(p1)));
        modified = true;
      }
    }

    // 2. Enforce single source of truth: variants sum = total stock & flags
    data.products.forEach(p => {
      if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
        const sum = p.variants.reduce((acc, v) => acc + (parseInt(v.stock, 10) || 0), 0);
        if (p.stock !== sum || !p.hasVariants) {
          p.stock = sum;
          p.hasVariants = true;
          modified = true;
        }
      }
      if (p.productType === undefined) {
        p.productType = p.isBundle ? 'bundle' : 'product';
        modified = true;
      }
      if (p.isBundle === undefined) {
        p.isBundle = p.productType === 'bundle';
        modified = true;
      }
      if (p.isReturnable === undefined) {
        p.isReturnable = (p.id !== 'prod-14');
        modified = true;
      }
      if (p.returnDays === undefined) {
        p.returnDays = (p.id === 'prod-14' ? 0 : 14);
        modified = true;
      }
    });

    // 3. Ensure orders have stock tracking flags & valid return metadata
    if (data.orders) {
      data.orders.forEach(o => {
        if (o.stockDeducted === undefined) {
          o.stockDeducted = true;
          o.stockRestored = (o.orderStatus === 'ملغي' || o.paymentStatus === 'مسترد');
          modified = true;
        }
        if (!o.returns) {
          o.returns = [];
          modified = true;
        }
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach(it => {
            if (it.productId === 'prod-19' || it.productId === 'prod-20' || it.productId === 'prod-8' || (it.name && it.name.includes('باقة'))) {
              if (!it.isBundle || it.isReturnable !== true || it.returnDays !== 14) {
                it.isBundle = true;
                it.isReturnable = true;
                it.returnDays = 14;
                modified = true;
              }
            } else if (it.productId === 'prod-7') {
              if (it.isReturnable !== true || it.returnDays !== 14 || it.isBundle !== false) {
                it.isReturnable = true;
                it.returnDays = 14;
                it.isBundle = false;
                modified = true;
              }
            } else if (it.productId === 'prod-14' || (it.name && it.name.includes('عنبر شمامي'))) {
              if (it.isReturnable !== false || it.returnDays !== 0) {
                it.isReturnable = false;
                it.returnDays = 0;
                it.isBundle = false;
                modified = true;
              }
            } else if (it.isReturnable === undefined || it.returnDays === undefined || it.isBundle === undefined) {
              const matchedProd = data.products ? data.products.find(p => p.id === it.productId) : null;
              if (matchedProd) {
                it.isReturnable = matchedProd.isReturnable !== false;
                it.returnDays = matchedProd.returnDays !== undefined ? matchedProd.returnDays : 14;
                it.isBundle = matchedProd.isBundle || false;
              } else {
                it.isReturnable = true;
                it.returnDays = 14;
                it.isBundle = false;
              }
              modified = true;
            }
          });
        }
      });

      // Ensure test order ord-1005 exists and is kept in pristine, valid return state with perfume items
      let o5 = data.orders.find(o => o.id === 'ord-1005');
      if (!o5 || (o5.items && o5.items.some(it => it.name && (it.name.includes('تيشيرت') || it.name.includes('خولاني'))))) {
        const seedO5 = DEFAULT_SEED_DATA.orders.find(o => o.id === 'ord-1005');
        if (seedO5) {
          if (o5) {
            const idx = data.orders.indexOf(o5);
            data.orders[idx] = JSON.parse(JSON.stringify(seedO5));
            o5 = data.orders[idx];
          } else {
            o5 = JSON.parse(JSON.stringify(seedO5));
            data.orders.unshift(o5);
          }
          o5.date = new Date().toISOString();
          modified = true;
        }
      } else {
        const orderTime = o5.date ? new Date(o5.date).getTime() : 0;
        const daysElapsed = Math.floor((Date.now() - orderTime) / (1000 * 60 * 60 * 24));
        if (isNaN(daysElapsed) || daysElapsed >= 10 || daysElapsed < 0) {
          o5.date = new Date().toISOString();
          modified = true;
        }
        if (o5.orderStatus !== 'مكتمل' || o5.shippingStatus !== 'تم التسليم') {
          o5.orderStatus = 'مكتمل';
          o5.shippingStatus = 'تم التسليم';
          o5.paymentStatus = 'مدفوع';
          modified = true;
        }
        if (Array.isArray(o5.items)) {
          const bundleIt = o5.items.find(it => it.isBundle === true || (it.name && it.name.includes('باقة')));
          if (bundleIt) {
            bundleIt.isBundle = true;
            bundleIt.isReturnable = true;
            bundleIt.returnDays = 14;
            if ((bundleIt.returnedQty || 0) >= (bundleIt.quantity || 1)) {
              bundleIt.returnedQty = 0;
              bundleIt.quantity = Math.max(1, bundleIt.quantity || 1);
              modified = true;
            }
          }
        }
      }
    }

    // 4. Ensure inventory_movements array exists
    if (!data.inventory_movements) {
      data.inventory_movements = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.inventory_movements || []));
      modified = true;
    }

    // 5. Ensure theme.heroSlides exists
    if (!data.theme) {
      data.theme = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.theme || {}));
      modified = true;
    } else if (!data.theme.heroSlides || !Array.isArray(data.theme.heroSlides)) {
      data.theme.heroSlides = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.theme.heroSlides || []));
      modified = true;
    }

    // 6. Ensure reviews array exists
    if (!data.reviews || !Array.isArray(data.reviews) || data.reviews.length === 0) {
      data.reviews = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.reviews || []));
      modified = true;
    } else {
      data.reviews.forEach(r => {
        if (r.verifiedBuyer === undefined) {
          r.verifiedBuyer = true;
          modified = true;
        }
      });
    }

    // 7. Enforce single source of truth: Product ratings and review counts strictly derived from actual reviews
    const allReviews = data.reviews || [];
    data.products.forEach(p => {
      const prodRevs = allReviews.filter(r => String(r.productId) === String(p.id));
      const count = prodRevs.length;
      let realRating = p.rating || 5.0;
      if (count > 0) {
        const sum = prodRevs.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
        realRating = Math.round((sum / count) * 10) / 10;
      }
      if (p.rating !== realRating || p.reviewsCount !== count) {
        p.rating = realRating;
        p.reviewsCount = count;
        modified = true;
      }
    });

    // 8. Ensure customer wallets table exists
    if (!data.wallets || typeof data.wallets !== 'object') {
      data.wallets = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.wallets || {}));
      modified = true;
    }

    if (modified) {
      this.saveData(data);
    }
  }

  getAllData() {
    try {
      const dataStr = localStorage.getItem(DB_KEY);
      if (dataStr) {
        return JSON.parse(dataStr);
      }
    } catch (e) {
      console.error('Error reading DB:', e);
    }
    return this.memoryData || JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
  }

  saveData(data) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      this.notifyListeners({ type: 'full_update', data });
    } catch (e) {
      console.error('Error saving DB:', e);
      this.memoryData = data;
    }
  }

  get(table) {
    const data = this.getAllData();
    return data[table] || [];
  }

  find(table, id) {
    const items = this.get(table);
    if (Array.isArray(items)) {
      return items.find(i => i.id === id);
    }
    return items ? items[id] : null;
  }

  insert(table, item) {
    const data = this.getAllData();
    if (!data[table]) data[table] = [];
    if (!item.id) {
      item.id = 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    // Single source of truth enforcement for products with variants
    if (table === 'products' && item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      item.stock = item.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
      item.hasVariants = true;
    }

    data[table].unshift(item);

    // If order inserted, record audit log
    if (table === 'orders') {
      this.recordAuditLog('إنشاء طلب جديد', `الطلب ${item.orderNumber}`, item.customer ? item.customer.name : 'عميل المتجر', `القيمة الإجمالية: ${item.total} ر.س`);
    }

    this.saveData(data);
    return item;
  }

  update(table, id, updates) {
    const data = this.getAllData();
    if (Array.isArray(data[table])) {
      const index = data[table].findIndex(i => i.id === id);
      if (index !== -1) {
        // Single source of truth enforcement for products with variants
        if (table === 'products') {
          const merged = { ...data[table][index], ...updates };
          if (merged.variants && Array.isArray(merged.variants) && merged.variants.length > 0) {
            merged.stock = merged.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
            merged.hasVariants = true;
            updates.stock = merged.stock;
            updates.hasVariants = true;
          }
        }

        data[table][index] = { ...data[table][index], ...updates };
        this.saveData(data);
        return data[table][index];
      }
    } else if (typeof data[table] === 'object') {
      data[table] = { ...data[table], ...updates };
      this.saveData(data);
      return data[table];
    }
    return null;
  }

  delete(table, id) {
    const data = this.getAllData();
    if (Array.isArray(data[table])) {
      data[table] = data[table].filter(i => i.id !== id);
      this.saveData(data);
      return true;
    }
    return false;
  }

  /* ================= Customer Digital Wallet Management ================= */
  getWallet(customerKey = 'default') {
    const data = this.getAllData();
    if (!data.wallets) data.wallets = {};
    const key = String(customerKey || 'default').trim() || 'default';
    if (!data.wallets[key]) {
      data.wallets[key] = { balance: key === 'default' ? 150.00 : 0.00, transactions: [] };
      this.saveData(data);
    }
    return data.wallets[key];
  }

  creditWallet(customerKey, amount, reason, orderNumber = null) {
    const data = this.getAllData();
    if (!data.wallets) data.wallets = {};
    const key = String(customerKey || 'default').trim() || 'default';
    if (!data.wallets[key]) {
      data.wallets[key] = { balance: key === 'default' ? 150.00 : 0.00, transactions: [] };
    }
    const val = Math.max(0, parseFloat(amount) || 0);
    data.wallets[key].balance = Math.round((data.wallets[key].balance + val) * 100) / 100;

    const tx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: 'credit',
      amount: val,
      date: new Date().toISOString(),
      reason: reason || 'إيداع رصيد مسترد في المحفظة',
      description: reason || 'إيداع رصيد مسترد في المحفظة',
      orderNumber: orderNumber || null,
      balanceAfter: data.wallets[key].balance
    };

    if (!data.wallets[key].transactions) data.wallets[key].transactions = [];
    data.wallets[key].transactions.unshift(tx);

    this.saveData(data);
    this.recordAuditLog(
      'إيداع في محفظة العميل',
      `العميل (${key})`,
      'محرك الاسترجاع والمحفظة',
      `تم إيداع ${val.toFixed(2)} ر.س في المحفظة - ${reason} (رقم الطلب: ${orderNumber || '-'})`
    );

    return { success: true, balance: data.wallets[key].balance, transaction: tx };
  }

  debitWallet(customerKey, amount, reason, orderNumber = null) {
    const data = this.getAllData();
    if (!data.wallets) data.wallets = {};
    const key = String(customerKey || 'default').trim() || 'default';
    if (!data.wallets[key]) {
      data.wallets[key] = { balance: key === 'default' ? 150.00 : 0.00, transactions: [] };
    }
    const val = Math.max(0, parseFloat(amount) || 0);
    if (data.wallets[key].balance < val) {
      return {
        success: false,
        error: 'insufficient_funds',
        message: `رصيد المحفظة الحالي (${data.wallets[key].balance.toFixed(2)} ر.س) غير كافٍ لسداد المبلغ المطلوب (${val.toFixed(2)} ر.س).`,
        currentBalance: data.wallets[key].balance
      };
    }

    data.wallets[key].balance = Math.round((data.wallets[key].balance - val) * 100) / 100;

    const tx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: 'debit',
      amount: val,
      date: new Date().toISOString(),
      reason: reason || 'سداد قيمة مشتريات من المحفظة',
      description: reason || 'سداد قيمة مشتريات من المحفظة',
      orderNumber: orderNumber || null,
      balanceAfter: data.wallets[key].balance
    };

    if (!data.wallets[key].transactions) data.wallets[key].transactions = [];
    data.wallets[key].transactions.unshift(tx);

    this.saveData(data);
    this.recordAuditLog(
      'سداد من محفظة العميل',
      `العميل (${key})`,
      'بوابة الدفع (المحفظة)',
      `تم خصم ${val.toFixed(2)} ر.س لسداد الطلب #${orderNumber || '-'} - الرصيد المتبقي: ${data.wallets[key].balance.toFixed(2)} ر.س`
    );

    return { success: true, balance: data.wallets[key].balance, transaction: tx };
  }
  /* ================= Order Returns & State Machine Management ================= */
  createReturnRequest(orderId, returnPayload) {
    const order = this.find('orders', orderId);
    if (!order) return { success: false, message: 'الطلب غير موجود.' };

    if (!order.returns) order.returns = [];

    const returnId = 'RET-' + Math.floor(100000 + Math.random() * 900000);
    const refundTotal = Number(returnPayload.refundTotal || 0);

    // Initial Stage 1: "تم طلب الاسترجاع"
    // Rule: NO stock restored, NO refund issued at this stage!
    const newReturn = {
      id: returnId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: new Date().toISOString(),
      scope: returnPayload.scope || 'partial', // 'partial' | 'full'
      reason: returnPayload.reason || 'المقاس أو الحجم غير مناسب',
      refundMethod: returnPayload.refundMethod || 'wallet', // 'wallet' | 'card' | 'original'
      notes: returnPayload.notes || '',
      status: 'تم طلب الاسترجاع', // Stage 1 of 9
      history: [
        {
          status: 'تم طلب الاسترجاع',
          timestamp: new Date().toISOString(),
          actor: order.customer ? order.customer.name : 'العميل',
          notes: returnPayload.notes || 'تم تقديم طلب الاسترجاع من بوابة العميل'
        }
      ],
      items: (returnPayload.items || []).map(it => ({
        productId: it.productId,
        variantId: it.variantId || null,
        variantTitle: it.variantTitle || '',
        name: it.name,
        size: it.size || '',
        color: it.color || '',
        price: Number(it.price) || 0,
        quantity: parseInt(it.quantity, 10) || 1,
        isBundle: !!it.isBundle,
        isSalable: true,
        damageReason: ''
      })),
      refundTotal: refundTotal,
      adminNotes: '',
      stockRestored: false,
      stockRestoredAt: null,
      damagedItems: [],
      inspectionResult: null, // 'passed' | 'rejected' | null
      inspectionNotes: '',
      inspectedBy: null,
      inspectedAt: null,
      refundStatus: 'بانتظار الفحص', // 'بانتظار الفحص' | 'جارٍ الاسترداد' | 'تم الاسترداد' | 'فشل الاسترداد'
      refundProcessed: false,
      refundTxId: null,
      refundedAt: null,
      refundError: null
    };

    order.returns.unshift(newReturn);

    // Save updated order with new return request
    this.update('orders', order.id, { returns: order.returns });

    this.recordAuditLog(
      'تقديم طلب استرجاع جديد',
      `الطلب #${order.orderNumber} (إرجاع ${returnId})`,
      order.customer ? order.customer.name : 'عميل المتجر',
      `تم طلب استرجاع بقيمة ${refundTotal.toFixed(2)} ر.س - الحالة الحالية: [تم طلب الاسترجاع] (المخزون ورد المبلغ معلقين لحين اجتياز الفحص)`
    );

    return { success: true, returnRequest: newReturn };
  }

  updateReturnRequestStatus(orderId, returnId, newStatus, options = {}) {
    const order = this.find('orders', orderId);
    if (!order || !order.returns) return { success: false, message: 'الطلب أو سجلات الاسترجاع غير موجودة.' };

    const ret = order.returns.find(r => r.id === returnId);
    if (!ret) return { success: false, message: 'طلب الاسترجاع المحدد غير موجود.' };

    const oldStatus = ret.status;
    const actor = typeof options === 'string' ? 'مدير المتجر' : (options.actor || 'مدير المتجر');
    const adminNotes = typeof options === 'string' ? options : (options.adminNotes || options.notes || '');

    ret.status = newStatus;
    ret.updatedAt = new Date().toISOString();
    if (adminNotes) ret.adminNotes = adminNotes;

    // Track in return history timeline
    if (!ret.history) ret.history = [];
    ret.history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor: actor,
      notes: adminNotes || `تم تحديث الحالة إلى [${newStatus}]`
    });

    // Handle Stage 7: "تم اجتياز الفحص وقبول الاسترجاع"
    // THIS IS THE ONLY STAGE WHERE SALABLE INVENTORY IS RESTORED!
    if (newStatus === 'تم اجتياز الفحص وقبول الاسترجاع') {
      ret.inspectionResult = 'passed';
      ret.inspectedAt = new Date().toISOString();
      ret.inspectedBy = actor;
      if (typeof options === 'object' && options.inspectionNotes) {
        ret.inspectionNotes = options.inspectionNotes;
      }

      // Restock ONLY if not already restored (Idempotency)
      if (!ret.stockRestored) {
        ret.stockRestored = true;
        ret.stockRestoredAt = new Date().toISOString();

        const itemsInspection = (typeof options === 'object' && options.itemsInspection) ? options.itemsInspection : [];

        if (order.items && ret.items) {
          ret.items.forEach(retItem => {
            const inspOverride = itemsInspection.find(i => i.productId === retItem.productId && (retItem.variantId ? i.variantId === retItem.variantId : true));
            const isSalable = inspOverride ? inspOverride.isSalable !== false : (retItem.isSalable !== false);
            const damageReason = inspOverride ? (inspOverride.damageReason || '') : (retItem.damageReason || '');

            retItem.isSalable = isSalable;
            if (!isSalable) retItem.damageReason = damageReason;

            const ordItem = order.items.find(oi => oi.productId === retItem.productId && (retItem.variantId ? oi.variantId === retItem.variantId : true));
            const purchasedQty = ordItem ? (ordItem.quantity || 1) : 1;
            const requestedQty = parseInt(retItem.quantity, 10) || 1;
            const qty = Math.min(requestedQty, purchasedQty); // cannot restore more than purchased!

            if (isSalable) {
              if (ordItem) {
                ordItem.returnedQty = (ordItem.returnedQty || 0) + qty;
              }
              // Restock in database
              const prod = this.find('products', retItem.productId);
              if (prod) {
                const prevTotal = prod.stock || 0;
                if (prod.variants && prod.variants.length > 0) {
                  const vr = (retItem.variantId ? prod.variants.find(v => v.id === retItem.variantId) : null) || prod.variants[0];
                  if (vr) {
                    vr.stock = (parseInt(vr.stock, 10) || 0) + qty;
                  }
                  prod.stock = prod.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
                } else {
                  prod.stock = (parseInt(prod.stock, 10) || 0) + qty;
                }
                this.update('products', prod.id, prod);

                // Inventory movement audit trail
                const allData = this.getAllData();
                if (!allData.inventory_movements) allData.inventory_movements = [];
                allData.inventory_movements.unshift({
                  id: 'mov-ret-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                  productId: prod.id,
                  productName: prod.name,
                  variantId: retItem.variantId || null,
                  variantTitle: retItem.variantTitle || null,
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                  returnId: ret.id,
                  type: 'return_restock',
                  typeLabel: 'إعادة مخزون مرتجع بعد اجتياز الفحص',
                  quantity: qty,
                  previousStock: prevTotal,
                  remainingStock: prod.stock,
                  date: new Date().toISOString(),
                  reason: `استرجاع معتمد #${ret.id} - اجتياز الفحص`
                });
                this.saveData(allData);
              }
            } else {
              // Damaged/unsalable: DO NOT ADD TO SALABLE STOCK!
              if (!ret.damagedItems) ret.damagedItems = [];
              ret.damagedItems.push({
                productId: retItem.productId,
                variantId: retItem.variantId || null,
                name: retItem.name,
                quantity: qty,
                reason: damageReason || 'منتج تالف / غير مطابق لشروط الاسترجاع'
              });
              const allData = this.getAllData();
              if (!allData.inventory_movements) allData.inventory_movements = [];
              allData.inventory_movements.unshift({
                id: 'mov-dmg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                productId: retItem.productId,
                productName: retItem.name,
                variantId: retItem.variantId || null,
                variantTitle: retItem.variantTitle || null,
                orderId: order.id,
                orderNumber: order.orderNumber,
                returnId: ret.id,
                type: 'quarantine_damaged_return',
                typeLabel: 'مرتجع تالف غير صالح للبيع (عزل)',
                quantity: 0,
                previousStock: 0,
                remainingStock: 0,
                date: new Date().toISOString(),
                reason: `مرتجع تالف #${ret.id}: ${damageReason || 'فحص غير سليم'}`
              });
              this.saveData(allData);
            }
          });
        }
      }
    }

    // Handle State: "مرفوض بعد الفحص"
    if (newStatus === 'مرفوض بعد الفحص') {
      ret.inspectionResult = 'rejected';
      ret.rejectionReason = (typeof options === 'object' && options.rejectionReason) ? options.rejectionReason : (adminNotes || 'المنتج غير مطابق لسياسة وشروط الاسترجاع');
      ret.refundStatus = 'مرفوض';
      // NO stock restored, NO refund
    }

    // Handle State 8: "جارٍ استرداد المبلغ"
    if (newStatus === 'جارٍ استرداد المبلغ') {
      ret.refundStatus = 'جارٍ الاسترداد';
    }

    // Handle State 9: "تم استرداد المبلغ"
    if (newStatus === 'تم استرداد المبلغ') {
      const refundResult = this.executeReturnRefund(order.id, ret.id, options);
      if (!refundResult.success) {
        return refundResult;
      }
    }

    // Handle State: "تعذّر استرداد المبلغ"
    if (newStatus === 'تعذّر استرداد المبلغ') {
      ret.refundStatus = 'فشل الاسترداد';
      ret.refundError = (typeof options === 'object' && options.errorMessage) ? options.errorMessage : (adminNotes || 'تعذر رد المبلغ عبر بوابة الدفع');
    }

    // Handle State: "ملغي"
    if (newStatus === 'ملغي') {
      ret.refundStatus = 'ملغي';
    }

    this.update('orders', order.id, { returns: order.returns, items: order.items });

    this.recordAuditLog(
      'تحديث حالة طلب الاسترجاع',
      `الطلب #${order.orderNumber} - إرجاع ${returnId}`,
      actor,
      `تم تغيير الحالة من [${oldStatus}] إلى [${newStatus}]`
    );

    return { success: true, returnRequest: ret };
  }

  executeReturnRefund(orderId, returnId, options = {}) {
    const order = this.find('orders', orderId);
    if (!order || !order.returns) return { success: false, message: 'الطلب أو سجل الاسترجاع غير موجود' };

    const ret = order.returns.find(r => r.id === returnId);
    if (!ret) return { success: false, message: 'طلب الاسترجاع غير موجود' };

    // Idempotency: Prevent double refunding!
    if (ret.refundProcessed) {
      return { success: true, alreadyRefunded: true, returnRequest: ret };
    }

    // Simulate failure if requested for testing error handling
    if (typeof options === 'object' && options.simulateFailure === true) {
      ret.status = 'تعذّر استرداد المبلغ';
      ret.refundStatus = 'فشل الاسترداد';
      ret.refundError = options.errorMessage || 'فشل الاتصال بمزود خدمة الدفع';
      if (!ret.history) ret.history = [];
      ret.history.push({
        status: 'تعذّر استرداد المبلغ',
        timestamp: new Date().toISOString(),
        actor: 'بوابة الدفع',
        notes: ret.refundError
      });
      this.update('orders', order.id, { returns: order.returns });
      return { success: false, message: ret.refundError, returnRequest: ret };
    }

    const refundAmt = Number(ret.refundTotal || 0);
    const refundMethod = ret.refundMethod || 'wallet';
    let txId = null;

    if (refundMethod === 'wallet') {
      const custPhone = (order.customer && order.customer.phone) ? order.customer.phone : 'default';
      const creditRes = this.creditWallet(
        custPhone,
        refundAmt,
        `استرداد معتمد لطلب استرجاع #${ret.id}`,
        order.orderNumber
      );
      if (!creditRes.success) {
        ret.status = 'تعذّر استرداد المبلغ';
        ret.refundStatus = 'فشل الاسترداد';
        ret.refundError = 'تعذر إضافة المبلغ لمحفظة العميل';
        this.update('orders', order.id, { returns: order.returns });
        return { success: false, message: ret.refundError, returnRequest: ret };
      }
      txId = creditRes.transaction ? creditRes.transaction.id : ('TX-W-' + Date.now());
    } else {
      // Card / Gateway refund simulation
      txId = 'TX-RFND-' + Math.floor(10000000 + Math.random() * 90000000);
    }

    ret.refundProcessed = true;
    ret.refundedAt = new Date().toISOString();
    ret.refundTxId = txId;
    ret.refundStatus = 'تم الاسترداد';
    ret.status = 'تم استرداد المبلغ';

    if (!ret.history) ret.history = [];
    ret.history.push({
      status: 'تم استرداد المبلغ',
      timestamp: new Date().toISOString(),
      actor: 'النظام المالي',
      notes: `تم استرداد مبلغ ${refundAmt.toFixed(2)} ر.س بنجاح عبر (${refundMethod === 'wallet' ? 'المحفظة الرقمية' : 'البطاقة المصرفية'}) - رقم العملية: ${txId}`
    });

    this.update('orders', order.id, { returns: order.returns });

    this.recordAuditLog(
      'إتمام رد مبلغ الاسترجاع',
      `الطلب #${order.orderNumber} - إرجاع ${ret.id}`,
      'النظام المالي',
      `تم استرداد ${refundAmt.toFixed(2)} ر.س للعميل (${order.customer ? order.customer.name : '-'}) - العملية ${txId}`
    );

    return { success: true, returnRequest: ret, refundTxId: txId };
  }

  /* ================= Reviews Management & Verified Buyer Verification ================= */
  canCustomerReview(productId, phoneOrEmail, orderNumber = null) {
    if (!productId) return { eligible: false, message: 'معرّف المنتج غير محدد.' };
    const query = String(phoneOrEmail || '').trim().toLowerCase();
    const queryDigits = query.replace(/\D/g, '');
    const ordNumQuery = String(orderNumber || '').trim().toUpperCase();

    const orders = this.get('orders') || [];

    // Search for a completed or non-cancelled order containing this product
    const matchingOrder = orders.find(order => {
      // Must not be cancelled or payment failed
      if (order.orderStatus === 'ملغي' || order.paymentStatus === 'فشل') return false;

      // Check if product is in order items
      const hasProduct = order.items && order.items.some(it => String(it.productId) === String(productId));
      if (!hasProduct) return false;

      // Match by orderNumber
      if (ordNumQuery && String(order.orderNumber).toUpperCase() === ordNumQuery) return true;

      const cust = order.customer || {};
      const custPhone = String(cust.phone || '').replace(/\D/g, '');
      const custEmail = String(cust.email || '').toLowerCase().trim();

      if (queryDigits && queryDigits.length >= 7) {
        if (custPhone.endsWith(queryDigits.slice(-9)) || queryDigits.endsWith(custPhone.slice(-9))) {
          return true;
        }
      }

      if (query && custEmail === query) {
        return true;
      }

      if (query && String(order.orderNumber).toLowerCase() === query) {
        return true;
      }

      return false;
    });

    if (matchingOrder) {
      return {
        eligible: true,
        orderId: matchingOrder.id,
        orderNumber: matchingOrder.orderNumber,
        customerName: matchingOrder.customer ? matchingOrder.customer.name : 'مشتري موثق',
        customerPhone: matchingOrder.customer ? matchingOrder.customer.phone : '',
        orderDate: matchingOrder.date
      };
    }

    return {
      eligible: false,
      message: 'عذراً، لم يتم العثور على طلب شراء مسجل لهذا المنتج برقم الجوال أو الطلب المدخل. حفاظاً على مصداقية التقييمات، يسمح بالتقييم حصرياً للعملاء الذين اشتروا هذا المنتج وتأكد طلبهم.'
    };
  }

  getProductReviews(productId) {
    const reviews = this.get('reviews') || [];
    return reviews.filter(r => String(r.productId) === String(productId));
  }

  recalculateProductRating(productId) {
    const reviews = this.getProductReviews(productId);
    const count = reviews.length;
    let avg = 0;
    if (count > 0) {
      const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      avg = Math.round((sum / count) * 10) / 10;
    }
    this.update('products', productId, {
      rating: avg,
      reviewsCount: count
    });
    return { rating: avg, reviewsCount: count };
  }

  deleteReview(reviewId) {
    const review = this.find('reviews', reviewId);
    if (!review) return false;
    const prodId = review.productId;
    const deleted = this.delete('reviews', reviewId);
    if (deleted && prodId) {
      this.recalculateProductRating(prodId);
      this.recordAuditLog('حذف تقييم عميل', `المنتج ${prodId}`, 'مدير المتجر', `تم حذف تقييم العميل (${review.authorName}) وتحديث متوسط تقييم المنتج تلقائياً`);
    }
    return deleted;
  }

  recordAuditLog(action, target, user, details) {
    const data = this.getAllData();
    if (!data.audit_logs) data.audit_logs = [];
    data.audit_logs.unshift({
      id: 'log-' + Date.now(),
      action,
      target,
      user: user || 'مدير النظام',
      timestamp: new Date().toISOString(),
      details: details || ''
    });
    // Keep max 100 logs
    if (data.audit_logs.length > 100) data.audit_logs.pop();
    this.saveData(data);
  }

  calculateComprehensiveFinancials(options = {}) {
    const period = options.period || 'all';
    const customStart = options.startDate ? new Date(options.startDate) : null;
    const customEnd = options.endDate ? new Date(options.endDate) : null;

    const now = new Date();
    const orders = this.get('orders') || [];
    const products = this.get('products') || [];
    const expenses = this.get('expenses') || [];
    const bundles = this.get('bundles') || [];

    const isWithinPeriod = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;

      if (period === 'all') return true;
      if (period === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (period === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= oneWeekAgo && d <= now;
      }
      if (period === 'month') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      if (period === 'quarter') {
        const curQuarter = Math.floor(now.getMonth() / 3);
        const orderQuarter = Math.floor(d.getMonth() / 3);
        return d.getFullYear() === now.getFullYear() && curQuarter === orderQuarter;
      }
      if (period === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      if (period === 'custom' && customStart && customEnd) {
        return d >= customStart && d <= customEnd;
      }
      return true;
    };

    let grossSales = 0;
    let totalDiscounts = 0;
    let netSales = 0;
    let collectedAmount = 0;
    let pendingAmount = 0;
    let cancelledAmount = 0;
    let refundedAmount = 0;
    let cogs = 0;
    let returnedCogs = 0;
    let totalTaxCollected = 0;
    let totalShippingRevenue = 0;

    let validOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let returnedOrdersCount = 0;
    let pendingOrdersCount = 0;

    const breakdownByPayment = {};
    const breakdownByProduct = {};

    orders.forEach(order => {
      if (!isWithinPeriod(order.date)) return;

      const orderTotal = Number(order.total) || 0;
      const orderSubtotal = Number(order.subtotal) || orderTotal;
      const orderDiscount = Number(order.discount) || 0;
      const orderTax = Number(order.vatAmount) || 0;
      const orderShipping = Number(order.shippingCost) || 0;

      // 1. Cancelled orders
      if (order.orderStatus === 'ملغي') {
        cancelledAmount += orderTotal;
        cancelledOrdersCount++;
        return;
      }

      // Check COD and delivery status
      const isCod = (
        order.paymentMethod === 'cod' ||
        order.paymentMethod === 'الدفع عند الاستلام' ||
        (typeof order.paymentMethod === 'string' && (order.paymentMethod.includes('الاستلام') || order.paymentMethod.toLowerCase().includes('cod'))) ||
        (typeof order.paymentMethod === 'object' && order.paymentMethod !== null && ((order.paymentMethod.id || '').toLowerCase().includes('cod') || (order.paymentMethod.name || '').includes('الاستلام')))
      );
      const isDelivered = (order.shippingStatus === 'تم التسليم' || order.orderStatus === 'مكتمل');

      // Rule: For Cash on Delivery, money does not arrive until shipping is 'تم التسليم'
      if (isCod && !isDelivered) {
        pendingAmount += orderTotal;
        pendingOrdersCount++;
        return;
      }
      if (!isCod && (order.paymentStatus === 'بانتظار الدفع' || order.paymentStatus === 'معلق' || order.paymentStatus === 'في انتظار الدفع' || order.paymentStatus === 'غير مدفوع')) {
        pendingAmount += orderTotal;
        pendingOrdersCount++;
        return;
      }


      // Check full return by status
      const isFullReturn = (order.orderStatus === 'مسترجع' || order.paymentStatus === 'مسترد');

      // Calculate initial items COGS
      let orderInitialCogs = 0;
      if (Array.isArray(order.items)) {
        order.items.forEach(it => {
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price) || 0;
          let unitCost = 0;

          if (it.isBundle) {
            const b = bundles.find(bnd => bnd.productId === it.productId || bnd.id === it.productId);
            if (b && Array.isArray(b.components)) {
              unitCost = b.components.reduce((sum, c) => sum + ((Number(c.costPrice) || 0) * (Number(c.quantity) || 1)), 0) + (Number(b.additionalCosts) || 0);
            } else {
              const p = products.find(prod => prod.id === it.productId);
              unitCost = p && p.costPrice ? Number(p.costPrice) : (price * 0.45);
            }
          } else {
            const p = products.find(prod => prod.id === it.productId);
            unitCost = p && p.costPrice ? Number(p.costPrice) : (price * 0.45);
          }

          const lineCogs = unitCost * qty;
          orderInitialCogs += lineCogs;
        });
      }

      // Calculate return requests in order.returns
      let orderRefund = 0;
      let orderRetCogs = 0;

      if (Array.isArray(order.returns)) {
        order.returns.forEach(r => {
          if (r.status === 'مرفوض بعد الفحص' || r.status === 'ملغي') return;
          const rTotal = Number(r.refundTotal) || 0;
          orderRefund += rTotal;

          if (Array.isArray(r.items)) {
            r.items.forEach(retIt => {
              const rQty = Number(retIt.quantity) || 1;
              const rPrice = Number(retIt.price) || 0;
              let uCost = 0;
              if (retIt.isBundle) {
                const b = bundles.find(bnd => bnd.productId === retIt.productId || bnd.id === retIt.productId);
                if (b && Array.isArray(b.components)) {
                  uCost = b.components.reduce((sum, c) => sum + ((Number(c.costPrice) || 0) * (Number(c.quantity) || 1)), 0) + (Number(b.additionalCosts) || 0);
                } else {
                  const p = products.find(prod => prod.id === retIt.productId);
                  uCost = p && p.costPrice ? Number(p.costPrice) : (rPrice * 0.45);
                }
              } else {
                const p = products.find(prod => prod.id === retIt.productId);
                uCost = p && p.costPrice ? Number(p.costPrice) : (rPrice * 0.45);
              }
              orderRetCogs += uCost * rQty;
            });
          }
        });
      }

      if (isFullReturn) {
        returnedOrdersCount++;
        orderRefund = Math.max(orderRefund, orderTotal);
        orderRetCogs = Math.max(orderRetCogs, orderInitialCogs);
      } else if (orderRefund >= orderTotal && orderTotal > 0) {
        returnedOrdersCount++;
      } else {
        validOrdersCount++;
      }

      grossSales += orderSubtotal;
      totalDiscounts += orderDiscount;
      totalShippingRevenue += orderShipping;
      refundedAmount += orderRefund;
      cogs += orderInitialCogs;
      returnedCogs += orderRetCogs;

      // Net Tax collected from this order after deducting refunded tax
      const refundedVat = orderRefund > 0 ? (orderRefund - (orderRefund / 1.15)) : 0;
      const orderEffectiveVat = Math.max(0, orderTax - refundedVat);
      totalTaxCollected += orderEffectiveVat;

      // Cash collection net of refunds (Delivered COD or Paid Prepaid)
      collectedAmount += Math.max(0, orderTotal - orderRefund);

      // Breakdown by payment
      const payMethod = order.paymentMethod ? (order.paymentMethod.name || order.paymentMethod.type || 'أخرى') : 'غير محدد';
      if (!breakdownByPayment[payMethod]) breakdownByPayment[payMethod] = { count: 0, total: 0 };
      breakdownByPayment[payMethod].count++;
      breakdownByPayment[payMethod].total += Math.max(0, orderTotal - orderRefund);

      // Breakdown by product (adjusted for returned quantities)
      if (Array.isArray(order.items)) {
        order.items.forEach(it => {
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price) || 0;
          let retQty = 0;

          if (isFullReturn) {
            retQty = qty;
          } else if (Array.isArray(order.returns)) {
            order.returns.forEach(r => {
              if (r.status === 'مرفوض بعد الفحص' || r.status === 'ملغي') return;
              if (Array.isArray(r.items)) {
                const matched = r.items.find(ri => ri.productId === it.productId && (!ri.variantId || ri.variantId === it.variantId));
                if (matched) retQty += Number(matched.quantity) || 0;
              }
            });
          }

          const effectiveQty = Math.max(0, qty - retQty);
          let unitCost = 0;
          const p = products.find(prod => prod.id === it.productId);
          unitCost = p && p.costPrice ? Number(p.costPrice) : (price * 0.45);

          const effectiveSales = price * effectiveQty;
          const effectiveCogs = unitCost * effectiveQty;
          const effectiveProfit = effectiveSales - effectiveCogs;

          const pName = it.name || it.productId;
          if (!breakdownByProduct[pName]) breakdownByProduct[pName] = { qty: 0, sales: 0, cogs: 0, profit: 0 };
          breakdownByProduct[pName].qty += effectiveQty;
          breakdownByProduct[pName].sales += effectiveSales;
          breakdownByProduct[pName].cogs += effectiveCogs;
          breakdownByProduct[pName].profit += effectiveProfit;
        });
      }
    });

    grossSales = Number(grossSales.toFixed(2));
    totalDiscounts = Number(totalDiscounts.toFixed(2));
    refundedAmount = Number(refundedAmount.toFixed(2));

    // Standard GAAP Net Sales = Gross Sales - Discounts - Refunds/Returns
    netSales = Number(Math.max(0, grossSales - totalDiscounts - refundedAmount).toFixed(2));

    // Net COGS = Total initial COGS - Returned COGS (products restocked)
    const netCogs = Number(Math.max(0, cogs - returnedCogs).toFixed(2));

    // Gross Profit = Net Sales - Net COGS (Deducts profit of returned products)
    const grossProfit = Number(Math.max(0, netSales - netCogs).toFixed(2));

    let totalExpenses = 0;
    let paymentGatewayFees = 0;
    let packagingExpenses = 0;
    let marketingExpenses = 0;
    let shippingExpenses = 0;
    let otherExpenses = 0;

    expenses.forEach(exp => {
      if (!isWithinPeriod(exp.date)) return;
      const amt = Number(exp.amount) || 0;
      totalExpenses += amt;
      if (exp.category === 'payment_fees') paymentGatewayFees += amt;
      else if (exp.category === 'packaging') packagingExpenses += amt;
      else if (exp.category === 'marketing') marketingExpenses += amt;
      else if (exp.category === 'shipping_costs') shippingExpenses += amt;
      else otherExpenses += amt;
    });

    totalExpenses = Number(totalExpenses.toFixed(2));
    paymentGatewayFees = Number(paymentGatewayFees.toFixed(2));
    packagingExpenses = Number(packagingExpenses.toFixed(2));
    marketingExpenses = Number(marketingExpenses.toFixed(2));
    shippingExpenses = Number(shippingExpenses.toFixed(2));
    otherExpenses = Number(otherExpenses.toFixed(2));

    // Net Profit = Gross Profit - Total Expenses
    const netProfit = Number((grossProfit - totalExpenses).toFixed(2));
    const profitMargin = netSales > 0 ? Number(((grossProfit / netSales) * 100).toFixed(1)) : 0;
    const netProfitMargin = netSales > 0 ? Number(((netProfit / netSales) * 100).toFixed(1)) : 0;

    let inventoryCostValue = 0;
    let inventoryRetailValue = 0;
    let totalItemsInStock = 0;

    products.forEach(p => {
      const pCost = Number(p.costPrice) || (Number(p.salePrice || p.regularPrice) * 0.45);
      const pPrice = Number(p.salePrice || p.regularPrice) || 0;

      if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach(v => {
          const vStock = Number(v.stock) || 0;
          const vCost = Number(v.costPrice) || pCost;
          const vPrice = Number(v.price) || pPrice;
          inventoryCostValue += vStock * vCost;
          inventoryRetailValue += vStock * vPrice;
          totalItemsInStock += vStock;
        });
      } else {
        const pStock = Number(p.stock) || 0;
        inventoryCostValue += pStock * pCost;
        inventoryRetailValue += pStock * pPrice;
        totalItemsInStock += pStock;
      }
    });

    inventoryCostValue = Number(inventoryCostValue.toFixed(2));
    inventoryRetailValue = Number(inventoryRetailValue.toFixed(2));
    totalTaxCollected = Number(totalTaxCollected.toFixed(2));
    collectedAmount = Number(collectedAmount.toFixed(2));
    pendingAmount = Number(pendingAmount.toFixed(2));
    cancelledAmount = Number(cancelledAmount.toFixed(2));
    refundedAmount = Number(refundedAmount.toFixed(2));
    totalShippingRevenue = Number(totalShippingRevenue.toFixed(2));

    return {
      period,
      grossSales,
      totalDiscounts,
      discounts: totalDiscounts,
      netSales,
      collectedAmount,
      pendingAmount,
      cancelledAmount,
      refundedAmount,
      cogs: netCogs,
      initialCogs: Number(cogs.toFixed(2)),
      returnedCogs: Number(returnedCogs.toFixed(2)),
      grossProfit,
      totalExpenses,
      paymentGatewayFees,
      packagingExpenses,
      marketingExpenses,
      shippingExpenses,
      otherExpenses,
      netProfit,
      profitMargin,
      netProfitMargin,
      profitMarginPercent: netProfitMargin,
      totalTaxCollected,
      vatCollected: totalTaxCollected,
      totalShippingRevenue,
      inventoryCostValue,
      inventoryValuation: inventoryCostValue,
      inventoryRetailValue,
      totalItemsInStock,
      validOrdersCount,
      cancelledOrdersCount,
      returnedOrdersCount,
      breakdownByPayment,
      breakdownByProduct
    };
  }

  resetDemoData() {
    this.saveData(DEFAULT_SEED_DATA);
    return true;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(event) {
    this.listeners.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        console.error('DB listener callback error:', err);
      }
    });
    // Also dispatch custom DOM event for multi-tab or independent scripts
    window.dispatchEvent(new CustomEvent('salla_db_changed', { detail: event }));
  }
}

/**
 * =========================================================================
 * StoreInventoryEngine - محرك المخزون المترابط والمتغيرات
 * Single Source of Truth + Concurrency Protection + Idempotent Deduction/Restoration
 * =========================================================================
 */
class StoreInventoryEngine {
  constructor(db) {
    this.db = db;
  }

  /**
   * 1. Calculate total stock strictly from variants if present
   */
  calculateTotalStock(product) {
    if (!product) return 0;
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
    }
    return Math.max(0, parseInt(product.stock, 10) || 0);
  }

  /**
   * Sync a product's stock with its variants in DB
   */
  syncProductStock(productId) {
    const product = this.db.find('products', productId);
    if (!product) return null;
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const computedStock = this.calculateTotalStock(product);
      product.stock = computedStock;
      product.hasVariants = true;
      this.db.update('products', productId, { stock: computedStock, hasVariants: true });
    }
    return product;
  }

  /**
   * Sync all products in DB to guarantee single source of truth
   */
  syncAll() {
    const products = this.db.get('products') || [];
    let changed = false;
    products.forEach(p => {
      if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
        const computed = this.calculateTotalStock(p);
        if (p.stock !== computed || !p.hasVariants) {
          p.stock = computed;
          p.hasVariants = true;
          changed = true;
        }
      }
    });
    if (changed) {
      const data = this.db.getAllData();
      data.products = products;
      this.db.saveData(data);
    }
  }

  /**
   * 4. Prevent Overselling: Validate stock availability before processing order
   */
  validateStockAvailability(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { valid: false, error: 'empty_cart', message: 'السلة فارغة' };
    }

    const products = this.db.get('products') || [];
    const errors = [];

    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        errors.push(`المنتج "${item.name || item.productId}" غير موجود بالمتجر.`);
        continue;
      }

      const reqQty = parseInt(item.quantity, 10) || 1;
      if (reqQty <= 0) {
        errors.push(`كمية المنتج "${prod.name}" يجب أن تكون 1 على الأقل.`);
        continue;
      }

      if (item.variantId && item.variantId !== 'default' && prod.variants) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (!variant) {
          errors.push(`الخيار المحدد للمنتج "${prod.name}" غير متوفر.`);
        } else if (variant.stock < reqQty) {
          errors.push(`الكمية المطلوبة من "${prod.name} (${variant.title})" غير متوفرة. المتبقي بالمخزون: ${variant.stock} قطعة فقط، والمطلوب: ${reqQty} قطعة.`);
        }
      } else if (prod.variants && prod.variants.length > 0) {
        const variant = prod.variants.find(v => v.stock >= reqQty) || prod.variants[0];
        if (!variant || variant.stock < reqQty) {
          errors.push(`الكمية المطلوبة من "${prod.name}" غير متوفرة. المتبقي بالمخزون: ${variant ? variant.stock : prod.stock} قطعة فقط، والمطلوب: ${reqQty} قطعة.`);
        }
      } else {
        if (prod.stock < reqQty) {
          errors.push(`الكمية المطلوبة من "${prod.name}" غير متوفرة. المتبقي بالمخزون: ${prod.stock} قطعة فقط، والمطلوب: ${reqQty} قطعة.`);
        }
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        error: 'insufficient_stock',
        message: errors.join(' | '),
        errors
      };
    }

    return { valid: true };
  }

  /**
   * 2 & 3. Deduct Stock on Confirmed Sale with Idempotency Guard (Prevent Double Deduction)
   */
  deductOrderStock(orderOrId, triggerSource = 'order_placement') {
    const orderId = typeof orderOrId === 'object' ? orderOrId.id : orderOrId;
    const order = this.db.find('orders', orderId);
    if (!order) {
      return { success: false, error: 'order_not_found', message: `الطلب رقم ${orderId} غير موجود` };
    }

    // 3. Idempotency Check: Prevent duplicate deduction
    if (order.stockDeducted === true) {
      return {
        success: false,
        alreadyDeducted: true,
        message: `تم خصم المخزون مسبقاً لهذا الطلب #${order.orderNumber} (بتاريخ: ${order.stockDeductedAt})، تم منع الخصم المكرر بأمان.`,
        order
      };
    }

    // 4. Validate current stock availability before deducting
    const validation = this.validateStockAvailability(order.items);
    if (!validation.valid) {
      return {
        success: false,
        error: 'insufficient_stock',
        message: validation.message,
        errors: validation.errors
      };
    }

    // Atomic deduction and movement logging
    const allData = this.db.getAllData();
    const products = allData.products || [];
    if (!allData.inventory_movements) allData.inventory_movements = [];

    const deductionDetails = [];

    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) continue;

      const qty = parseInt(item.quantity, 10) || 1;
      let variant = null;
      let prevVariantStock = null;
      let prevProductStock = prod.stock;

      if (item.variantId && item.variantId !== 'default' && prod.variants) {
        variant = prod.variants.find(v => v.id === item.variantId);
        if (variant) {
          prevVariantStock = variant.stock;
          variant.stock = Math.max(0, variant.stock - qty);
          // 6. Synchronize parent product total strictly from variants
          prod.stock = prod.variants.reduce((s, vr) => s + (parseInt(vr.stock, 10) || 0), 0);
          prod.hasVariants = true;
        }
      } else if (prod.variants && prod.variants.length > 0) {
        variant = prod.variants.find(v => v.stock >= qty) || prod.variants[0];
        if (variant) {
          prevVariantStock = variant.stock;
          variant.stock = Math.max(0, variant.stock - qty);
          prod.stock = prod.variants.reduce((s, vr) => s + (parseInt(vr.stock, 10) || 0), 0);
          prod.hasVariants = true;
        }
      } else {
        prod.stock = Math.max(0, prod.stock - qty);
      }

      if (prod.isBundle || prod.productType === 'bundle' || item.isBundle) {
        const bundle = (allData.bundles || []).find(b => b.productId === prod.id || b.id === prod.id || b.id === item.bundleId);
        if (bundle) {
          bundle.remainingOfferQty = Math.max(0, (bundle.remainingOfferQty !== undefined ? bundle.remainingOfferQty : bundle.offerQty) - qty);
          bundle.soldQty = (bundle.soldQty || 0) + qty;
          bundle.updatedAt = new Date().toISOString();
        }
      }

      // Record movement in audit log
      const movement = {
        id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        date: new Date().toISOString(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        productId: prod.id,
        productName: prod.name,
        variantId: variant ? variant.id : null,
        variantTitle: variant ? variant.title : null,
        sku: variant ? variant.sku : prod.sku,
        type: 'sale_deduction',
        quantity: -qty,
        previousStock: variant ? prevVariantStock : prevProductStock,
        remainingStock: variant ? variant.stock : prod.stock,
        parentPreviousStock: prevProductStock,
        parentRemainingStock: prod.stock,
        notes: `خصم بيع آلي للطلب #${order.orderNumber} (${triggerSource})`
      };

      allData.inventory_movements.unshift(movement);
      deductionDetails.push({
        productId: prod.id,
        productName: prod.name,
        variantId: variant ? variant.id : null,
        variantTitle: variant ? variant.title : null,
        deducted: qty,
        remainingVariantStock: variant ? variant.stock : null,
        remainingProductStock: prod.stock
      });
    }

    // Cap inventory movements at 500
    if (allData.inventory_movements.length > 500) {
      allData.inventory_movements = allData.inventory_movements.slice(0, 500);
    }

    // Mark order as stock deducted
    const orderIndex = (allData.orders || []).findIndex(o => o.id === order.id);
    if (orderIndex > -1) {
      allData.orders[orderIndex].stockDeducted = true;
      allData.orders[orderIndex].stockDeductedAt = new Date().toISOString();
      allData.orders[orderIndex].stockDeductionSource = triggerSource;
      allData.orders[orderIndex].stockRestored = false;
    }

    this.db.saveData(allData);

    this.db.recordAuditLog(
      'خصم مخزون تلقائي',
      `الطلب #${order.orderNumber}`,
      'نظام المخزون المتكامل',
      `تم خصم كميات الطلب وتحديث المخزون الإجمالي والمتغيرات بنجاح (${triggerSource})`
    );

    return {
      success: true,
      order: allData.orders ? allData.orders[orderIndex] : order,
      deductionDetails
    };
  }

  /**
   * 5. Handle Order Cancellation and Returns with Double-Restoration Prevention
   */
  restoreOrderStock(orderOrId, reason = 'cancellation', notes = '') {
    const orderId = typeof orderOrId === 'object' ? orderOrId.id : orderOrId;
    const order = this.db.find('orders', orderId);
    if (!order) {
      return { success: false, error: 'order_not_found', message: `الطلب رقم ${orderId} غير موجود` };
    }

    // Guard 1: Prevent double restoration
    if (order.stockRestored === true) {
      return {
        success: false,
        alreadyRestored: true,
        message: `تم استرجاع المخزون مسبقاً لهذا الطلب #${order.orderNumber} (بتاريخ: ${order.stockRestoredAt})، تم منع الإعادة المكررة بأمان.`
      };
    }

    // Guard 2: Only restore if stock was previously deducted
    if (order.stockDeducted !== true) {
      return {
        success: false,
        skipped: true,
        message: `لم يتم خصم المخزون مسبقاً لهذا الطلب #${order.orderNumber}، لذا لم يتم تنفيذ استرجاع المخزون.`
      };
    }

    const allData = this.db.getAllData();
    const products = allData.products || [];
    if (!allData.inventory_movements) allData.inventory_movements = [];

    const restoredDetails = [];

    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) continue;

      const qty = parseInt(item.quantity, 10) || 1;
      let variant = null;
      let prevVariantStock = null;
      let prevProductStock = prod.stock;

      if (item.variantId && item.variantId !== 'default' && prod.variants) {
        variant = prod.variants.find(v => v.id === item.variantId);
        if (variant) {
          prevVariantStock = variant.stock;
          variant.stock += qty;
          // Synchronize parent product total
          prod.stock = prod.variants.reduce((s, vr) => s + (parseInt(vr.stock, 10) || 0), 0);
          prod.hasVariants = true;
        }
      } else if (prod.variants && prod.variants.length > 0) {
        variant = prod.variants[0];
        if (variant) {
          prevVariantStock = variant.stock;
          variant.stock += qty;
          prod.stock = prod.variants.reduce((s, vr) => s + (parseInt(vr.stock, 10) || 0), 0);
          prod.hasVariants = true;
        }
      } else {
        prod.stock += qty;
      }

      if (prod.isBundle || prod.productType === 'bundle' || item.isBundle) {
        const bundle = (allData.bundles || []).find(b => b.productId === prod.id || b.id === prod.id || b.id === item.bundleId);
        if (bundle) {
          bundle.remainingOfferQty = Math.min(bundle.offerQty, (bundle.remainingOfferQty !== undefined ? bundle.remainingOfferQty : bundle.offerQty) + qty);
          bundle.soldQty = Math.max(0, (bundle.soldQty || 0) - qty);
          bundle.updatedAt = new Date().toISOString();
        }
      }

      // Record movement
      const movement = {
        id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        date: new Date().toISOString(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        productId: prod.id,
        productName: prod.name,
        variantId: variant ? variant.id : null,
        variantTitle: variant ? variant.title : null,
        sku: variant ? variant.sku : prod.sku,
        type: reason === 'return' ? 'return_restoration' : 'cancel_restoration',
        quantity: +qty,
        previousStock: variant ? prevVariantStock : prevProductStock,
        remainingStock: variant ? variant.stock : prod.stock,
        parentPreviousStock: prevProductStock,
        parentRemainingStock: prod.stock,
        notes: notes || (reason === 'return'
          ? `استرجاع مخزون بعد إرجاع الطلب #${order.orderNumber}`
          : `إعادة مخزون بعد إلغاء الطلب #${order.orderNumber}`)
      };

      allData.inventory_movements.unshift(movement);
      restoredDetails.push({
        productId: prod.id,
        productName: prod.name,
        variantId: variant ? variant.id : null,
        variantTitle: variant ? variant.title : null,
        restored: qty,
        remainingVariantStock: variant ? variant.stock : null,
        remainingProductStock: prod.stock
      });
    }

    // Mark order as restored
    const orderIndex = (allData.orders || []).findIndex(o => o.id === order.id);
    if (orderIndex > -1) {
      allData.orders[orderIndex].stockRestored = true;
      allData.orders[orderIndex].stockRestoredAt = new Date().toISOString();
      allData.orders[orderIndex].stockRestoreReason = reason;
      allData.orders[orderIndex].stockDeducted = false; // reset deduction flag so it's not active
    }

    this.db.saveData(allData);

    this.db.recordAuditLog(
      reason === 'return' ? 'إرجاع مخزون منتج' : 'إعادة مخزون طلب ملغي',
      `الطلب #${order.orderNumber}`,
      'مدير المتجر / نظام المخزون',
      `تم استرجاع كميات المنتجات إلى المتغيرات والمخزون الإجمالي (${reason === 'return' ? 'طلب مرتجع' : 'طلب ملغي'})`
    );

    return {
      success: true,
      order: allData.orders ? allData.orders[orderIndex] : order,
      restoredDetails
    };
  }

  /**
   * Safe Manual Variant Stock Adjustment
   */
  updateVariantStock(productId, variantId, newStock, reason = 'manual_adjustment') {
    const prod = this.db.find('products', productId);
    if (!prod || !prod.variants) return null;

    const variant = prod.variants.find(v => v.id === variantId);
    if (!variant) return null;

    const prevVarStock = variant.stock;
    const prevProdStock = prod.stock;
    const safeStock = Math.max(0, parseInt(newStock, 10) || 0);
    const delta = safeStock - prevVarStock;

    variant.stock = safeStock;
    prod.stock = prod.variants.reduce((s, vr) => s + (parseInt(vr.stock, 10) || 0), 0);
    prod.hasVariants = true;

    // Movement
    const movement = {
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      productId: prod.id,
      productName: prod.name,
      variantId: variant.id,
      variantTitle: variant.title,
      sku: variant.sku || prod.sku,
      type: 'manual_variant_adjustment',
      quantity: delta,
      previousStock: prevVarStock,
      remainingStock: variant.stock,
      parentPreviousStock: prevProdStock,
      parentRemainingStock: prod.stock,
      notes: `تعديل يدوي لمخزون التركيبة "${variant.title}" بمقدار (${delta >= 0 ? '+' : ''}${delta}) - ${reason}`
    };

    const allData = this.db.getAllData();
    const pIdx = (allData.products || []).findIndex(p => p.id === productId);
    if (pIdx > -1) {
      allData.products[pIdx] = prod;
    }
    if (!allData.inventory_movements) allData.inventory_movements = [];
    allData.inventory_movements.unshift(movement);

    this.db.saveData(allData);

    this.db.recordAuditLog(
      'تعديل مخزون تركيبة',
      `${prod.name} (${variant.title})`,
      'مدير المتجر',
      `تم تعديل مخزون التركيبة من ${prevVarStock} إلى ${variant.stock} قطعة (المخزون الإجمالي الجديد: ${prod.stock})`
    );

    return prod;
  }

  /**
   * Quick adjust variant stock by delta (+1, -1, +5, etc.)
   */
  adjustVariantStock(productId, variantId, delta) {
    const prod = this.db.find('products', productId);
    if (!prod || !prod.variants) return null;
    const variant = prod.variants.find(v => v.id === variantId);
    if (!variant) return null;
    const targetStock = Math.max(0, variant.stock + delta);
    return this.updateVariantStock(productId, variantId, targetStock, `تعديل سريع (${delta > 0 ? '+' : ''}${delta})`);
  }

  /**
   * Idempotent Payment Webhook Processor (Handles duplicate webhooks cleanly)
   */
  processPaymentWebhook(orderId, paymentInfo = {}) {
    const order = this.db.find('orders', orderId);
    if (!order) {
      return { status: 'error', error: 'order_not_found', message: 'الطلب غير موجود' };
    }

    // If stock already deducted, don't deduct again!
    if (order.stockDeducted) {
      return {
        status: 'success',
        duplicateIgnored: true,
        alreadyDeducted: true,
        message: `تم استلام إشعار الدفع مسبقاً، وتجاهل إعادة الخصم لحماية المخزون. الرصيد لم يتأثر.`,
        order
      };
    }

    // Deduct stock safely
    const res = this.deductOrderStock(orderId, 'payment_webhook');
    if (res.success) {
      this.db.update('orders', orderId, {
        paymentStatus: 'مدفوع',
        paymentGatewayTxId: paymentInfo.transactionId || ('TX-' + Date.now())
      });
      return {
        status: 'success',
        deducted: true,
        message: `تم تأكيد الدفع وخصم المخزون بنجاح لأول مرة.`,
        order: this.db.find('orders', orderId)
      };
    } else {
      return {
        status: 'error',
        error: res.error,
        message: res.message
      };
    }
  }

  /**
   * Calculate available bundles based on components inventory and remaining offer qty
   */
  calculateAvailableBundles(bundleOrId) {
    const bundle = typeof bundleOrId === 'string' ? this.db.find('bundles', bundleOrId) : bundleOrId;
    if (!bundle || bundle.status === 'inactive') return 0;

    const remainingOffer = Math.max(0, parseInt(bundle.remainingOfferQty !== undefined ? bundle.remainingOfferQty : bundle.offerQty, 10) || 0);
    if (remainingOffer <= 0) return 0;

    if (!bundle.components || !Array.isArray(bundle.components) || bundle.components.length === 0) {
      return remainingOffer;
    }

    let minComponentSets = Infinity;
    const products = this.db.get('products') || [];

    for (const comp of bundle.components) {
      const prod = products.find(p => p.id === comp.productId);
      const reqQty = Math.max(1, parseInt(comp.quantity, 10) || 1);
      if (!prod) {
        minComponentSets = 0;
        break;
      }

      let availableStock = 0;
      if (comp.variantMode === 'fixed' && comp.fixedVariantId && prod.variants) {
        const vr = prod.variants.find(v => v.id === comp.fixedVariantId);
        availableStock = vr ? vr.stock : 0;
      } else if (comp.variantMode === 'customer_choice' && comp.allowedVariantIds && prod.variants) {
        availableStock = prod.variants
          .filter(v => comp.allowedVariantIds.includes(v.id))
          .reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
      } else if (prod.variants && prod.variants.length > 0) {
        availableStock = prod.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
      } else {
        availableStock = Math.max(0, parseInt(prod.stock, 10) || 0);
      }

      const possibleSets = Math.floor(availableStock / reqQty);
      if (possibleSets < minComponentSets) {
        minComponentSets = possibleSets;
      }
    }

    if (minComponentSets === Infinity) minComponentSets = 0;
    return Math.max(0, Math.min(remainingOffer, minComponentSets));
  }

  /**
   * Deduct Bundle Sale: Decrement remainingOfferQty and deduct each component's stock
   */
  deductBundleSale(bundleId, qty = 1, selectedVariants = {}) {
    const allData = this.db.getAllData();
    if (!allData.bundles) allData.bundles = [];
    const bundleIndex = allData.bundles.findIndex(b => b.id === bundleId || b.productId === bundleId);
    if (bundleIndex === -1) {
      return { success: false, error: 'bundle_not_found', message: 'الباقة غير موجودة' };
    }

    const bundle = allData.bundles[bundleIndex];
    if (bundle.remainingOfferQty < qty) {
      return { success: false, error: 'offer_exhausted', message: 'عذراً، كمية العرض المتبقية من هذه الباقة لا تكفي الطلب.' };
    }

    // Verify component stock
    for (const comp of (bundle.components || [])) {
      const prod = (allData.products || []).find(p => p.id === comp.productId);
      const reqTotal = (parseInt(comp.quantity, 10) || 1) * qty;
      if (!prod || prod.stock < reqTotal) {
        return { success: false, error: 'insufficient_component_stock', message: `مخزون المكون "${comp.productName || comp.productId}" غير كافٍ لتكوين الباقة.` };
      }
    }

    // Deduct remaining offer quantity
    bundle.remainingOfferQty -= qty;
    bundle.soldQty = (bundle.soldQty || 0) + qty;
    bundle.soldCount = (bundle.soldCount || 0) + qty;
    bundle.updatedAt = new Date().toISOString();

    // Deduct each component from original stock
    for (const comp of (bundle.components || [])) {
      const pIdx = (allData.products || []).findIndex(p => p.id === comp.productId);
      if (pIdx !== -1) {
        const prod = allData.products[pIdx];
        const reqTotal = (parseInt(comp.quantity, 10) || 1) * qty;

        const selVarId = (typeof selectedVariants === 'object' && selectedVariants ? selectedVariants[comp.productId] : null) || comp.fixedVariantId;
        if (selVarId && prod.variants) {
          const vIdx = prod.variants.findIndex(v => v.id === selVarId);
          if (vIdx !== -1) {
            prod.variants[vIdx].stock = Math.max(0, prod.variants[vIdx].stock - reqTotal);
          }
          prod.stock = prod.variants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);
        } else if (prod.variants && prod.variants.length > 0) {
          prod.variants[0].stock = Math.max(0, prod.variants[0].stock - reqTotal);
          prod.stock = prod.variants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);
        } else {
          prod.stock = Math.max(0, prod.stock - reqTotal);
        }

        // Add inventory movement
        if (!allData.inventory_movements) allData.inventory_movements = [];
        allData.inventory_movements.unshift({
          id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          date: new Date().toISOString(),
          productId: prod.id,
          productName: prod.name,
          type: 'sale_deduction',
          quantity: -reqTotal,
          remaining: prod.stock,
          notes: `خصم بيع مكون لباقة "${bundle.name}" (الكمية: ${qty} باقة)`
        });
      }
    }

    // Update corresponding product entry for bundle if exists
    if (bundle.productId) {
      const bpIdx = (allData.products || []).findIndex(p => p.id === bundle.productId);
      if (bpIdx !== -1) {
        allData.products[bpIdx].remainingOfferQty = bundle.remainingOfferQty;
        allData.products[bpIdx].soldQty = bundle.soldQty;
        allData.products[bpIdx].stock = this.calculateAvailableBundles(bundle);
      }
    }

    this.db.saveData(allData);
    this.db.recordAuditLog('بيع باقة ترويجية', bundle.name, 'نظام المبيعات', `تم بيع ${qty} باقة، وخصم مكوناتها من المخزون وتحديث المتبقي من العرض إلى ${bundle.remainingOfferQty}`);

    return { success: true, bundle, remainingOfferQty: bundle.remainingOfferQty };
  }

  /**
   * Restore Bundle Sale on full return or order cancellation
   */
  restoreBundleSale(bundleId, qty = 1, selectedVariants = {}, restoreStock = true) {
    const allData = this.db.getAllData();
    if (!allData.bundles) return { success: false };
    const bundleIndex = allData.bundles.findIndex(b => b.id === bundleId || b.productId === bundleId);
    if (bundleIndex === -1) return { success: false };

    const bundle = allData.bundles[bundleIndex];
    bundle.remainingOfferQty = Math.min(bundle.offerQty, bundle.remainingOfferQty + qty);
    bundle.soldQty = Math.max(0, (bundle.soldQty || 0) - qty);
    bundle.soldCount = Math.max(0, (bundle.soldCount || 0) - qty);
    bundle.updatedAt = new Date().toISOString();

    if (restoreStock) {
      for (const comp of (bundle.components || [])) {
        const pIdx = (allData.products || []).findIndex(p => p.id === comp.productId);
        if (pIdx !== -1) {
          const prod = allData.products[pIdx];
          const reqTotal = (parseInt(comp.quantity, 10) || 1) * qty;

          const selVarId = (typeof selectedVariants === 'object' && selectedVariants ? selectedVariants[comp.productId] : null) || comp.fixedVariantId;
          if (selVarId && prod.variants) {
            const vIdx = prod.variants.findIndex(v => v.id === selVarId);
            if (vIdx !== -1) {
              prod.variants[vIdx].stock += reqTotal;
            }
            prod.stock = prod.variants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);
          } else if (prod.variants && prod.variants.length > 0) {
            prod.variants[0].stock += reqTotal;
            prod.stock = prod.variants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);
          } else {
            prod.stock += reqTotal;
          }

          if (!allData.inventory_movements) allData.inventory_movements = [];
          allData.inventory_movements.unshift({
            id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            date: new Date().toISOString(),
            productId: prod.id,
            productName: prod.name,
            type: 'return_restoration',
            quantity: +reqTotal,
            remaining: prod.stock,
            notes: `استرجاع مكون باقة "${bundle.name}" بعد فحص الباقة وإعادتها للمخزون القابل للبيع`
          });
        }
      }
    }

    if (bundle.productId) {
      const bpIdx = (allData.products || []).findIndex(p => p.id === bundle.productId);
      if (bpIdx !== -1) {
        allData.products[bpIdx].remainingOfferQty = bundle.remainingOfferQty;
        allData.products[bpIdx].soldQty = bundle.soldQty;
        allData.products[bpIdx].stock = this.calculateAvailableBundles(bundle);
      }
    }

    this.db.saveData(allData);
    this.db.recordAuditLog('استرجاع باقة للمخزون', bundle.name, 'مدير المتجر / نظام الاسترجاع', `تم تحديث رصيد الباقة المتبقي إلى ${bundle.remainingOfferQty} وإعادة مكوناتها`);

    return { success: true, bundle };
  }
}

// Global Singleton
window.DB = new StoreDB();
window.InventoryEngine = new StoreInventoryEngine(window.DB);
window.DB.inventory = window.InventoryEngine;
