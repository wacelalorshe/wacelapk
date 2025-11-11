// js/create-admin.js - تشغيل هذا مرة واحدة فقط لإنشاء المسؤول
import { auth, createUserWithEmailAndPassword } from './firebase-config.js';

// إنشاء مستخدم مسؤول
async function createAdminUser() {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            'admin@wacelmarkt.com', 
            'Admin123456' // كلمة مرور قوية
        );
        console.log('تم إنشاء المستخدم المسؤول:', userCredential.user);
        alert('تم إنشاء المستخدم المسؤول بنجاح!');
        
        // تخزين بيانات المسؤول
        localStorage.setItem('user', 'admin@wacelmarkt.com');
        localStorage.setItem('isAdmin', 'true');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
        if (error.code === 'auth/email-already-in-use') {
            alert('المستخدم المسؤول موجود بالفعل!');
        } else {
            alert('خطأ في إنشاء المستخدم المسؤول: ' + error.message);
        }
    }
}

// تشغيل الدالة مرة واحدة فقط عند النقر على زر
document.addEventListener('DOMContentLoaded', function() {
    const createAdminBtn = document.getElementById('createAdminBtn');
    if (createAdminBtn) {
        createAdminBtn.addEventListener('click', createAdminUser);
    }
});

// جعل الدالة متاحة globally
window.createAdminUser = createAdminUser;
