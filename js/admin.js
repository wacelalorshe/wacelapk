// js/admin.js - الإصدار المصحح بالكامل
import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc
} from './firebase-config.js';

let apps = [];

// التحقق من تسجيل الدخول بشكل صارم
function checkAdminAuth() {
    const user = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin');
    
    console.log("التحقق من المصادقة:", { user, isAdmin });
    
    if (!user || isAdmin !== 'true') {
        console.log("المستخدم غير مسجل أو ليس مسؤولاً - إعادة التوجيه");
        showAuthError();
        return false;
    }
    
    return true;
}

// عرض رسالة خطأ المصادقة
function showAuthError() {
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
        adminContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2 style="color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i> صلاحية غير كافية</h2>
                <p>يجب أن تكون مسؤولاً للوصول إلى لوحة التحكم</p>
                <div style="margin: 20px 0;">
                    <button onclick="goToLogin()" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 10px;
                        font-size: 16px;
                    ">
                        <i class="fas fa-sign-in-alt"></i> تسجيل الدخول
                    </button>
                    <button onclick="goToHome()" style="
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 10px;
                        font-size: 16px;
                    ">
                        <i class="fas fa-home"></i> العودة للصفحة الرئيسية
                    </button>
                </div>
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
                    <h4>بيانات الاختبار للمسؤول:</h4>
                    <p><strong>البريد:</strong> admin@wacelmarkt.com</p>
                    <p><strong>كلمة المرور:</strong> Admin123456</p>
                </div>
            </div>
        `;
    }
}

// تحميل التطبيقات
async function loadAdminApps() {
    if (!checkAdminAuth()) return;
    
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
    
    if (!container) {
        console.error("لم يتم العثور على عنصر adminAppsList");
        return;
    }
    
    if (apps.length === 0) {
        container.innerHTML = '<p>لا توجد تطبيقات مضافة بعد</p>';
        return;
    }
    
    container.innerHTML = apps.map(app => {
        const shareableLink = generateAdminShareableLink(app);
        
        return `
        <div class="admin-app-card">
            <div class="app-header">
                ${app.iconURL ? `<img src="${app.iconURL}" alt="${app.name}" class="app-icon-img">` : 
                  `<div class="app-icon"><i class="${getAppIcon(app.category)}"></i></div>`}
                <div class="app-info">
                    <h4>${app.name}</h4>
                    <div class="app-meta">
                        <span>الإصدار: ${app.version}</span>
                        <span>الحجم: ${app.size} MB</span>
                    </div>
                </div>
            </div>
            <p class="app-description">${app.description}</p>
            <div class="app-meta">
                <span>التصنيف: ${getCategoryName(app.category)}</span>
                ${app.rating ? `<span>التقييم: ${app.rating}/5</span>` : ''}
            </div>
            <div class="app-meta">
                ${app.featured ? '<span class="badge featured">مميز</span>' : ''}
                ${app.trending ? '<span class="badge trending">شائع</span>' : ''}
                <span class="downloads">${app.downloads || 0} تنزيل</span>
            </div>
            <!-- رابط المشاركة في لوحة التحكم -->
            <div class="share-section">
                <label>رابط المشاركة:</label>
                <div class="share-link-container">
                    <input type="text" value="${shareableLink}" readonly class="share-link-input" id="share-link-${app.id}">
                    <button class="copy-share-link" onclick="copyAdminShareLink('${app.id}', '${app.name}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="social-share-buttons">
                    <button class="social-share-btn whatsapp" onclick="shareAdminAppSocial('${app.id}', 'whatsapp')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="social-share-btn twitter" onclick="shareAdminAppSocial('${app.id}', 'twitter')">
                        <i class="fab fa-twitter"></i>
                    </button>
                    <button class="social-share-btn facebook" onclick="shareAdminAppSocial('${app.id}', 'facebook')">
                        <i class="fab fa-facebook"></i>
                    </button>
                    <button class="social-share-btn telegram" onclick="shareAdminAppSocial('${app.id}', 'telegram')">
                        <i class="fab fa-telegram"></i>
                    </button>
                </div>
            </div>
            <div class="admin-app-actions">
                <button class="btn-delete" onclick="deleteAdminApp('${app.id}')">حذف التطبيق</button>
            </div>
        </div>
    `}).join('');
    
    console.log("تم عرض التطبيقات في لوحة التحكم");
}

// إنشاء رابط مشاركة في لوحة التحكم
function generateAdminShareableLink(app) {
    const baseUrl = window.location.origin + '/index.html';
    return `${baseUrl}?app=${app.id}&ref=share`;
}

// نسخ رابط المشاركة في لوحة التحكم
function copyAdminShareLink(appId, appName) {
    const shareLinkInput = document.getElementById(`share-link-${appId}`);
    
    if (shareLinkInput) {
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(shareLinkInput.value).then(() => {
                showMessage(`تم نسخ رابط مشاركة ${appName}`, 'success');
            }).catch(() => {
                // الطريقة البديلة
                const textArea = document.createElement("textarea");
                textArea.value = shareLinkInput.value;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showMessage(`تم نسخ رابط مشاركة ${appName}`, 'success');
            });
        } catch (error) {
            showMessage('فشل نسخ الرابط', 'error');
        }
    }
}

// مشاركة عبر الوسائط الاجتماعية من لوحة التحكم
function shareAdminAppSocial(appId, platform) {
    const app = apps.find(app => app.id === appId);
    if (!app) return;
    
    const shareableLink = generateAdminShareableLink(app);
    const shareText = `تحميل تطبيق ${app.name} - ${app.description}`;
    
    let shareUrl = '';
    
    switch(platform) {
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareableLink)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareableLink)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(shareText)}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent(shareText)}`;
            break;
        default:
            return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
            size: parseFloat(document.getElementById('appSize').value.trim()),
            category: document.getElementById('appCategory').value,
            downloadURL: document.getElementById('appDownloadURL').value.trim(),
            createdAt: new Date().toISOString(),
            downloads: 0
        };

        // الحصول على التقييم إذا كان موجوداً
        const ratingValue = document.getElementById('appRating').value;
        if (ratingValue) {
            appData.rating = parseFloat(ratingValue);
        }

        // الحصول على الخيارات
        appData.featured = document.getElementById('appFeatured').checked;
        appData.trending = document.getElementById('appTrending').checked;

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

