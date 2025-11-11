// js/app.js - الإصدار الكامل والمحدث
import { db, collection, getDocs, deleteDoc, doc } from './firebase-config.js';

let allApps = [];
let currentFilter = 'all';

// بيانات تجريبية للاختبار
const sampleApps = [
    {
        id: '1',
        name: 'تطبيق التواصل الاجتماعي',
        description: 'تطبيق رائع للتواصل مع الأصدقاء والعائلة',
        version: '1.0.0',
        size: '25',
        category: 'social',
        downloadURL: 'https://example.com/app1.zip',
        rating: 4.5,
        downloads: 1500,
        featured: true
    },
    {
        id: '2',
        name: 'تطبيق الألعاب',
        description: 'ألعاب مسلية ومثيرة للجميع',
        version: '2.1.0',
        size: '45',
        category: 'games',
        downloadURL: 'https://example.com/app2.zip',
        rating: 4.2,
        downloads: 2300,
        trending: true
    },
    {
        id: '3',
        name: 'تطبيق الإنتاجية',
        description: 'زود إنتاجيتك مع هذا التطبيق المميز',
        version: '1.5.0',
        size: '30',
        category: 'productivity',
        downloadURL: 'https://example.com/app3.zip',
        rating: 4.8,
        downloads: 1800,
        featured: true
    },
    {
        id: '4',
        name: 'تطبيق الترفيه',
        description: 'استمتع بأفضل محتوى ترفيهي',
        version: '3.0.1',
        size: '35',
        category: 'entertainment',
        downloadURL: 'https://example.com/app4.zip',
        rating: 4.3,
        downloads: 1200,
        trending: true
    },
    {
        id: '5',
        name: 'تطبيق التعليم',
        description: 'تعلم مهارات جديدة بسهولة',
        version: '2.0.0',
        size: '28',
        category: 'education',
        downloadURL: 'https://example.com/app5.zip',
        rating: 4.6,
        downloads: 900
    },
    {
        id: '6',
        name: 'تطبيق الأدوات',
        description: 'أدوات مفيدة لحياتك اليومية',
        version: '1.2.0',
        size: '22',
        category: 'utility',
        downloadURL: 'https://example.com/app6.zip',
        rating: 4.1,
        downloads: 750
    }
];

// تحميل التطبيقات من Firebase
async function loadApps() {
    try {
        console.log("بدء تحميل التطبيقات...");
        
        const appsContainer = document.getElementById('apps-list');
        const featuredContainer = document.getElementById('featured-apps');
        const trendingContainer = document.getElementById('trending-apps');
        
        // عرض حالة التحميل
        if (appsContainer) appsContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل التطبيقات...</p></div>';
        if (featuredContainer) featuredContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل التطبيقات المميزة...</p></div>';
        if (trendingContainer) trendingContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل التطبيقات الشائعة...</p></div>';

        // محاولة تحميل التطبيقات من Firebase
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
            // استخدام البيانات التجريبية إذا لم توجد بيانات في Firebase
            allApps = sampleApps;
            console.log("تم استخدام البيانات التجريبية:", allApps.length);
        }
        
        // عرض التطبيقات في الأقسام المختلفة
        displayApps(allApps);
        displayFeaturedApps();
        displayTrendingApps();
        
    } catch (error) {
        console.error("خطأ في تحميل التطبيقات:", error);
        
        // في حالة الخطأ، استخدام البيانات التجريبية
        allApps = sampleApps;
        displayApps(allApps);
        displayFeaturedApps();
        displayTrendingApps();
        
        // عرض رسالة خطأ
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
    
    if (!appsContainer) {
        console.error("لم يتم العثور على عنصر apps-list");
        return;
    }
    
    if (apps.length === 0) {
        appsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>لا توجد تطبيقات متاحة</p></div>';
        return;
    }
    
    appsContainer.innerHTML = apps.map(app => createAppCard(app)).join('');
    console.log("تم عرض التطبيقات الرئيسية:", apps.length);
}

// عرض التطبيقات المميزة
function displayFeaturedApps() {
    const featuredContainer = document.getElementById('featured-apps');
    
    if (!featuredContainer) {
        console.error("لم يتم العثور على عنصر featured-apps");
        return;
    }
    
    // التطبيقات المميزة هي التي لديها تقييم عالي أو marked as featured
    const featuredApps = allApps
        .filter(app => app.featured || (app.rating && app.rating >= 4.0))
        .slice(0, 4);
    
    if (featuredApps.length === 0) {
        featuredContainer.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>لا توجد تطبيقات مميزة</p></div>';
        return;
    }
    
    featuredContainer.innerHTML = featuredApps.map(app => createAppCard(app)).join('');
    console.log("تم عرض التطبيقات المميزة:", featuredApps.length);
}

