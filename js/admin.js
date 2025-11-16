// js/admin.js - الإصدار المعدل للعمل بدون import
console.log("تحميل لوحة التحكم...");

let apps = [];
let currentEditingApp = null;
let searchTerm = '';

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
    const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', '');
    return `${baseUrl}share.html?app=${appId}`;
}

// فتح نافذة التعديل
function openEditModal(app) {
    currentEditingApp = app;
    
    // ملء النموذج ببيانات التطبيق الحالية
    document.getElementById('editAppId').value = app.id;
    document.getElementById('editAppName').value = app.name;
    document.getElementById('editAppDescription').value = app.description;
    document.getElementById('editAppVersion').value = app.version;
    document.getElementById('editAppSize').value = app.size;
    document.getElementById('editAppCategory').value = app.category;
    document.getElementById('editAppDownloadURL').value = app.downloadURL;
    document.getElementById('editAppRating').value = app.rating || '';
    document.getElementById('editAppIconURL').value = app.iconURL || '';
    document.getElementById('editAppFeatured').checked = app.featured || false;
    document.getElementById('editAppTrending').checked = app.trending || false;
    
    // إظهار النافذة
    document.getElementById('editAppModal').style.display = 'block';
}

// إغلاق نافذة التعديل
function closeEditModal() {
    document.getElementById('editAppModal').style.display = 'none';
    currentEditingApp = null;
}

// تحديث التطبيق
async function updateApp(e) {
    e.preventDefault();
    
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.style.display = 'block';
    
    const appId = document.getElementById('editAppId').value;
    const appData = {
        name: document.getElementById('editAppName').value.trim(),
        description: document.getElementById('editAppDescription').value.trim(),
        version: document.getElementById('editAppVersion').value.trim(),
        size: document.getElementById('editAppSize').value.trim(),
        category: document.getElementById('editAppCategory').value,
        downloadURL: document.getElementById('editAppDownloadURL').value.trim(),
        rating: document.getElementById('editAppRating').value || null,
        featured: document.getElementById('editAppFeatured').checked,
        trending: document.getElementById('editAppTrending').checked,
        updatedAt: new Date().toISOString()
    };

    // الحصول على رابط الأيقونة إذا تم إدخاله
    const iconURL = document.getElementById('editAppIconURL').value.trim();
    if (iconURL) {
        appData.iconURL = iconURL;
    }

    try {
        // تحديث التطبيق في Firebase
        if (window.firebaseDb) {
            await firebaseDb.doc(`apps/${appId}`).update(appData);
            showMessage('تم تحديث التطبيق بنجاح!', 'success');
        } else {
            // تحديث محلي للبيانات التجريبية
            const appIndex = apps.findIndex(app => app.id === appId);
            if (appIndex !== -1) {
                apps[appIndex] = { ...apps[appIndex], ...appData };
                showMessage('تم تحديث التطبيق بنجاح (محلي)!', 'success');
            }
        }
        
        // إغلاق النافذة
        closeEditModal();
        
        // إعادة تحميل القائمة
        await loadAdminApps();

    } catch (error) {
        console.error("Error updating app:", error);
        showMessage('خطأ في تحديث التطبيق: ' + error.message, 'error');
    } finally {
        if (loadingModal) loadingModal.style.display = 'none';
    }
}

// البحث في التطبيقات (لوحة التحكم)
function searchAdminApps() {
    const searchInput = document.getElementById('adminSearchInput');
    searchTerm = searchInput.value.toLowerCase().trim();
    
    // إظهار زر إعادة الضبط إذا كان هناك بحث
    const clearSearchBtn = document.querySelector('.clear-search-btn');
    if (clearSearchBtn) {
        if (searchTerm) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }
    
    displayAdminApps();
    updateSearchStats();
}

// مسح البحث
function clearAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    searchTerm = '';
    
    // إخفاء زر إعادة الضبط
    const clearSearchBtn = document.querySelector('.clear-search-btn');
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }
    
    displayAdminApps();
    updateSearchStats();
}

// تحديث إحصائيات البحث
function updateSearchStats() {
    const searchResultsCount = document.getElementById('searchResultsCount');
    const appsCount = document.getElementById('appsCount');
    
    if (searchTerm) {
        const filteredApps = apps.filter(app => 
            app.name.toLowerCase().includes(searchTerm) ||
            app.description.toLowerCase().includes(searchTerm) ||
            getCategoryName(app.category).toLowerCase().includes(searchTerm)
        );
        if (searchResultsCount) searchResultsCount.textContent = filteredApps.length;
        if (appsCount) appsCount.textContent = `(${filteredApps.length} تطبيق - نتائج البحث)`;
    } else {
        if (searchResultsCount) searchResultsCount.textContent = '-';
        if (appsCount) appsCount.textContent = `(${apps.length} تطبيق)`;
    }
}

