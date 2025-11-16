// js/admin.js - الإصدار المحدث مع التاريخ الميلادي والترتيب الجديد والإعلانات
import { db } from './firebase-config.js';

// استيراد دوال Firebase مباشرة
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let apps = [];
let currentEditingApp = null;
let searchTerm = '';

// تنسيق التاريخ والوقت للعرض (الميلادي بالعربية)
function formatDateTime(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    
    try {
        // تنسيق التاريخ
        const dateOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            calendar: 'gregory',
            numberingSystem: 'arab'
        };
        
        // تنسيق الوقت
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            numberingSystem: 'arab'
        };
        
        const datePart = date.toLocaleDateString('ar-SA', dateOptions);
        const timePart = date.toLocaleTimeString('ar-SA', timeOptions);
        return `${datePart} - ${timePart}`;
    } catch (error) {
        // Fallback في حالة وجود خطأ
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
        await updateDoc(doc(db, "apps", appId), appData);
        showMessage('تم تحديث التطبيق بنجاح!', 'success');
        
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
    if (searchTerm) {
        clearSearchBtn.style.display = 'flex';
    } else {
        clearSearchBtn.style.display = 'none';
    }
    
    displayAdminApps();
    updateSearchStats();
}

// مسح البحث
function clearAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput');
    searchInput.value = '';
    searchTerm = '';
    
    // إخفاء زر إعادة الضبط
    const clearSearchBtn = document.querySelector('.clear-search-btn');
    clearSearchBtn.style.display = 'none';
    
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
        searchResultsCount.textContent = filteredApps.length;
        appsCount.textContent = `(${filteredApps.length} تطبيق - نتائج البحث)`;
    } else {
        searchResultsCount.textContent = '-';
        appsCount.textContent = `(${apps.length} تطبيق)`;
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
        
        // جلب جميع التطبيات بدون ترتيب أولي
        const querySnapshot = await getDocs(collection(db, "apps"));
        apps = [];
        
        querySnapshot.forEach((doc) => {
            apps.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // الترتيب المخصص: المميزة أولاً، ثم الشائعة، ثم المحدثة حديثاً
        apps.sort((a, b) => {
            // 1. التطبيقات المميزة أولاً
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            // 2. التطبيقات الشائعة ثانياً
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            // 3. الأحدث تحديثاً ثالثاً
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        console.log("تم تحميل التطبيقات:", apps.length);
        updateStats();
        displayAdminApps();
    } catch (error) {
        console.error("Error loading apps:", error);
        document.getElementById('adminAppsList').innerHTML = '<p style="color: red;">خطأ في تحميل التطبيقات: ' + error.message + '</p>';
    }
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('totalApps').textContent = apps.length;
    document.getElementById('activeApps').textContent = apps.length;
    updateSearchStats();
    console.log("تم تحديث الإحصائيات:", apps.length);
}

// تحميل الإعلانات في لوحة التحكم
function loadAdminAds() {
    const adContainers = document.querySelectorAll('.ad-container-admin');
    
    adContainers.forEach(container => {
        // مسح المحتوى الحالي
        container.innerHTML = '';
        
        // إنشاء عنصر iframe للإعلان
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '250px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.scrolling = 'no';
        
        // إنشاء محتوى HTML للإعلان
        const adHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { margin: 0; padding: 0; background: transparent; }
                </style>
            </head>
            <body>
                <script type="text/javascript">
                    atOptions = {
                        'key' : 'e9bb9d40367d9e2b490048a472a6b5e0',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                    };
                </script>
                <script type="text/javascript" src="//www.highperformanceformat.com/e9bb9d40367d9e2b490048a472a6b5e0/invoke.js"></script>
            </body>
            </html>
        `;
        
        // تعيين محتوى iframe
        iframe.srcdoc = adHtml;
        container.appendChild(iframe);
    });
}

// عرض التطبيقات في لوحة التحكم
function displayAdminApps() {
    const container = document.getElementById('adminAppsList');
    
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
                ${app.iconU