// إضافة أنماط CSS للمشاركة في لوحة التحكم
const adminStyles = `
.share-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    border: 1px solid #dee2e6;
}

.share-section label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.share-link-container {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.share-link-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 5px;
    background: white;
    font-size: 0.9rem;
    direction: ltr;
    text-overflow: ellipsis;
}

.copy-share-link {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.copy-share-link:hover {
    background: #2980b9;
}

.social-share-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.social-share-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s;
    font-size: 1.1rem;
}

.social-share-btn:hover {
    transform: scale(1.1);
}

.social-share-btn.whatsapp {
    background: #25D366;
}

.social-share-btn.twitter {
    background: #1DA1F2;
}

.social-share-btn.facebook {
    background: #4267B2;
}

.social-share-btn.telegram {
    background: #0088cc;
}

.admin-app-card {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    margin: 1rem 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border: 1px solid #e0e0e0;
}

.app-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.app-icon-img {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    object-fit: cover;
}

.app-icon {
    width: 50px;
    height: 50px;
    background: #3498db;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.app-info h4 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
}

.app-meta {
    display: flex;
    gap: 1rem;
    margin: 0.5rem 0;
    flex-wrap: wrap;
}

.app-meta span {
    background: #f8f9fa;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #666;
}

.badge {
    background: #e74c3c;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

.badge.featured {
    background: #f39c12;
}

.badge.trending {
    background: #9b59b6;
}

.app-description {
    color: #666;
    line-height: 1.5;
    margin: 1rem 0;
}

.admin-app-actions {
    margin-top: 1rem;
    text-align: left;
}

.btn-delete {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-delete:hover {
    background: #c0392b;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-card h3 {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
}

.stat-card p {
    margin: 0;
    font-size: 2rem;
    font-weight: bold;
    color: #3498db;
}

.app-form {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin: 2rem 0;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 1rem;
    box-sizing: border-box;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.submit-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background 0.3s;
}

.submit-btn:hover {
    background: #219a52;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
}

.modal-content {
    background: white;
    margin: 15% auto;
    padding: 2rem;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    text-align: center;
}
`;

// إضافة الأنماط إلى الصفحة
const adminStyleSheet = document.createElement('style');
adminStyleSheet.textContent = adminStyles;
document.head.appendChild(adminStyleSheet);

// جعل الدوال متاحة globally
window.goToLogin = goToLogin;
window.goToHome = goToHome;
window.deleteAdminApp = deleteAdminApp;
window.copyAdminShareLink = copyAdminShareLink;
window.shareAdminAppSocial = shareAdminAppSocial;