// نسخ رابط المشاركة
function copyShareLink(appId) {
    const shareInput = document.getElementById(`shareLink-${appId}`);
    if (shareInput) {
        shareInput.select();
        shareInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(shareInput.value).then(() => {
                showMessage('تم نسخ رابط المشاركة إلى الحافظة', 'success');
            }).catch(() => {
                // Fallback for older browsers
                document.execCommand('copy');
                showMessage('تم نسخ رابط المشاركة إلى الحافظة', 'success');
            });
        } catch (error) {
            document.execCommand('copy');
            showMessage('تم نسخ رابط المشاركة إلى الحافظة', 'success');
        }
    }
}

// إنشاء رابط مشاركة جديد
async function generateNewShareLink(appId) {
    try {
        showMessage('تم تحديث رابط المشاركة', 'success');
        displayAdminApps(); // إعادة تحميل القائمة
    } catch (error) {
        console.error("Error updating share link:", error);
        showMessage('خطأ في تحديث رابط المشاركة: ' + error.message, 'error');
    }
}

// تحميل التطبيقات مع الترتيب الجديد
async function loadAdminApps() {
    try {
        console.log("بدء تحميل التطبيقات...");
        
        // محاولة التحميل من Firebase
        if (window.firebaseDb) {
            const querySnapshot = await firebaseDb.collection("apps").get();
            apps = [];
            
            querySnapshot.forEach((doc) => {
                apps.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log("تم تحميل التطبيقات من Firebase:", apps.length);
        } else {
            // استخدام بيانات تجريبية
            apps = [
                {
                    id: '1',
                    name: 'تطبيق التواصل الاجتماعي',
                    description: 'تطبيق رائع للتواصل مع الأصدقاء والعائلة مع ميزات متقدمة.',
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
                    description: 'ألعاب مسلية ومثيرة للجميع تحتوي على أكثر من 100 لعبة مختلفة.',
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
                }
            ];
            console.log("استخدام البيانات التجريبية (Firebase غير متوفر):", apps.length);
        }
        
        // الترتيب المخصص: المميزة أولاً، ثم الشائعة، ثم المحدثة حديثاً
        apps.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        console.log("تم تحميل التطبيقات:", apps.length);
        updateStats();
        displayAdminApps();
    } catch (error) {
        console.error("Error loading apps:", error);
        const adminAppsList = document.getElementById('adminAppsList');
        if (adminAppsList) {
            adminAppsList.innerHTML = '<p style="color: red;">خطأ في تحميل التطبيقات: ' + error.message + '</p>';
        }
    }
}

// تحديث الإحصائيات
function updateStats() {
    const totalApps = document.getElementById('totalApps');
    const activeApps = document.getElementById('activeApps');
    
    if (totalApps) totalApps.textContent = apps.length;
    if (activeApps) activeApps.textContent = apps.length;
    updateSearchStats();
    console.log("تم تحديث الإحصائيات:", apps.length);
}

// عرض التطبيقات في لوحة التحكم
function displayAdminApps() {
    const container = document.getElementById('adminAppsList');
    if (!container) return;
    
    // تصفية التطبيقات حسب البحث
    let filteredApps = apps;
    if (searchTerm) {
        filteredApps = apps.filter(app => 
            app.name.toLowerCase().includes(searchTerm) ||
            app.description.toLowerCase().includes(searchTerm) ||
            getCategoryName(app.category).toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredApps.length === 0) {
        if (searchTerm) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-search"></i>
                    <p>لم يتم العثور على تطبيقات تطابق البحث</p>
                    <small>بحثت عن: "${searchTerm}"</small>
                </div>
            `;
        } else {
            container.innerHTML = '<p>لا توجد تطبيقات مضافة بعد</p>';
        }
        return;
    }
    
    container.innerHTML = filteredApps.map(app => `
        <div class="admin-app-card">
            <div class="app-header">
                ${app.iconURL ? `<div class="app-icon"><img src="${app.iconURL}" alt="${app.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'${getAppIcon(app.category)}\\'></i>'"></div>` : 
                  `<div class="app-icon"><i class="${getAppIcon(app.category)}"></i></div>`}
                <div class="app-info">
                    <h4>${app.name}</h4>
                    <div class="app-meta">
                        <span>الإصدار: ${app.version}</span>
                        <span>الحجم: ${app.size} MB</span>
                    </div>
                </div>
            </div>
            <div class="app-description-container">
                <p class="app-description">${app.description}</p>
                ${app.description && app.description.length > 100 ? '<span class="show-more">عرض المزيد</span>' : ''}
            </div>
            <div class="app-meta">
                <span>التصنيف: ${getCategoryName(app.category)}</span>
                ${app.rating ? `<span>التقييم: ${app.rating}/5</span>` : ''}
            </div>
            <div class="app-meta">
                ${app.featured ? '<span class="badge featured">⭐ مميز</span>' : ''}
                ${app.trending ? '<span class="badge trending">🔥 شائع</span>' : ''}
                <span class="downloads">${app.downloads || 0} تنزيل</span>
            </div>
            <div class="app-date-info">
                <div class="date-item">
                    <i class="fas fa-calendar-plus"></i>
                    <span>أضيف في: ${formatDateTime(app.createdAt)}</span>
                </div>
                ${app.updatedAt && app.updatedAt !== app.createdAt ? `
                    <div class="date-item">
                        <i class="fas fa-edit"></i>
                        <span>عدل في: ${formatDateTime(app.updatedAt)}</span>
                    </div>
                ` : ''}
            </div>
            <div class="share-link-section">
                <label>رابط المشاركة:</label>
                <div class="share-link-container">
                    <a href="${generateShareLink(app.id)}" target="_blank" class="share-link-preview">فتح صفحة المشاركة</a>
                    <input type="text" id="shareLink-${app.id}" value="${generateShareLink(app.id)}" readonly class="share-link-input">
                    <button class="btn-copy" onclick="copyShareLink('${app.id}')">نسخ</button>
                </div>
            </div>
            
            <div class="admin-app-actions">
                <button class="btn-edit" onclick="openEditModal(${JSON.stringify(app).replace(/"/g, '&quot;')})">تعديل</button>
                <button class="btn-share" onclick="generateNewShareLink('${app.id}')">تحديث رابط المشاركة</button>
                <button class="btn-delete" onclick="deleteAdminApp('${app.id}')">حذف التطبيق</button>
            </div>
        </div>
    `).join('');
    
    // إضافة مستمعات الأحداث لعرض المزيد
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
    
    console.log("تم عرض التطبيقات في لوحة التحكم");
}

// إضافة تطبيق جديد
function initializeAddAppForm() {
    const form = document.getElementById('addAppForm');
    const messageDiv = document.getElementById('formMessage');
    const loadingModal = document.getElementById('loadingModal');

    if (!form) {
        console.error('لم يتم العثور على النموذج!');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("تم الضغط على إضافة تطبيق");
        
        // إظهار نافذة التحميل
        if (loadingModal) loadingModal.style.display = 'block';
        
        // الحصول على البيانات من النموذج
        const appData = {
            name: document.getElementById('appName').value.trim(),
            description: document.getElementById('appDescription').value.trim(),
            version: document.getElementById('appVersion').value.trim(),
            size: document.getElementById('appSize').value.trim(),
            category: document.getElementById('appCategory').value,
            downloadURL: document.getElementById('appDownloadURL').value.trim(),
            rating: document.getElementById('appRating').value || null,
            featured: document.getElementById('appFeatured').checked,
            trending: document.getElementById('appTrending').checked,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            downloads: 0,
            shareCount: 0
        };

        // الحصول على رابط الأيقونة إذا تم إدخاله
        const iconURL = document.getElementById('appIconURL').value.trim();
        if (iconURL) {
            appData.iconURL = iconURL;
        }

        console.log("بيانات التطبيق:", appData);

        // التحقق من الحقول المطلوبة
        if (!appData.name || !appData.description || !appData.version || 
            !appData.size || !appData.category || !appData.downloadURL) {
            showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
            if (loadingModal) loadingModal.style.display = 'none';
            return;
        }

        try {
            // إضافة التطبيق إلى Firebase
            if (window.firebaseDb) {
                console.log("جاري إضافة التطبيق إلى Firebase...");
                const docRef = await firebaseDb.collection("apps").add(appData);
                console.log("تم إضافة التطبيق بنجاح! ID:", docRef.id);
                showMessage('تم إضافة التطبيق بنجاح!', 'success');
            } else {
                // إضافة محلية للبيانات التجريبية
                const newApp = {
                    ...appData,
                    id: 'app-' + Date.now()
                };
                apps.push(newApp);
                showMessage('تم إضافة التطبيق بنجاح (محلي)!', 'success');
            }

            // إعادة تعيين النموذج
            form.reset();

            // إعادة تحميل القائمة
            await loadAdminApps();

        } catch (error) {
            console.error("Error adding app:", error);
            showMessage('خطأ في إضافة التطبيق: ' + error.message, 'error');
        } finally {
            // إخفاء نافذة التحميل
            if (loadingModal) loadingModal.style.display = 'none';
        }
    });

    console.log("تم تهيئة نموذج إضافة التطبيق");
}

// تهيئة نموذج التعديل
function initializeEditAppForm() {
    const form = document.getElementById('editAppForm');
    if (form) {
        form.addEventListener('submit', updateApp);
    }
    
    // إغلاق النافذة عند النقر على X
    const closeBtn = document.querySelector('#editAppModal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }
    
    // إغلاق النافذة عند النقر خارجها
    const modal = document.getElementById('editAppModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });
    }
}

// حذف التطبيق
async function deleteAdminApp(appId) {
    if (!confirm('هل أنت متأكد من حذف هذا التطبيق؟')) return;
    
    try {
        console.log("جاري حذف التطبيق:", appId);
        
        if (window.firebaseDb) {
            await firebaseDb.doc(`apps/${appId}`).delete();
        } else {
            // حذف محلي للبيانات التجريبية
            apps = apps.filter(app => app.id !== appId);
        }
        
        showMessage('تم حذف التطبيق بنجاح', 'success');
        await loadAdminApps(); // إعادة تحميل القائمة
    } catch (error) {
        console.error("Error deleting app:", error);
        showMessage('خطأ في حذف التطبيق: ' + error.message, 'error');
    }
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

// عرض الرسائل
function showMessage(text, type) {
    const messageDiv = document.getElementById('formMessage');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.style.color = type === 'success' ? 'green' : 'red';
        messageDiv.style.padding = '10px';
        messageDiv.style.margin = '10px 0';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.backgroundColor = type === 'success' ? '#e8f5e8' : '#ffe8e8';
        messageDiv.style.border = type === 'success' ? '1px solid #27ae60' : '1px solid #e74c3c';
        
        // إخفاء الرسالة بعد 5 ثواني
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.style.backgroundColor = 'transparent';
            messageDiv.style.border = 'none';
        }, 5000);
    }
    
    // أيضاً عرض في الكونسول
    console.log(type.toUpperCase() + ":", text);
}

// التحقق من تسجيل الدخول
function checkAdminAuth() {
    const user = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin');
    
    console.log("التحقق من المصادقة:", { user, isAdmin });
    
    if (!user || !isAdmin) {
        console.log("المستخدم غير مسجل - إعادة التوجيه إلى الصفحة الرئيسية");
        
        // عرض رسالة للمستخدم
        const adminContainer = document.querySelector('.admin-container');
        if (adminContainer) {
            adminContainer.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2 style="color: #e74c3c;">يجب تسجيل الدخول أولاً</h2>
                    <p>يجب أن تكون مسجلاً الدخول للوصول إلى لوحة التحكم</p>
                    <button onclick="goToLogin()" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 10px;
                    ">تسجيل الدخول</button>
                    <button onclick="goToHome()" style="
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 10px;
                    ">العودة للصفحة الرئيسية</button>
                </div>
            `;
        }
        
        return false;
    }
    return true;
}

