// js/auth.js - الإصدار المصحح
import { 
    auth, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from './firebase-config.js';

// إعداد مستمع حالة المصادقة
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user) {
        // المستخدم مسجل الدخول
        console.log("المستخدم مسجل الدخول:", user.email);
        
        // تخزين بيانات المستخدم
        localStorage.setItem('user', user.email);
        
        // التحقق إذا كان مسؤولاً
        const isAdmin = user.email === 'admin@wacelmarkt.com';
        localStorage.setItem('isAdmin', isAdmin);
        
        // تحديث واجهة المستخدم
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        
        // إذا كان في صفحة لوحة التحكم، تحميل المحتوى
        if (window.location.pathname.includes('admin.html')) {
            loadAdminContent();
        }
        
    } else {
        // المستخدم غير مسجل الدخول
        console.log("المستخدم غير مسجل الدخول");
        
        // مسح بيانات التخزين
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
        
        // تحديث واجهة المستخدم
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // إذا كان في صفحة لوحة التحكم، إعادة التوجيه
        if (window.location.pathname.includes('admin.html')) {
            redirectToLogin();
        }
    }
});

// تحميل محتوى لوحة التحكم
function loadAdminContent() {
    console.log("تحميل محتوى لوحة التحكم...");
    // سيتم تحميل المحتوى من خلال admin.js
}

// إعادة التوجيه لتسجيل الدخول
function redirectToLogin() {
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
}

// تهيئة نموذج تسجيل الدخول
document.addEventListener('DOMContentLoaded', function() {
    console.log("تهيئة نظام المصادقة...");
    
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // فتح نافذة تسجيل الدخول
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (loginModal) {
                loginModal.style.display = 'block';
            }
        });
    }
    
    // تسجيل الخروج
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('هل تريد تسجيل الخروج؟')) {
                signOut(auth).then(() => {
                    console.log("تم تسجيل الخروج بنجاح");
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAdmin');
                    window.location.reload();
                }).catch((error) => {
                    console.error("خطأ في تسجيل الخروج:", error);
                });
            }
        });
    }
    
    // معالجة تسجيل الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');
            
            if (!email || !password) {
                showLoginMessage('يرجى ملء جميع الحقول', 'error');
                return;
            }
            
            try {
                console.log("محاولة تسجيل الدخول:", email);
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("تم تسجيل الدخول بنجاح:", userCredential.user.email);
                
                showLoginMessage('تم تسجيل الدخول بنجاح!', 'success');
                
                // إغلاق النافذة بعد نجاح التسجيل
                setTimeout(() => {
                    if (loginModal) {
                        loginModal.style.display = 'none';
                    }
                    loginForm.reset();
                }, 1500);
                
            } catch (error) {
                console.error("خطأ في تسجيل الدخول:", error);
                let errorMessage = 'خطأ في تسجيل الدخول';
                
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'البريد الإلكتروني غير صحيح';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'هذا الحساب معطل';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'لم يتم العثور على حساب بهذا البريد';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'كلمة المرور غير صحيحة';
                        break;
                    default:
                        errorMessage = error.message;
                }
                
                showLoginMessage(errorMessage, 'error');
            }
        });
    }
    
    // إغلاق نافذة تسجيل الدخول
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
});

// عرض رسائل تسجيل الدخول
function showLoginMessage(text, type) {
    const messageDiv = document.getElementById('loginMessage');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.style.color = type === 'success' ? 'green' : 'red';
        messageDiv.style.padding = '10px';
        messageDiv.style.margin = '10px 0';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.backgroundColor = type === 'success' ? '#e8f5e8' : '#ffe8e8';
        messageDiv.style.border = type === 'success' ? '1px solid #27ae60' : '1px solid #e74c3c';
        
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.style.backgroundColor = 'transparent';
            messageDiv.style.border = 'none';
        }, 5000);
    }
}

// الانتقال لتسجيل الدخول
function goToLogin() {
    window.location.href = 'index.html';
}

// الانتقال للصفحة الرئيسية
function goToHome() {
    window.location.href = 'index.html';
}

// جعل الدوال متاحة globally
window.goToLogin = goToLogin;
window.goToHome = goToHome;
