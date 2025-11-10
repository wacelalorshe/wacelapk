// js/auth.js - الإضافات اللازمة للوحة التحكم

// إعداد تسجيل الدخول للوحة التحكم
function setupAdminAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const message = document.getElementById('loginMessage');
            
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // حفظ بيانات المستخدم
                localStorage.setItem('user', JSON.stringify(user));
                
                // التحقق إذا كان المستخدم مسؤولاً
                if (email === 'admin@wacelmarkt.com' || email.includes('admin')) {
                    localStorage.setItem('isAdmin', 'true');
                }
                
                message.textContent = 'تم تسجيل الدخول بنجاح!';
                message.style.color = 'green';
                
                // إعادة التوجيه إلى لوحة التحكم إذا كان مسؤولاً
                setTimeout(() => {
                    if (localStorage.getItem('isAdmin')) {
                        window.location.href = 'admin.html';
                    } else {
                        updateAuthUI(true);
                    }
                    loginModal.style.display = 'none';
                    loginForm.reset();
                }, 1000);
                
            } catch (error) {
                message.textContent = getAuthErrorMessage(error.code);
                message.style.color = 'red';
            }
        });
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupAdminAuth();
});
