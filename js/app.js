// js/app.js - الإصدار المحدث مع توزيع الإعلانات الجديد
import { db } from './firebase-config.js';

// استيراد دوال Firebase مباشرة
import { 
    collection, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let allApps = [];
let currentFilter = 'all';
let visibleAppsCount = 5;
let currentDisplayedApps = [];

// إعدادات Adsterra
const adsterraConfig = {
    banner: {
        key: '5d17aac1d94f6ffe2742a2ce78e5b0b1',
        width: 320,
        height: 50
    },
    popunder: {
        script: '//pl28054761.effectivegatecpm.com/77/fa/de/77fade1a0c22ec2f2f9c4fb8723f5119.js'
    },
    largeBanner: {
        key: 'b2aa6af095dd52e3abeff8d9a46bcf2b',
        width: 728,
        height: 90
    },
    normalBanner: {
        key: '5d17aac1d94f6ffe2742a2ce78e5b0b1', // يمكنك تغيير هذا لمفتاح مختلف للإعلان العادي
        width: 300,
        height: 250
    }
};

// تنسيق التاريخ والوقت للعرض (الميلادي بالعربية)
function formatDateTime(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    
    try {
        const dateOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            calendar: 'gregory',
            numberingSystem: 'arab'
        };
        
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            numberingSystem: 'arab'
        };
        
        const datePart = date.toLocaleDateString('ar-SA', dateOptions);
        const timePart = date.toLocaleTimeString('ar-SA', timeOptions);
        return `${datePart} - ${timePart}`;
    } catch (error) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }
}

// تنسيق التاريخ فقط (بدون وقت)
function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    
    try {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            calendar: 'gregory',
            numberingSystem: 'arab'
        };
        return date.toLocaleDateString('ar-SA', options);
    } catch (error) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}

