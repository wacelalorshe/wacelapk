// دالة لعرض التطبيقات
function displayApps(apps) {
    const appsContainer = document.getElementById('apps-list');
    appsContainer.innerHTML = '';
    
    apps.forEach(app => {
        const appElement = `
            <div class="app-card">
                <h3>${app.name}</h3>
                <p>${app.description}</p>
                <button onclick="downloadApp('${app.id}')">تحميل</button>
            </div>
        `;
        appsContainer.innerHTML += appElement;
    });
}
