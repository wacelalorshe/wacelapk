// js/auth.js - الإصدار المصحح المعدل للعمل بدون import
console.log("تحميل نظام المصادقة...");

// عناصر واجهة المستخدم
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');

// فتح نافذة تسجيل الدخول
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        if (loginModal) loginModal.style.display = 'block';
    });
}

// إغلاق نافذة تسجيل الدخول
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) modal.style.display = 'none';
    });
});

// إغلاق النافذة عند النقر خارجها
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// تسجيل الدخول
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const message = document.getElementById('loginMessage');
        
        try {
            console.log("محاولة تسجيل الدخول بـ:", email);
            
            // بيانات الاختبار
            if (email === 'admin@wacelmarkt.com' && password === 'Admin123456') {
                console.log("تم تسجيل الدخول بنجاح (اختبار)");
                
                // حفظ بيانات المستخدم في localStorage
                localStorage.setItem('user', JSON.stringify({
                    uid: 'test-user-id',
                    email: email
                }));
                
                localStorage.setItem('isAdmin', 'true');
                
                if (message) {
                    message.textContent = 'تم تسجيل الدخول بنجاح!';
                    message.style.color = 'green';
                }
                
                // تحديث واجهة المستخدم
                updateAuthUI(true);
                
                // إغلاق النافذة بعد ثانية
                setTimeout(() => {
                    if (loginModal) loginModal.style.display = 'none';
                    if (loginForm) loginForm.reset();
                    
                    // إظهار رابط لوحة التحكم
                    showAdminLink();
                    
                    // الانتقال إلى لوحة التحكم
                    window.location.href = 'admin.html';
                }, 1000);
                
            } else {
                // محاولة تسجيل الدخول عبر Firebase
                if (window.firebaseAuth) {
                    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
                    const user = userCredential.user;
                    
                    console.log("تم تسجيل الدخول بنجاح:", user.email);
                    
                    // حفظ بيانات المستخدم في localStorage
                    localStorage.setItem('user', JSON.stringify({
                        uid: user.uid,
                        email: user.email
                    }));
                    
                    localStorage.setItem('isAdmin', 'true');
                    
                    if (message) {
                        message.textContent = 'تم تسجيل الدخول بنجاح!';
                        message.style.color = 'green';
                    }
                    
                    // تحديث واجهة المستخدم
                    updateAuthUI(true);
                    
                    // إغلاق النافذة بعد ثانية
                    setTimeout(() => {
                        if (loginModal) loginModal.style.display = 'none';
                        if (loginForm) loginForm.reset();
                        
                        // إظهار رابط لوحة التحكم
                        showAdminLink();
                        
                        // الانتقال إلى لوحة التحكم
                        window.location.href = 'admin.html';
                    }, 1000);
                } else {
                    throw new Error('بيانات الدخول غير صحيحة أو Firebase غير متوفر');
                }
            }
            
        } catch (error) {
            console.error("خطأ في تسجيل الدخول:", error);
            if (message) {
                message.textContent = getAuthErrorMessage(error.code || error.message);
                message.style.color = 'red';
            }
        }
    });
}

// تسجيل الخروج
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            if (window.firebaseAuth) {
                await firebaseAuth.signOut();
            }
            
            localStorage.removeItem('user');
            localStorage.removeItem('isAdmin');
            updateAuthUI(false);
            hideAdminLink();
            
            // إذا كان في لوحة التحكم، ارجع للصفحة الرئيسية
            if (window.location.pathname.includes('admin.html')) {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error("Error signing out:", error);
        }
    });
}

// تحديث واجهة المستخدم بناءً على حالة المصادقة
function updateAuthUI(isLoggedIn) {
    if (loginBtn && logoutBtn) {
        if (isLoggedIn) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }
}

// إظهار رابط لوحة التحكم للمستخدمين المسجلين
function showAdminLink() {
    let adminLink = document.querySelector('a[href="admin.html"]');
    if (!adminLink) {
        // إنشاء رابط لوحة التحكم إذا لم يكن موجوداً
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.textContent = 'لوحة التحكم';
            adminLink.style.marginRight = '15px';
            adminLink.style.padding = '8px 16px';
            adminLink.style.background = 'var(--gradient-primary)';
            adminLink.style.color = 'white';
            adminLink.style.borderRadius = '20px';
            adminLink.style.textDecoration = 'none';
            adminLink.style.fontWeight = '500';
            navActions.insertBefore(adminLink, loginBtn);
        }
    }
}

// إخفاء رابط لوحة التحكم
function hideAdminLink() {
    const adminLink = document.querySelector('a[href="admin.html"]');
    if (adminLink) {
        adminLink.remove();
    }
}

// الحصول على رسالة الخطأ
function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'البريد الإلكتروني غير صالح',
        'auth/user-disabled': 'هذا الحساب معطل',
        'auth/user-not-found': 'لم يتم العثور على حساب بهذا البريد',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/too-many-requests': 'محاولات تسجيل دخول كثيرة، حاول لاحقاً',
        'auth/network-request-failed': 'خطأ في الاتصال بالشبكة'
    };
    return errorMessages[errorCode] || 'حدث خطأ غير متوقع: ' + errorCode;
}

// التحقق من حالة المصادقة عند تحميل الصفحة
function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (user && isAdmin) {
        updateAuthUI(true);
        showAdminLink();
        console.log("المستخدم مسجل دخول:", user.email);
    } else {
        updateAuthUI(false);
        hideAdminLink();
        console.log("لا يوجد مستخدم مسجل");
    }
}

// مراقبة تغييرات حالة المصادقة (لـ Firebase فقط)
if (window.firebaseAuth) {
    firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            console.log("تغيير حالة المصادقة: مستخدم مسجل", user.email);
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email
            }));
            localStorage.setItem('isAdmin', 'true');
            updateAuthUI(true);
            showAdminLink();
        } else {
            console.log("تغيير حالة المصادقة: لا يوجد مستخدم");
            localStorage.removeItem('user');
            localStorage.removeItem('isAdmin');
            updateAuthUI(false);
            hideAdminLink();
        }
    });
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("تم تحميل صفحة المصادقة");
    checkAuthState();
});
