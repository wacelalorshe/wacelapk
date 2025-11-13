// js/app.js - الإصدار المصحح والمحدث
import { db } from './firebase-config.js';

// استيراد دوال Firebase مباشرة
import { 
    collection, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let allApps = [];
let currentFilter = 'all';
let visibleAppsCount = 5; // عدد التطبيقات المعروضة في البداية (5 بدلاً من 6)
let currentDisplayedApps = []; // التطبيقات المعروضة حالياً

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
        iconURL: ''
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
        iconURL: ''
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
        iconURL: ''
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
        iconURL: ''
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
        iconURL: ''
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
        iconURL: ''
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
        iconURL: ''
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
        iconURL: ''
    },
    {
        id: '9',
        name: 'تطبيق السفر',
        description: 'خطط لرحلاتك واكتشف أماكن جديدة حول العالم. يوفر معلومات شاملة عن الوجهات والفنادق.',
        version: '2.0.0',
        size: '31',
        category: 'utility',
        downloadURL: 'https://example.com/app9.zip',
        rating: 4.5,
        downloads: 2200,
        shareCount: 67,
        iconURL: ''
    },
    {
        id: '10',
        name: 'تطبيق التسوق',
        description: 'تسوق من آلاف المتاجر بأسعار مميزة وعروض حصرية. خدمة توصيل سريعة وموثوقة.',
        version: '3.1.0',
        size: '47',
        category: 'utility',
        downloadURL: 'https://example.com/app10.zip',
        rating: 4.3,
        downloads: 3100,
        trending: true,
        shareCount: 89,
        iconURL: ''
    }
];

// إنشاء رابط المشاركة
function generateShareLink(appId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}share.html?app=${appId}`;
}

// مشاركة التطبيق
async function shareApp(appId, appName) {
    const shareUrl = generateShareLink(appId);
    
    try {
        // زيادة عداد المشاركات في قاعدة البيانات
        const appRef = doc(db, "apps", appId);
        const app = allApps.find(a => a.id === appId);
        const currentShares = app.shareCount || 0;
        
        // تحديث في Firebase
        try {
            await updateDoc(appRef, {
                shareCount: currentShares + 1
            });
        } catch (error) {
            console.log('لا يمكن تحديث Firebase، استخدام البيانات المحلية');
        }

        // تحديث البيانات المحلية
        app.shareCount = currentShares + 1;

        if (navigator.share) {
            // استخدام Web Share API إذا متاح
            await navigator.share({
                title: `تحميل ${appName}`,
                text: `اكتشف هذا التطبيق الرائع: ${appName}`,
                url: shareUrl,
            });
            showTempMessage('تم مشاركة التطبيق بنجاح!', 'success');
        } else {
            // نسخ الرابط إلى الحافظة
            await navigator.clipboard.writeText(shareUrl);
            showTempMessage('تم نسخ رابط المشاركة إلى الحافظة!', 'success');
        }
        
        // تحديث العرض الحالي
        updateCurrentDisplay();
        
    } catch (error) {
        console.error('Error sharing app:', error);
        if (error.name !== 'AbortError') {
            // Fallback: فتح نافذة المشاركة
            window.open(`https://twitter.com/intent/tweet?text=اكتشف هذا التطبيق الرائع: ${appName}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        }
    }
}

// تحميل التطبيقات من Firebase
async function loadApps() {
    try {
        console.log("بدء تحميل التطبيقات...");
        
        const appsContainer = document.getElementById('apps-list');
        
        // عرض حالة التحميل
        if (appsContainer) appsContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل التطبيقات...</p></div>';

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
        
        // عرض التطبيقات في القسم الرئيسي
        displayApps(allApps.slice(0, visibleAppsCount));
        setupLoadMoreButton();
        
    } catch (error) {
        console.error("خطأ في تحميل التطبيقات:", error);
        
        // في حالة الخطأ، استخدام البيانات التجريبية
        allApps = sampleApps;
        displayApps(allApps.slice(0, visibleAppsCount));
        setupLoadMoreButton();
        
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
    currentDisplayedApps = apps;
    
    if (!appsContainer) {
        console.error("لم يتم العثور على عنصر apps-list");
        return;
    }
    
    if (apps.length === 0) {
        appsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>لا توجد تطبيقات متاحة</p></div>';
        return;
    }
    
    appsContainer.innerHTML = apps.map(app => createAppCard(app)).join('');
    setupDescriptionToggle();
    console.log("تم عرض التطبيقات الرئيسية:", apps.length);
}

// إنشاء بطاقة تطبيق
function createAppCard(app) {
    const iconClass = getAppIcon(app.category);
    const ratingStars = generateRatingStars(app.rating);
    
    // استخدام الأيقونة المخصصة إذا كانت متاحة - بنفس نمط صفحة المشاركة
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
            <div class="app-meta">
                <div class="app-shares">
                    <i class="fas fa-share"></i>
                    <span>${app.shareCount || 0} مشاركة</span>
                </div>
            </div>
            ${app.featured ? '<div class="featured-badge">مميز</div>' : ''}
            ${app.trending ? '<div class="trending-badge">شائع</div>' : ''}
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

// إضافة مستمعات الأحداث لعرض المزيد في الصفحة الرئيسية
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
    visibleAppsCount = 5; // إعادة تعيين العدد المرئي
    
    // تحديث حالة الأزرار النشطة في شريط التصفية
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
    
    // إغلاق نافذة البحث بعد إجراء البحث
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        searchModal.style.display = 'none';
    }
    
    if (!searchTerm) {
        // إذا كان البحث فارغاً، اعرض جميع التطبيقات
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
    
    // إخفاء جميع التطبيقات الأخرى وعرض فقط نتائج البحث
    visibleAppsCount = filteredApps.length; // عرض جميع النتائج
    displayApps(filteredApps);
    setupLoadMoreButton(); // إخفاء زر "عرض المزيد" أثناء البحث
    
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
        updateCurrentDisplay();
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
        currentDisplayedApps = currentDisplayedApps.filter(app => app.id !== appId);
        
        // إعادة تحميل القوائم
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

// عرض الأقسام الخاصة
function displaySpecialSection(section) {
    // إخفاء جميع الأقسام أولاً
    document.querySelectorAll('.special-section-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // إزالة النشاط من جميع الأزرار
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إضافة النشاط للزر المحدد
    document.querySelector(`.section-tab[data-section="${section}"]`).classList.add('active');
    
    // عرض القسم المحدد
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
        
        // تحميل التطبيقات الخاصة بالقسم
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
                appsContainer.innerHTML = specialApps.map(app => createAppCard(app)).join('');
                setupDescriptionToggle();
            }
        }
        
        // التمرير إلى القسم
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

// إعداد أحداث الفئات للشريط الأفقي
function setupCategoryEvents() {
    const categoryFilters = document.querySelectorAll('.category-filter');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // إزالة النشاط من جميع الفلاتر
            categoryFilters.forEach(f => f.classList.remove('active'));
            
            // إضافة النشاط للفلتر المحدد
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
