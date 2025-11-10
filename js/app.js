// في js/app.js - إضافة بيانات تجريبية للاختبار
async function loadApps() {
    try {
        // بيانات تجريبية للاختبار
        const sampleApps = [
            {
                id: '1',
                name: 'تطبيق التواصل الاجتماعي',
                description: 'تطبيق رائع للتواصل مع الأصدقاء والعائلة',
                version: '1.0.0',
                size: '25',
                category: 'social',
                downloadURL: 'https://example.com/app1.zip',
                rating: 4.5,
                downloads: 1500
            },
            {
                id: '2', 
                name: 'تطبيق الترفيه',
                description: 'استمتع بأفضل محتوى ترفيهي',
                version: '2.1.0',
                size: '45',
                category: 'entertainment', 
                downloadURL: 'https://example.com/app2.zip',
                rating: 4.2,
                downloads: 2300
            },
            {
                id: '3',
                name: 'تطبيق الإنتاجية',
                description: 'زود إنتاجيتك مع هذا التطبيق المميز',
                version: '1.5.0', 
                size: '30',
                category: 'productivity',
                downloadURL: 'https://example.com/app3.zip',
                rating: 4.8,
                downloads: 1800
            }
        ];

        const querySnapshot = await getDocs(collection(db, "apps"));
        allApps = [];
        
        // إذا لم توجد تطبيقات في Firebase، استخدم البيانات التجريبية
        if (querySnapshot.empty) {
            allApps = sampleApps;
        } else {
            querySnapshot.forEach((doc) => {
                allApps.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        }
        
        displayApps(allApps);
        displayFeaturedApps();
        displayTrendingApps();
        
    } catch (error) {
        console.error("Error loading apps:", error);
        // في حالة الخطأ، استخدم البيانات التجريبية
        allApps = sampleApps;
        displayApps(allApps);
        displayFeaturedApps(); 
        displayTrendingApps();
    }
}
