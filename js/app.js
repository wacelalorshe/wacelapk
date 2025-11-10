// js/app.js - الإصدار المحسن مع التصميم الجديد
import { db, collection, getDocs, deleteDoc, doc } from './firebase-config.js';

let allApps = [];
let currentFilter = 'all';

// تحميل التطبيقات من Firebase
async function loadApps() {
    try {
        const appsContainer = document.getElementById('apps-list');
        const featuredContainer = document.getElementById('featured-apps');
        const trendingContainer = document.getElementById('trending-apps');
        
        appsContainer.innerHTML = '<p>جاري تحميل التطبيقات...</p>';
        featuredContainer.innerHTML = '<p>جاري تحميل التطبيقات المميزة...</p>';
        trendingContainer.innerHTML = '<p>جاري تحميل التطبيقات الشائعة...</p>';
        
        const querySnapshot = await getDocs(collection(db, "apps"));
        allApps = [];
        
        querySnapshot.forEach((doc) => {
            allApps.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayApps(allApps);
        displayFeaturedApps();
        displayTrendingApps();
    } catch (error) {
        console.error("Error loading apps:", error);
        document.getElementById('apps-list').innerHTML = '<p>خطأ في تحميل التطبيقات</p>';
    }
}

// عرض التطبيقات الرئيسية
function displayApps(apps) {
    const appsContainer = document.getElementById('apps-list');
    
    if (apps.length === 0) {
        appsContainer.innerHTML = '<p>لا توجد تطبيقات متاحة</p>';
        return;
    }
    
    appsContainer.innerHTML = apps.map(app => createAppCard(app)).join('');
}

// عرض التطبيقات المميزة
function displayFeaturedApps() {
    const featuredContainer = document.getElementById('featured-apps');
    const featuredApps = allApps.filter(app => app.rating >= 4).slice(0, 4);
    
    if (featuredApps.length === 0) {
        featuredContainer.innerHTML = '<p>لا توجد تطبيقات مميزة</p>';
        return;
    }
    
    featuredContainer.innerHTML = featuredApps.map(app => createAppCard(app)).join('');
}

// عرض التطبيقات الشائعة
function displayTrendingApps() {
    const trendingContainer = document.getElementById('trending-apps');
    const trendingApps = allApps.slice(0, 6); // أول 6 تطبيقات كتطبيقات شائعة
    
    if (trendingApps.length === 0) {
        trendingContainer.innerHTML = '<p>لا توجد تطبيقات شائعة</p>';
        return;
    }
    
    trendingContainer.innerHTML = trendingApps.map(app => createAppCard(app)).join('');
}

// إنشاء بطاقة تطبيق
function createAppCard(app) {
    const iconClass = getAppIcon(app.category);
    const ratingStars = generateRatingStars(app.rating);
    
    return `
        <div class="app-card" data-category="${app.category}">
            <div class="app-header">
                <div class="app-icon">
                    <i class="${iconClass}"></i>
                </div>
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
            <div class="app-actions">
                <button class="download-btn" onclick="downloadApp('${app.downloadURL}')">
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
    if (!rating) return '';
    
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
        'social': 'fas fa-comments',
        'entertainment': 'fas fa-gamepad',
        'productivity': 'fas fa-briefcase',
        'education': 'fas fa-graduation-cap',
        'utility': 'fas fa-tools',
        'productivity': 'fas fa-chart-line',
        'education': 'fas fa-book'
    };
    return icons[category] || 'fas fa-mobile-alt';
}

// تصفية التطبيقات
function filterApps(category) {
    currentFilter = category;
    
    const filteredApps = category === 'all' 
        ? allApps 
        : allApps.filter(app => app.category === category);
    
    displayApps(filteredApps);
}

// البحث في التطبيقات
function searchApps() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredApps = allApps.filter(app => 
        app.name.toLowerCase().includes(searchTerm) ||
        app.description.toLowerCase().includes(searchTerm) ||
        getCategoryName(app.category).toLowerCase().includes(searchTerm)
    );
    displayApps(filteredApps);
}

// تحميل التطبيق
function downloadApp(downloadURL) {
    // زيادة عداد التنزيلات
    const app = allApps.find(app => app.downloadURL === downloadURL);
    if (app) {
        app.downloads = (app.downloads || 0) + 1;
    }
    
    window.open(downloadURL, '_blank');
}

// حذف التطبيق (للمسؤول فقط)
async function deleteApp(appId) {
    if (!confirm('هل أنت متأكد من حذف هذا التطبيق؟')) return;
    
    try {
        await deleteDoc(doc(db, "apps", appId));
        loadApps(); // إعادة تحميل القائمة
    } catch (error) {
        console.error("Error deleting app:", error);
        alert('خطأ في حذف التطبيق');
    }
}

// الحصول على اسم التصنيف
function getCategoryName(category) {
    const categories = {
        'social': 'التواصل الاجتماعي',
        'productivity': 'الإنتاجية',
        'education': 'التعليم',
        'entertainment': 'الترفيه',
        'utility': 'الأدوات'
    };
    return categories[category] || category;
}

// التحقق إذا كان المستخدم مسؤولاً
function isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadApps();
    
    // إضافة مستمع حدث للبحث أثناء الكتابة
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchApps);
    }
    
    // إضافة تأثيرات عند التمرير
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });
});

// جعل الدوال متاحة globally
window.filterApps = filterApps;
window.searchApps = searchApps;
window.downloadApp = downloadApp;
window.deleteApp = deleteApp;