// عرض التطبيقات الشائعة
function displayTrendingApps() {
    const trendingContainer = document.getElementById('trending-apps');
    
    if (!trendingContainer) {
        console.error("لم يتم العثور على عنصر trending-apps");
        return;
    }
    
    // التطبيقات الشائعة هي التي لديها تنزيلات عالية أو marked as trending
    const trendingApps = allApps
        .filter(app => app.trending || (app.downloads && app.downloads > 1000))
        .slice(0, 6);
    
    if (trendingApps.length === 0) {
        // إذا لم توجد تطبيقات شائعة، نعرض بعض التطبيقات العشوائية
        const randomApps = [...allApps].sort(() => 0.5 - Math.random()).slice(0, 4);
        trendingContainer.innerHTML = randomApps.map(app => createAppCard(app)).join('');
    } else {
        trendingContainer.innerHTML = trendingApps.map(app => createAppCard(app)).join('');
    }
    
    console.log("تم عرض التطبيقات الشائعة:", trendingApps.length);
}

// إنشاء بطاقة تطبيق
// إنشاء بطاقة تطبيق
function createAppCard(app) {
    const iconClass = getAppIcon(app.category);
    const ratingStars = generateRatingStars(app.rating);
    
    // استخدام الأيقونة المخصصة إذا كانت متاحة
    const appIcon = app.iconURL 
        ? `<img src="${app.iconURL}" alt="${app.name}" class="app-icon-img">`
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
            <p class="app-description">${app.description}</p>
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
            ${app.featured ? '<div class="featured-badge">مميز</div>' : ''}
            ${app.trending ? '<div class="trending-badge">شائع</div>' : ''}
            <div class="app-actions">
                <button class="download-btn" onclick="downloadApp('${app.downloadURL}', '${app.id}')">
                    <i class="fas fa-download"></i>
                    تحميل
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

// توليد نجوم التقييم
function generateRatingStars(rating) {
    if (!rating) return '<span style="color: var(--text-light);">غير مقيم</span>';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // نجوم كاملة
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // نصف نجمة
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // نجوم فارغة
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
    
    // تحديث حالة الأزرار النشطة في الفئات
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // إضافة active للفئة المحددة
    const activeCategory = document.querySelector(`.category-card[onclick*="${category}"]`);
    if (activeCategory) {
        activeCategory.classList.add('active');
    }
    
    const filteredApps = category === 'all' 
        ? allApps 
        : allApps.filter(app => app.category === category);
    
    displayApps(filteredApps);
    
    // التمرير إلى قسم التطبيقات
    document.getElementById('apps-list').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// البحث في التطبيقات
function searchApps() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log("الببحث عن:", searchTerm);
    
    if (!searchTerm) {
        displayApps(allApps);
        return;
    }
    
    const filteredApps = allApps.filter(app => 
        app.name.toLowerCase().includes(searchTerm) ||
        app.description.toLowerCase().includes(searchTerm) ||
        getCategoryName(app.category).toLowerCase().includes(searchTerm)
    );
    
    displayApps(filteredApps);
    
    // إغلاق نافذة البحث بعد النتائج
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        searchModal.style.display = 'none';
    }
    
    // إظهار عدد النتائج
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
    
    // زيادة عداد التنزيلات محلياً
    const app = allApps.find(app => app.id === appId);
    if (app) {
        app.downloads = (app.downloads || 0) + 1;
        
        // تحديث واجهة المستخدم
        const appCard = document.querySelector(`.app-card[data-id="${appId}"]`);
        if (appCard) {
            const downloadsElement = appCard.querySelector('.app-downloads');
            if (downloadsElement) {
                downloadsElement.textContent = `${app.downloads} تنزيل`;
            }
        }
    }
    
    // فتح رابط التحميل في نافذة جديدة
    if (downloadURL && downloadURL !== 'https://example.com/app1.zip') {
        window.open(downloadURL, '_blank');
    } else {
        // إذا كان الرابط تجريبي، عرض رسالة
        alert('هذا رابط تجريبي. في التطبيق الحقيقي، سيبدأ التحميل.');
    }
    
    // إظهار رسالة نجاح
    showTempMessage('جاري تحميل التطبيق...', 'success');
}

