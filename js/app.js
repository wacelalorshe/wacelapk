// js/app.js
import { db, collection, getDocs, deleteDoc, doc } from './firebase-config.js';

let allApps = [];
let currentFilter = 'all';

// تحميل التطبيقات من Firebase
async function loadApps() {
    try {
        const appsContainer = document.getElementById('apps-list');
        appsContainer.innerHTML = '<p>جاري تحميل التطبيقات...</p>';
        
        const querySnapshot = await getDocs(collection(db, "apps"));
        allApps = [];
        
        querySnapshot.forEach((doc) => {
            allApps.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayApps(allApps);
    } catch (error) {
        console.error("Error loading apps:", error);
        document.getElementById('apps-list').innerHTML = '<p>خطأ في تحميل التطبيقات</p>';
    }
}

// عرض التطبيقات
function displayApps(apps) {
    const appsContainer = document.getElementById('apps-list');
    
    if (apps.length === 0) {
        appsContainer.innerHTML = '<p>لا توجد تطبيقات متاحة</p>';
        return;
    }
    
    appsContainer.innerHTML = apps.map(app => `
        <div class="app-card" data-category="${app.category}">
            <h4>${app.name}</h4>
            <p>${app.description}</p>
            <div class="app-meta">
                <span>الإصدار: ${app.version}</span>
                <span>الحجم: ${app.size}</span>
            </div>
            <div class="app-meta">
                <span>التصنيف: ${getCategoryName(app.category)}</span>
                <span>التقييم: ${app.rating || 'غير مقيم'}</span>
            </div>
            <button class="download-btn" onclick="downloadApp('${app.downloadURL}')">
                تحميل التطبيق
            </button>
            ${isAdmin() ? `<button class="delete-btn" onclick="deleteApp('${app.id}')">حذف</button>` : ''}
        </div>
    `).join('');
}

// تصفية التطبيقات
function filterApps(category) {
    currentFilter = category;
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
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
        app.description.toLowerCase().includes(searchTerm)
    );
    displayApps(filteredApps);
}

// تحميل التطبيق
function downloadApp(downloadURL) {
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
        'productivity': 'الإنتاجية',
        'education': 'التعليم',
        'entertainment': 'الترفيه',
        'utility': 'الأدوات'
    };
    return categories[category] || category;
}

// التحقق إذا كان المستخدم مسؤولاً
function isAdmin() {
    // يمكنك إضافة منطق التحقق من صلاحية المستخدم
    return localStorage.getItem('isAdmin') === 'true';
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadApps();
    
    // إضافة مستمع حدث للبحث أثناء الكتابة
    document.getElementById('searchInput').addEventListener('input', searchApps);
});

// جعل الدوال متاحة globally
window.filterApps = filterApps;
window.searchApps = searchApps;
window.downloadApp = downloadApp;
window.deleteApp = deleteApp;
