// js/admin.js
import { db, collection, addDoc, getDocs, deleteDoc, doc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

let apps = [];

// تحميل التطبيقات
async function loadAdminApps() {
    try {
        const querySnapshot = await getDocs(collection(db, "apps"));
        apps = [];
        
        querySnapshot.forEach((doc) => {
            apps.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        updateStats();
        displayAdminApps();
    } catch (error) {
        console.error("Error loading apps:", error);
    }
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('totalApps').textContent = apps.length;
    document.getElementById('activeApps').textContent = apps.length; // يمكنك تعديل هذا
}

// عرض التطبيقات في لوحة التحكم
function displayAdminApps() {
    const container = document.getElementById('adminAppsList');
    
    if (apps.length === 0) {
        container.innerHTML = '<p>لا توجد تطبيقات مضافة</p>';
        return;
    }
    
    container.innerHTML = apps.map(app => `
        <div class="admin-app-card">
            <h4>${app.name}</h4>
            <p>${app.description}</p>
            <div class="app-meta">
                <span>الإصدار: ${app.version}</span>
                <span>الحجم: ${app.size}</span>
            </div>
            <div class="app-meta">
                <span>التصنيف: ${getCategoryName(app.category)}</span>
                ${app.rating ? `<span>التقييم: ${app.rating}</span>` : ''}
            </div>
            <div class="admin-app-actions">
                <button class="btn-edit" onclick="editApp('${app.id}')">تعديل</button>
                <button class="btn-delete" onclick="deleteAdminApp('${app.id}')">حذف</button>
            </div>
        </div>
    `).join('');
}

// إضافة تطبيق جديد
document.getElementById('addAppForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const message = document.getElementById('formMessage');
    const submitBtn = form.querySelector('.submit-btn');
    
    // الحصول على البيانات من النموذج
    const appData = {
        name: document.getElementById('appName').value,
        description: document.getElementById('appDescription').value,
        version: document.getElementById('appVersion').value,
        size: document.getElementById('appSize').value,
        category: document.getElementById('appCategory').value,
        downloadURL: document.getElementById('appDownloadURL').value,
        rating: document.getElementById('appRating').value || null,
        createdAt: new Date().toISOString()
    };
    
    try {
        // تحميل الأيقونة إذا تم اختيارها
        const iconFile = document.getElementById('appIcon').files[0];
        if (iconFile) {
            const iconURL = await uploadIcon(iconFile);
            appData.iconURL = iconURL;
        }
        
        // إضافة التطبيق إلى Firebase
        await addDoc(collection(db, "apps"), appData);
        
        message.textContent = 'تم إضافة التطبيق بنجاح!';
        message.style.color = 'green';
        
        // إعادة تعيين النموذج
        form.reset();
        
        // إعادة تحميل القائمة
        loadAdminApps();
        
    } catch (error) {
        console.error("Error adding app:", error);
        message.textContent = 'خطأ في إضافة التطبيق';
        message.style.color = 'red';
    }
});

// رفع الأيقونة إلى Storage
async function uploadIcon(file) {
    const storageRef = ref(storage, `app-icons/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

// حذف التطبيق
async function deleteAdminApp(appId) {
    if (!confirm('هل أنت متأكد من حذف هذا التطبيق؟')) return;
    
    try {
        await deleteDoc(doc(db, "apps", appId));
        loadAdminApps(); // إعادة تحميل القائمة
    } catch (error) {
        console.error("Error deleting app:", error);
        alert('خطأ في حذف التطبيق');
    }
}

// تعديل التطبيق (يمكن تطويره لاحقاً)
function editApp(appId) {
    alert('ميزة التعديل قيد التطوير. تطبيق ID: ' + appId);
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

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من تسجيل الدخول أولاً
    if (!localStorage.getItem('isAdmin')) {
        alert('يجب تسجيل الدخول كمسؤول للوصول إلى لوحة التحكم');
        window.location.href = 'index.html';
        return;
    }
    
    loadAdminApps();
});

// جعل الدوال متاحة globally
window.editApp = editApp;
window.deleteAdminApp = deleteAdminApp;