// بيانات تجريبية للاختبار
const sampleApps = [
    {
        id: '1',
        name: 'تطبيق التواصل الاجتماعي',
        description: 'تطبيق رائع للتواصل مع الأصدقاء والعائلة مع ميزات متقدمة مثل المراسلة الفورية ومشاركة الصور والفيديو والمحادثات الجماعية. يدعم اللغة العربية بشكل كامل ويتوافق مع جميع الأجهزة.',
        version: '1.0.0',
        size: '25',
        category: 'social',
        downloadURL: 'https://example.com/app1.zip',
        rating: 4.5,
        downloads: 1500,
        featured: true,
        trending: true,
        shareCount: 45,
        iconURL: '',
        createdAt: new Date('2024-03-15').toISOString(),
        updatedAt: new Date('2024-03-15').toISOString()
    },
    {
        id: '2',
        name: 'تطبيق الألعاب',
        description: 'ألعاب مسلية ومثيرة للجميع تحتوي على أكثر من 100 لعبة مختلفة. يشمل ألعاب الذكاء والألغاز والرياضة والسباقات. مناسب لجميع الأعمال مع واجهة مستخدم بديهية وسهلة الاستخدام.',
        version: '2.1.0',
        size: '45',
        category: 'games',
        downloadURL: 'https://example.com/app2.zip',
        rating: 4.2,
        downloads: 2300,
        trending: true,
        shareCount: 67,
        iconURL: '',
        createdAt: new Date('2024-03-14').toISOString(),
        updatedAt: new Date('2024-03-14').toISOString()
    },
    {
        id: '3',
        name: 'تطبيق الموسيقى',
        description: 'استمع إلى ملايين الأغاني والموسيقى من جميع أنحاء العالم. يدعم جميع الأنواع الموسيقية ويوفر تجربة استماع فريدة مع جودة صوت عالية.',
        version: '1.5.0',
        size: '35',
        category: 'entertainment',
        downloadURL: 'https://example.com/app3.zip',
        rating: 4.7,
        downloads: 3200,
        featured: true,
        shareCount: 89,
        iconURL: '',
        createdAt: new Date('2024-03-13').toISOString(),
        updatedAt: new Date('2024-03-13').toISOString()
    },
    {
        id: '4',
        name: 'تطبيق الإنتاجية',
        description: 'ادفع مهامك وإنتاجيتك إلى مستوى جديد مع هذا التطبيق المميز. يتضمن أدوات لإدارة المهام والتقويم والتذكيرات والمزيد.',
        version: '3.0.0',
        size: '28',
        category: 'productivity',
        downloadURL: 'https://example.com/app4.zip',
        rating: 4.3,
        downloads: 1800,
        shareCount: 34,
        iconURL: '',
        createdAt: new Date('2024-03-12').toISOString(),
        updatedAt: new Date('2024-03-12').toISOString()
    },
    {
        id: '5',
        name: 'تطبيق التعليم',
        description: 'تعلم لغات جديدة ومهارات متنوعة من خلال دورات تفاعلية وشيقة. مناسب لجميع المستويات والأعمار.',
        version: '2.2.0',
        size: '42',
        category: 'education',
        downloadURL: 'https://example.com/app5.zip',
        rating: 4.6,
        downloads: 2700,
        featured: true,
        shareCount: 56,
        iconURL: '',
        createdAt: new Date('2024-03-11').toISOString(),
        updatedAt: new Date('2024-03-11').toISOString()
    },
    {
        id: '6',
        name: 'تطبيق الأدوات',
        description: 'مجموعة متكاملة من الأدوات الذكية التي تحتاجها في حياتك اليومية. بسيط وسهل الاستخدام مع واجهة أنيقة.',
        version: '1.8.0',
        size: '19',
        category: 'utility',
        downloadURL: 'https://example.com/app6.zip',
        rating: 4.1,
        downloads: 1400,
        shareCount: 23,
        iconURL: '',
        createdAt: new Date('2024-03-10').toISOString(),
        updatedAt: new Date('2024-03-10').toISOString()
    },
    {
        id: '7',
        name: 'تطبيق التصوير',
        description: 'التقط صوراً مذهلة واحترافية باستخدام هذا التطبيق المتقدم. يتضمن فلاتر ومؤثرات احترافية.',
        version: '2.5.0',
        size: '52',
        category: 'entertainment',
        downloadURL: 'https://example.com/app7.zip',
        rating: 4.4,
        downloads: 2100,
        trending: true,
        shareCount: 78,
        iconURL: '',
        createdAt: new Date('2024-03-09').toISOString(),
        updatedAt: new Date('2024-03-09').toISOString()
    },
    {
        id: '8',
        name: 'تطبيق اللياقة',
        description: 'احصل على جسم مثالي مع تمارين يومية وخطط تغذية متكاملة. مناسب للمبتدئين والمحترفين.',
        version: '1.3.0',
        size: '38',
        category: 'utility',
        downloadURL: 'https://example.com/app8.zip',
        rating: 4.8,
        downloads: 1900,
        shareCount: 45,
        iconURL: '',
        createdAt: new Date('2024-03-08').toISOString(),
        updatedAt: new Date('2024-03-08').toISOString()
    }
];

// تحميل إعلان البانر العلوي
function loadBannerAd() {
    const bannerContainer = document.getElementById('topBannerAd');
    if (!bannerContainer) return;

    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.innerHTML = `
        atOptions = {
            'key' : '${adsterraConfig.banner.key}',
            'format' : 'iframe',
            'height' : ${adsterraConfig.banner.height},
            'width' : ${adsterraConfig.banner.width},
            'params' : {}
        };
    `;

    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/' + adsterraConfig.banner.key + '/invoke.js';
    script2.async = true;

    bannerContainer.appendChild(script1);
    bannerContainer.appendChild(script2);
}

// تحميل الإعلان المنبثق
function loadPopunderAd() {
    // لا تحميل للمسؤولين
    if (isAdmin()) return;
    
    // تحميل مرة واحدة فقط في الجلسة
    if (sessionStorage.getItem('popunderLoaded')) return;

    setTimeout(() => {
        const popunderScript = document.createElement('script');
        popunderScript.type = 'text/javascript';
        popunderScript.src = adsterraConfig.popunder.script;
        popunderScript.async = true;
        
        document.body.appendChild(popunderScript);
        
        // وضع علامة أن الإعلان تم تحميله
        sessionStorage.setItem('popunderLoaded', 'true');
    }, 3000); // تأخير 3 ثواني
}

