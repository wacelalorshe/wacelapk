// js/simple-auth.js - حل مصادقة مبسط
function setupSimpleAuth() {
    // محاكاة تسجيل الدخول بدون Firebase
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // قبول أي بريد وكلمة مرور للتجربة
            if (email && password) {
                localStorage.setItem('user', JSON.stringify({ email: email }));
                localStorage.setItem('isAdmin', 'true');
                
                alert('تم تسجيل الدخول بنجاح!');
                window.location.href = 'admin.html';
            } else {
                alert('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            }
        });
    }
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', setupSimpleAuth);
