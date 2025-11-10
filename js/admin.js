// js/admin.js - الإصدار المحدث باستخدام رابط الصورة
import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc
} from './firebase-config.js';

let apps = [];

// تحميل التطبيقات
async function loadAdminApps() {
    try {
        console.log("بدء تحميل التطبيقات...");
        const querySnapshot = await getDocs(collection(db, "apps"));
        apps = [];
        
        querySnapshot.forEach((doc) => {
            apps.push({
                id: doc.id,
                ...doc.data()
            });
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
    console.log("تم تحديث الإحصائيات:", apps.length);
}

// عرض التطبيقات في لوحة التحكم
function displayAdminApps() {
    const container = document.getElementById('adminAppsList');
    
    if (apps.length === 0) {
        container.innerHTML = '<p>لا توجد تطبيقات مضافة بعد</p>';
        return;
    }
    
    container.innerHTML = apps.map(app => `
        <div class="admin-app-card">
            <div class="app-header">
                <div class="app-icon">
                    ${app.iconURL ? 
                        `<img src="${app.iconURL}" alt="${app.name}" class="app-icon-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                         <i class="${getAppIcon(app.category)}" style="display: none;"></i>` :
                        `<i class="${getAppIcon(app.category)}"></i>`
                    }
                </div>
                <div class="app-info">
                    <h4>${app.name}</h4>
                    <p>${app.description}</p>
                </div>
            </div>
            <div class="app-meta">
                <span>الإصدار: ${app.version}</span>
                <span>الحجم: ${app.size} MB</span>
            </div>
            <div class="app-meta">
                <span>التصنيف: ${getCategoryName(app.category)}</span>
                ${app.rating ? `<span>التقييم: ${app.rating}/5</span>` : ''}
            </div>
            <div class="admin-app-actions">
                <button class="btn-delete" onclick="deleteAdminApp('${app.id}')">حذف التطبيق</button>
            </div>
        </div>
    `).join('');
    
    console.log("تم عرض التطبيقات في لوحة التحكم");
}

// إضافة تطبيق جديد - الإصدار المحدث باستخدام رابط الصورة
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
            createdAt: new Date().toISOString(),
            downloads: 0
        };

        console.log("بيانات التطبيق:", appData);

        // التحقق من الحقول المطلوبة
        if (!appData.name || !appData.description || !appData.version || 
            !appData.size || !appData.category || !appData.downloadURL) {
            showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
            if (loadingModal) loadingModal.style.display = 'none';
            return;
        }

        try {
            // إضافة رابط الأيقونة إذا تم إدخاله
            const iconURL = document.getElementById('appIconURL').value.trim();
            if (iconURL) {
                // التحقق من صحة الرابط
                if (isValidURL(iconURL)) {
                    appData.iconURL = iconURL;
                    console.log("تم إضافة رابط الأيقونة:", iconURL);
                } else {
                    showMessage('رابط الأيقونة غير صالح', 'error');
                    if (loadingModal) loadingModal.style.display = 'none';
                    return;
                }
            }

            // إضافة التطبيق إلى Firebase
            console.log("جاري إضافة التطبيق إلى Firebase...");
            const docRef = await addDoc(collection(db, "apps"), appData);
            console.log("تم إضافة التطبيق بنجاح! ID:", docRef.id);

            // إظهار رسالة النجاح
            showMessage('تم إضافة التطبيق بنجاح!', 'success');

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

// التحقق من صحة الرابط
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// حذف التطبيق
async function deleteAdminApp(appId) {
    if (!confirm('هل أنت متأكد من حذف هذا التطبيق؟')) return;
    
    try {
        console.log("جاري حذف التطبيق:", appId);
        await deleteDoc(doc(db, "apps", appId));
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
        'productivity': 'الإنتاجية',
        'education': 'التعليم',
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

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    console.log("تم تحميل صفحة لوحة التحكم");
    
    // التحقق من تسجيل الدخول أولاً
    if (!checkAdminAuth()) {
        return;
    }
    
    // تهيئة النموذج
    initializeAddAppForm();
    
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