// إنشاء رابط المشاركة
function generateShareLink(appId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}share.html?app=${appId}`;
}

// مشاركة التطبيق
async function shareApp(appId, appName) {
    const shareUrl = generateShareLink(appId);
    
    try {
        const app = allApps.find(a => a.id === appId);
        const currentShares = app.shareCount || 0;
        
        // تحديث البيانات المحلية
        app.shareCount = currentShares + 1;

        if (navigator.share) {
            await navigator.share({
                title: `تحميل ${appName}`,
                text: `اكتشف هذا التطبيق الرائع: ${appName}`,
                url: shareUrl,
            });
            showTempMessage('تم مشاركة التطبيق بنجاح!', 'success');
        } else {
            await navigator.clipboard.writeText(shareUrl);
            showTempMessage('تم نسخ رابط المشاركة إلى الحافظة!', 'success');
        }
        
        updateCurrentDisplay();
        
    } catch (error) {
        console.error('Error sharing app:', error);
        if (error.name !== 'AbortError') {
            window.open(`https://twitter.com/intent/tweet?text=اكتشف هذا التطبيق الرائع: ${appName}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        }
    }
}

// تحميل التطبيقات من Firebase
async function loadApps() {
    try {
        console.log("بدء تحميل التطبيقات...");
        
        const appsContainer = document.getElementById('apps-list');
        
        if (appsContainer) appsContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل التطبيقات...</p></div>';

        const querySnapshot = await getDocs(collection(db, "apps"));
        allApps = [];
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                allApps.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log("تم تحميل التطبيقات من Firebase:", allApps.length);
        } else {
            allApps = sampleApps;
            console.log("تم استخدام البيانات التجريبية:", allApps.length);
        }
        
        // الترتيب: المميزة أولاً، ثم الشائعة، ثم المحدثة حديثاً
        allApps.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        displayApps(allApps.slice(0, visibleAppsCount));
        setupLoadMoreButton();
        
    } catch (error) {
        console.error("خطأ في تحميل التطبيقات:", error);
        
        allApps = sampleApps;
        allApps.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        displayApps(allApps.slice(0, visibleAppsCount));
        setupLoadMoreButton();
        
        const appsContainer = document.getElementById('apps-list');
        if (appsContainer) {
            appsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>تم تحميل بيانات تجريبية للعرض</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
}

// عرض التطبيقات الرئيسية
function displayApps(apps) {
    const appsContainer = document.getElementById('apps-list');
    currentDisplayedApps = apps;
    
    if (!appsContainer) {
        console.error("لم يتم العثور على عنصر apps-list");
        return;
    }
    
    if (apps.length === 0) {
        appsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>لا توجد تطبيقات متاحة</p></div>';
        return;
    }
    
    let html = '';
    apps.forEach((app, index) => {
        // إضافة بطاقة التطبيق
        html += createAppCard(app);
        
        // إعلان كبير بعد كل بطاقة تطبيق
        html += `
            <div class="ad-unit large-ad" id="ad-large-${app.id}">
                <div class="ad-container large">
                    <div class="ad-content">
                        <div class="ad-placeholder ad-loading">
                            <i class="fas fa-ad"></i>
                            <span>إعلان كبير - جاري التحميل...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إعلان عادي بعد كل 6 بطاقات
        if ((index + 1) % 6 === 0) {
            html += `
                <div class="ad-unit" id="ad-normal-${app.id}">
                    <div class="ad-container">
                        <div class="ad-content">
                            <div class="ad-placeholder ad-loading">
                                <i class="fas fa-ad"></i>
                                <span>جاري تحميل الإعلان...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    appsContainer.innerHTML = html;
    setupDescriptionToggle();
    
    setTimeout(() => {
        loadAds();
    }, 500);
    
    console.log("تم عرض التطبيقات الرئيسية:", apps.length);
}

// إنشاء بطاقة تطبيق
function createAppCard(app) {
    const iconClass = getAppIcon(app.category);
    const ratingStars = generateRatingStars(app.rating);
    
    const appIcon = app.iconURL 
        ? `<div class="app-icon"><img src="${app.iconURL}" alt="${app.name}"></div>`
        : `<div class="app-icon"><i class="${iconClass}"></i></div>`;
    
    return `
        <div class="app-card" data-category="${app.category}" data-id="${app.id}">
            <div class="app-header">
                ${appIcon}
                <div class="app-info">
                    <h4>${app.name}</h4>
                    <div class="app-category">${getCategoryName(app.category)}</div>
                </div>
            </div>
            <div class="app-description-container">
                <p class="app-description">${app.description}</p>
                ${app.description && app.description.length > 100 ? '<span class="show-more">عرض المزيد</span>' : ''}
            </div>
            <div class="app-meta">
                <div class="app-version">الإصدار: ${app.version}</div>
                <div class="app-size">${app.size} MB</div>
            </div>
            <div class="app-meta">
                <div class="app-rating">
                    ${ratingStars}
                    <span>${app.rating || 'غير مقيم'}</span>
                </div>
                <div class="app-downloads">${app.downloads || 0} تنزيل</div>
            </div>
            <div class="app-date-info">
                <div class="date-item">
                    <i class="fas fa-calendar-plus"></i>
                    <span>أضيف في: ${formatDate(app.createdAt)}</span>
                </div>
            </div>
            ${app.featured ? '<div class="featured-badge">⭐ مميز</div>' : ''}
            ${app.trending ? '<div class="trending-badge">🔥 شائع</div>' : ''}
            <div class="app-actions">
                <button class="download-btn" onclick="downloadApp('${app.downloadURL}', '${app.id}')">
                    <i class="fas fa-download"></i>
                    تحميل
                </button>
                <button class="share-btn" onclick="shareApp('${app.id}', '${app.name}')">
                    <i class="fas fa-share-alt"></i>
                </button>
                ${isAdmin() ? `
                    <button class="delete-btn" onclick="deleteApp('${app.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// تحميل الإعلانات
function loadAds() {
    const adUnits = document.querySelectorAll('.ad-unit');
    
    adUnits.forEach((unit, index) => {
        const container = unit.querySelector('.ad-container');
        const isLarge = unit.classList.contains('large-ad');
        
        container.innerHTML = '';
        
        const adId = `ad-${Date.now()}-${index}`;
        const adConfig = isLarge ? adsterraConfig.largeBanner : adsterraConfig.normalBanner;
        
        const adDiv = document.createElement('div');
        adDiv.id = adId;
        adDiv.className = 'ad-content';
        
        const script1 = document.createElement('script');
        script1.type = 'text/javascript';
        script1.innerHTML = `
            atOptions = {
                'key' : '${adConfig.key}',
                'format' : 'iframe',
                'height' : ${adConfig.height},
                'width' : ${adConfig.width},
                'params' : {}
            };
        `;
        
        const script2 = document.createElement('script');
        script2.type = 'text/javascript';
        script2.src = '//www.highperformanceformat.com/' + adConfig.key + '/invoke.js';
        script2.async = true;
        
        container.appendChild(script1);
        container.appendChild(adDiv);
        container.appendChild(script2);
        
        setTimeout(() => {
            if (!container.querySelector('iframe') && !container.innerHTML.includes('highperformanceformat')) {
                loadAdFallback(container, adId, isLarge);
            }
        }, 2000);
    });
}

// طريقة بديلة لتحميل الإعلان
function loadAdFallback(container, adId, isLarge = false) {
    container.innerHTML = '';
    
    const width = isLarge ? 728 : 300;
    const height = isLarge ? 90 : 250;
    
    const placeholder = document.createElement('div');
    placeholder.className = 'ad-placeholder';
    placeholder.innerHTML = `
        <i class="fas fa-ad"></i>
        <span>مساحة إعلانية ${width}×${height}</span>
        <small>${isLarge ? 'إعلان横幅 كبير' : 'إعلان عمودي'}</small>
    `;
    
    container.appendChild(placeholder);
}

// إعداد زر "عرض المزيد"
function setupLoadMoreButton() {
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (allApps.length > visibleAppsCount) {
        loadMoreContainer.style.display = 'block';
        loadMoreBtn.onclick = showMoreApps;
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

// عرض المزيد من التطبيقات
function showMoreApps() {
    visibleAppsCount += 5;
    const appsToShow = currentFilter === 'all' 
        ? allApps.slice(0, visibleAppsCount)
        : allApps.filter(app => app.category === currentFilter).slice(0, visibleAppsCount);
    
    displayApps(appsToShow);
    setupLoadMoreButton();
}

// تحديث العرض الحالي
function updateCurrentDisplay() {
    if (currentDisplayedApps.length > 0) {
        displayApps(currentDisplayedApps);
    }
}

// إضافة مستمعات الأحداث لعرض المزيد
function setupDescriptionToggle() {
    document.querySelectorAll('.show-more').forEach(btn => {
        btn.addEventListener('click', function() {
            const description = this.previousElementSibling;
            description.classList.toggle('expanded');
            this.textContent = description.classList.contains('expanded') ? 'عرض أقل' : 'عرض المزيد';
        });
    });
}

// توليد نجوم التقييم
function generateRatingStars(rating) {
    if (!rating) return '<span style="color: var(--text-light);">غير مقيم</span>';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// الحصول على أيقونة التطبيق حسب التصنيف
function getAppIcon(category) {
    const icons = {
        'games': 'fas fa-gamepad',
        'social': 'fas fa-comments',
        'entertainment': 'fas fa-film',
        'productivity': 'fas fa-briefcase',
        'education': 'fas fa-graduation-cap',
        'utility': 'fas fa-tools'
    };
    return icons[category] || 'fas fa-mobile-alt';
}

// الحصول على اسم التصنيف
function getCategoryName(category) {
    const categories = {
        'games': 'الألعاب',
        'social': 'التواصل الاجتماعي',
        'entertainment': 'الترفيه',
        'productivity': 'الإنتاجية',
        'education': 'التعليم',
        'utility': 'الأدوات'
    };
    return categories[category] || category;
}

// تصفية التطبيقات حسب الفئة
function filterApps(category) {
    console.log("تصفية التطبيقات حسب الفئة:", category);
    
    currentFilter = category;
    visibleAppsCount = 5;
    
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    const filteredApps = category === 'all' 
        ? allApps 
        : allApps.filter(app => app.category === category);
    
    displayApps(filteredApps.slice(0, visibleAppsCount));
    setupLoadMoreButton();
    
    document.getElementById('apps-list').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// البحث في التطبيقات
function searchApps() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log("الببحث عن:", searchTerm);
    
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        searchModal.style.display = 'none';
    }
    
    if (!searchTerm) {
        visibleAppsCount = 5;
        displayApps(allApps.slice(0, visibleAppsCount));
        setupLoadMoreButton();
        return;
    }
    
    const filteredApps = allApps.filter(app => 
        app.name.toLowerCase().includes(searchTerm) ||
        app.description.toLowerCase().includes(searchTerm) ||
        getCategoryName(app.category).toLowerCase().includes(searchTerm)
    );
    
    visibleAppsCount = filteredApps.length;
    displayApps(filteredApps);
    setupLoadMoreButton();
    
    const appsContainer = document.getElementById('apps-list');
    if (appsContainer && filteredApps.length > 0) {
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'search-results-header';
        resultsHeader.innerHTML = `<p>عرض ${filteredApps.length} نتيجة للبحث عن: "${searchTerm}"</p>`;
        appsContainer.insertBefore(resultsHeader, appsContainer.firstChild);
    }
}

// البحث المباشر (عند الضغط على Enter)
function performSearch() {
    searchApps();
}

// تحميل التطبيق
function downloadApp(downloadURL, appId) {
    console.log("تحميل التطبيق:", appId);
    
    const app = allApps.find(app => app.id === appId);
    if (app) {
        app.downloads = (app.downloads || 0) + 1;
        updateCurrentDisplay();
    }
    
    if (downloadURL && downloadURL !== 'https://example.com/app1.zip') {
        window.open(downloadURL, '_blank');
    } else {
        alert('هذا رابط تجريبي. في التطبيق الحقيقي، سيبدأ التحميل.');
    }
    
    showTempMessage('جاري تحميل التطبيق...', 'success');
}

// حذف التطبيق (للمسؤول فقط)
async function deleteApp(appId) {
    if (!confirm('هل أنت متأكد من حذف هذا التطبيق؟')) return;
    
    try {
        console.log("جاري حذف التطبيق:", appId);
        
        const app = allApps.find(app => app.id === appId);
        if (app && !sampleApps.some(sample => sample.id === appId)) {
            await deleteDoc(doc(db, "apps", appId));
        }
        
        allApps = allApps.filter(app => app.id !== appId);
        currentDisplayedApps = currentDisplayedApps.filter(app => app.id !== appId);
        
        displayApps(currentDisplayedApps);
        setupLoadMoreButton();
        
        showTempMessage('تم حذف التطبيق بنجاح', 'success');
        
    } catch (error) {
        console.error("خطأ في حذف التطبيق:", error);
        showTempMessage('خطأ في حذف التطبيق', 'error');
    }
}

// التحقق إذا كان المستخدم مسؤولاً
function isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
}

// عرض رسالة مؤقتة
function showTempMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
        <span>${text}</span>
    `;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// عرض الأقسام الخاصة
function displaySpecialSection(section) {
    document.querySelectorAll('.special-section-content').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector(`.section-tab[data-section="${section}"]`).classList.add('active');
    
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
        
        let specialApps = [];
        
        switch(section) {
            case 'featured':
                specialApps = allApps.filter(app => app.featured);
                break;
            case 'trending':
                specialApps = allApps.filter(app => app.trending);
                break;
            case 'top':
                specialApps = allApps.filter(app => app.rating >= 4.5);
                break;
        }
        
        const appsContainer = document.getElementById(`${section}-apps`);
        if (appsContainer) {
            if (specialApps.length === 0) {
                appsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>لا توجد تطبيقات في هذا القسم</p></div>';
            } else {
                let html = '';
                specialApps.forEach((app, index) => {
                    html += createAppCard(app);
                    
                    // إعلان كبير بعد كل بطاقة في الأقسام الخاصة أيضاً
                    html += `
                        <div class="ad-unit large-ad" id="ad-special-large-${app.id}">
                            <div class="ad-container large">
                                <div class="ad-content">
                                    <div class="ad-placeholder ad-loading">
                                        <i class="fas fa-ad"></i>
                                        <span>إعلان كبير - جاري التحميل...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // إعلان عادي بعد كل 6 بطاقات في الأقسام الخاصة
                    if ((index + 1) % 6 === 0) {
                        html += `
                            <div class="ad-unit" id="ad-special-normal-${app.id}">
                                <div class="ad-container">
                                    <div class="ad-content">
                                        <div class="ad-placeholder ad-loading">
                                            <i class="fas fa-ad"></i>
                                            <span>جاري تحميل الإعلان...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
                appsContainer.innerHTML = html;
                setupDescriptionToggle();
                
                setTimeout(() => {
                    loadAds();
                }, 500);
            }
        }
        
        sectionElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// إعداد التنقل في الشريط السفلي
function setupBottomNavigation() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            bottomNavItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const target = this.getAttribute('href');
            console.log("النقر على:", target);
            
            switch(target) {
                case '#games':
                    filterApps('games');
                    break;
                case '#apps':
                    filterApps('all');
                    break;
                case '#search':
                    document.getElementById('searchModal').style.display = 'block';
                    break;
            }
        });
    });
}

// إعداد أحداث الفئات للشريط الأفقي
function setupCategoryEvents() {
    const categoryFilters = document.querySelectorAll('.category-filter');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            categoryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// إعداد أزرار الأقسام الخاصة
function setupSectionTabs() {
    const sectionTabs = document.querySelectorAll('.section-tab');
    
    sectionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const section = this.dataset.section;
            displaySpecialSection(section);
        });
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("تهيئة صفحة المتجر...");
    
    // تحميل التطبيقات
    loadApps();
    
    // تحميل إعلان البانر
    loadBannerAd();
    
    // تحميل الإعلان المنبثق
    loadPopunderAd();
    
    // إعداد مستمعات الأحداث للبحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // إعداد التنقل في الشريط السفلي
    setupBottomNavigation();
    
    // إعداد أحداث الفئات
    setupCategoryEvents();
    
    // إعداد أزرار الأقسام الخاصة
    setupSectionTabs();
    
    console.log("تم تهيئة صفحة المتجر بالكامل");
});

// جعل الدوال متاحة globally
window.filterApps = filterApps;
window.searchApps = searchApps;
window.performSearch = performSearch;
window.downloadApp = downloadApp;
window.deleteApp = deleteApp;
window.shareApp = shareApp;
window.displaySpecialSection = displaySpecialSection;
