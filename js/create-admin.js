// js/create-admin.js - تشغيل هذا مرة واحدة فقط
import { auth, createUserWithEmailAndPassword } from './firebase-config.js';

// إنشاء مستخدم مسؤول
async function createAdminUser() {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            'admin@wacelmarkt.com', 
            'admin123456' // غير كلمة المرور لاحقاً
        );
        console.log('تم إنشاء المستخدم المسؤول:', userCredential.user);
        alert('تم إنشاء المستخدم المسؤول بنجاح!');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

// تشغيل الدالة مرة واحدة فقط
// createAdminUser();