// حذف التطبيق (للمسؤول فقط)
async function deleteApp(appId) {
    if (!confirm('هل أنت متأكد من حذف هذا التطبيق؟')) return;
    
    try {
        console.log("جاري حذف التطبيق:", appId);
        
        // حذف من Firebase إذا كان التطبيق مخزناً هناك
        const app = allApps.find(app => app.id === appId);
        if (app && !sampleApps.some(sample => sample.id === appId)) {
            await deleteDoc(doc(db, "apps", appId));
        }
        
        // إزالة من المصفوفة المحلية
        allApps = allApps.filter(app => app.id !== appId);
        
        // إعادة تحميل القوائم
        displayApps(allApps);
        displayFeaturedApps();
        displayTrendingApps();
        
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
    // إنشاء عنصر الرسالة
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
        <span>${text}</span>
    `;
    
    // إضافة الأنماط
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
    
    // إضافة الرسالة إلى الصفحة
    document.body.appendChild(messageDiv);
    
    // إزالة الرسالة بعد 3 ثواني
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// إضافة أنماط CSS للرسائل المتحركة
const messageStyles = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.search-results-header {
    background: var(--primary-light);
    padding: 1rem;
    border-radius: var(--radius);
    margin-bottom: 1rem;
    text-align: center;
    color: var(--primary);
    font-weight: 500;
    grid-column: 1 / -1;
}

.empty-state, .error-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 2rem;
    color: var(--text-secondary);
}

.empty-state i, .error-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--text-light);
}

.error-state i {
    color: #ef4444;
}

.category-card.active {
    border-color: var(--primary);
    background: var(--primary-light);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
}
`;

// إضافة الأنماط إلى الصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = messageStyles;
document.head.appendChild(styleSheet);

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("تهيئة صفحة المتجر...");
    
    // تحميل التطبيقات
    loadApps();
    
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
    
    console.log("تم تهيئة صفحة المتجر بالكامل");
});

// إعداد التنقل في الشريط السفلي
function setupBottomNavigation() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة النشاط من جميع العناصر
            bottomNavItems.forEach(i => i.classList.remove('active'));
            
            // إضافة النشاط للعنصر الحالي
            this.classList.add('active');
            
            const target = this.getAttribute('href');
            console.log("النقر على:", target);
            
            // تنفيذ الإجراء المناسب
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

// إعداد أحداث الفئات
function setupCategoryEvents() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            // إزالة النشاط من جميع الفئات
            categoryCards.forEach(c => c.classList.remove('active'));
            
            // إضافة النشاط للفئة المحددة
            this.classList.add('active');
        });
    });
}

// جعل الدوال متاحة globally
window.filterApps = filterApps;
window.searchApps = searchApps;
window.performSearch = performSearch;
window.downloadApp = downloadApp;
window.deleteApp = deleteApp;

// تصدير الدوال للاستخدام في ملفات أخرى
export { loadApps, filterApps, searchApps, downloadApp, deleteApp };


// نظام إدارة الصور المحسن
function initializeImageSystem() {
    // معالجة جميع الصور في الموقع
    const allImages = document.querySelectorAll('.app-icon img, .category-icon img');
    
    allImages.forEach(img => {
        // إضافة معالج للأخطاء
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const parent = this.closest('.app-icon, .category-icon');
            if (parent) {
                parent.classList.add('image-error');
            }
        });
        
        // إضافة معالج للتحميل الناجح
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            const parent = this.closest('.app-icon, .category-icon');
            if (parent) {
                parent.classList.remove('image-error');
            }
        });
        
        // معالجة الصور الفارغة
        if (!img.src || img.src === '' || img.complete && img.naturalHeight === 0) {
            img.style.display = 'none';
            const parent = img.closest('.app-icon, .category-icon');
            if (parent) {
                parent.classList.add('image-error');
            }
        }
    });
}

// دالة لتحميل الصور بكفاءة
function loadImagesEfficiently() {
    const imageContainers = document.querySelectorAll('.app-icon, .category-icon');
    
    imageContainers.forEach(container => {
        const img = container.querySelector('img');
        if (img && img.dataset.src) {
            // تحميل الصور باستخدام Intersection Observer للتحميل الكسول
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            observer.observe(img);
        }
    });
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeImageSystem();
    loadImagesEfficiently();
    
    // إعادة تهيئة عند إضافة محتوى جديد
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(initializeImageSystem, 100);
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// دالة لإنشاء أيقونة افتراضية
function createFallbackIcon(container, type = 'app') {
    const icon = document.createElement('div');
    icon.className = 'fallback-icon';
    icon.innerHTML = type === 'app' ? '📱' : '📁';
    icon.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        background: linear-gradient(135deg, var(--primary), var(--primary-dark));
        color: white;
        border-radius: inherit;
    `;
    container.appendChild(icon);
}