// الانتقال لتسجيل الدخول
function goToLogin() {
    window.location.href = 'index.html';
}

// الانتقال للصفحة الرئيسية
function goToHome() {
    window.location.href = 'index.html';
}

// إعداد البحث في لوحة التحكم
function setupAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput');
    const searchBtn = document.querySelector('.search-bar-admin .search-btn');
    
    if (searchInput) {
        // البحث عند الضغط على Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAdminApps();
            }
        });
        
        // البحث أثناء الكتابة (بحث فوري)
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                clearAdminSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchAdminApps);
    }
}

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    console.log("تم تحميل صفحة لوحة التحكم");
    
    // التحقق من تسجيل الدخول أولاً
    if (!checkAdminAuth()) {
        return;
    }
    
    // تهيئة النماذج
    initializeAddAppForm();
    initializeEditAppForm();
    
    // إعداد البحث
    setupAdminSearch();
    
    // تحميل التطبيقات
    loadAdminApps();
    
    // إعداد زر تسجيل الخروج
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('هل تريد تسجيل الخروج؟')) {
                localStorage.removeItem('user');
                localStorage.removeItem('isAdmin');
                window.location.href = 'index.html';
            }
        });
    }
    
    console.log("تم تهيئة لوحة التحكم بالكامل");
});

// جعل الدوال متاحة globally
window.goToLogin = goToLogin;
window.goToHome = goToHome;
window.deleteAdminApp = deleteAdminApp;
window.copyShareLink = copyShareLink;
window.generateNewShareLink = generateNewShareLink;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.updateApp = updateApp;
window.searchAdminApps = searchAdminApps;
window.clearAdminSearch = clearAdminSearch;
