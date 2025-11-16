// js/app.js - الإصدار المعدل للعمل بدون import
console.log("تحميل تطبيق المتجر...");

let allApps = [];
let currentFilter = 'all';
let visibleAppsCount = 5;
let currentDisplayedApps = [];

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
    }
];

// تنسيق التاريخ والوقت للعرض
function formatDateTime(dateString) {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'gregory'
        };
        return date.toLocaleDateString('ar-SA', options);
    } catch (error) {
        return 'غير محدد';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'gregory'
        };
        return date.toLocaleDateString('ar-SA', options);
    } catch (error) {
        return 'غير محدد';
    }
}

// إنشاء رابط المشاركة
function generateShareLink(appId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl.replace('index.html', '')}share.html?app=${appId}`;
}

// الانتقال إلى صفحة المشاركة
function goToSharePage(appId) {
    window.location.href = `share.html?app=${appId}`;
}

// مشاركة التطبيق
async function shareApp(appId, appName) {
    // الانتقال إلى صفحة المشاركة بدلاً من المشاركة المباشرة
    goToSharePage(appId);
}

// تحميل التطبيقات من Firebase أو استخدام البيانات التجريبية
async function loadApps() {
    try {
        console.log("بدء تحميل التطبيقات...");
        
        const appsContainer = document.getElementById('apps-list');
        if (appsContainer) {
            appsContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل التطبيقات...</p></div>';
        }

        // محاولة التحميل من Firebase
        if (window.firebaseDb) {
            const querySnapshot = await firebaseDb.collection("apps").get();
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
        } else {
            allApps = sampleApps;
            console.log("استخدام البيانات التجريبية (Firebase غير متوفر):", allApps.length);
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
    apps.forEach((app) => {
        html += createAppCard(app);
    });
    
    appsContainer.innerHTML = html;
    setupDescriptionToggle();
    
    console.log("تم عرض التطبيقات الرئيسية:", apps.length);
}

// إنشاء بطاقة تطبيق
function createAppCard(app) {
    const iconClass = getAppIcon(app.category);
    const ratingStars = generateRatingStars(app.rating);
    
    const appIcon = app.iconURL 
        ? `<div class="app-icon"><img src="${app.iconURL}" alt="${app.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'${iconClass}\\'></i>'"></div>`
        : `<div class="app-icon"><i class="${iconClass}"></i></div>`;
    
    return `
        <div class="app-card" data-category="${app.category}" data-id="${app.id}" onclick="goToSharePage('${app.id}')" style="cursor: pointer;">
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
                <button class="download-btn" onclick="downloadApp('${app.downloadURL}', '${app.id}'); event.stopPropagation()">
                    <i class="fas fa-download"></i>
                    تحميل
                </button>
                <button class="share-btn" onclick="goToSharePage('${app.id}'); event.stopPropagation()">
                    <i class="fas fa-share-alt"></i>                     مشاركة                 </button>
                ${isAdmin() ? `
                    <button class="delete-btn" onclick="deleteApp('${app.id}'); event.stopPropagation()">
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
        if (loadMoreContainer) loadMoreContainer.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.onclick = showMoreApps;
    } else {
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
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
            if (description.classList.contains('expanded')) {
                description.classList.remove('expanded');
                this.textContent = 'عرض المزيد';
            } else {
                description.classList.add('expanded');
                this.textContent = 'عرض أقل';
            }
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
        'productivity': 'فتوغرافي',
        'education': 'الذكاء الاصطناعي',
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
    
    const appsList = document.getElementById('apps-list');
    if (appsList) {
        appsList.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
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
        if (app && window.firebaseDb && !sampleApps.some(sample => sample.id === appId)) {
            await firebaseDb.doc(`apps/${appId}`).delete();
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
    // إزالة أي رسائل سابقة
    const existingMessages = document.querySelectorAll('.temp-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
        <span>${text}</span>
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
    
    const activeTab = document.querySelector(`.section-tab[data-section="${section}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
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
                specialApps.forEach((app) => {
                    html += createAppCard(app);
                });
                appsContainer.innerHTML = html;
                setupDescriptionToggle();
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
window.goToSharePage = goToSharePage;
