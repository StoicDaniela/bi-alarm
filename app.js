// app.js - Основно приложение с интеграция на автентикация

// Глобални променливи
let alerts = JSON.parse(localStorage.getItem('alerts')) || [];
let nextAlertId = parseInt(localStorage.getItem('nextAlertId')) || 1;

// Инициализация при зареждане
document.addEventListener('DOMContentLoaded', function() {
    // Зачакване auth.js да се зареди
    setTimeout(() => {
        initializeApp();
    }, 100);
});

// Инициализация на приложението
function initializeApp() {
    loadAlerts();
    updateActiveNavigation('dashboard');
}

// Показване на различни екрани
function showScreen(screenName) {
    // Проверка дали потребителят е влязъл
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser && screenName !== 'login') {
        console.log('Потребителят не е влязъл');
        return;
    }

    // Скриване на всички екрани
    const screens = ['dashboard', 'alerts', 'analysis', 'settings'];
    screens.forEach(screen => {
        const element = document.getElementById(screen);
        if (element) {
            element.style.display = 'none';
        }
    });

    // Скриване на админ панел
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }

    // Показване на избрания екран
    if (screenName === 'admin') {
        // Специално обработване за админ панел
        if (typeof showAdminPanel === 'function') {
            showAdminPanel();
        }
        return;
    }

    const targetScreen = document.getElementById(screenName);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        
        // Специфични действия за различни екрани
        switch(screenName) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'alerts':
                displayAlerts();
                break;
            case 'analysis':
                updateAnalysis();
                break;
            case 'settings':
                loadUserSettings();
                break;
        }
        
        // Обновяване на активната навигация
        updateActiveNavigation(screenName);
    }
}

// Обновяване на активната навигация
function updateActiveNavigation(activeScreen) {
    // Премахване на активен клас от всички навигационни бутони
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Добавяне на активен клас към текущия
    let selector;
    switch(activeScreen) {
        case 'dashboard':
            selector = '[onclick="showScreen(\'dashboard\')"]';
            break;
        case 'alerts':
            selector = '[onclick="showScreen(\'alerts\')"]';
            break;
        case 'analysis':
            selector = '[onclick="showScreen(\'analysis\')"]';
            break;
        case 'settings':
            selector = '[onclick="showScreen(\'settings\')"]';
            break;
        case 'admin':
            selector = '[onclick="showAdminPanel()"]';
            break;
    }
    
    if (selector) {
        const activeBtn = document.querySelector(selector);
        if (activeBtn && activeBtn.closest('.nav-item')) {
            activeBtn.closest('.nav-item').classList.add('active');
        }
    }
}

// Обновяване на dashboard с потребителски данни
function updateDashboard() {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (currentUser) {
        // Обновяване на welcome съобщението
        const welcomeText = document.querySelector('#dashboard h2');
        if (welcomeText) {
            welcomeText.textContent = `Добре дошли, ${currentUser.name}!`;
        }
        
        // Показване на статистики според ролята
        updateDashboardStats();
    }
    
    // Зареждане на последни аларми
    loadRecentAlerts();
}

// Обновяване на статистики в dashboard
function updateDashboardStats() {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser) return;

    // Общ брой аларми
    const totalAlerts = alerts.length;
    const activeAlerts = alerts.filter(alert => alert.status === 'Активна').length;
    const criticalAlerts = alerts.filter(alert => alert.priority === 'Критична').length;
    
    // Обновяване на статистики карти
    updateStatCard('total-alerts', totalAlerts);
    updateStatCard('active-alerts', activeAlerts);
    updateStatCard('critical-alerts', criticalAlerts);
    
    // За администратори - показване на допълнителни статистики
    if (currentUser.role === 'Администратор') {
        const usersCount = getAllUsersCount();
        updateStatCard('total-users', usersCount);
    }
}

// Помощна функция за обновяване на статистика карти
function updateStatCard(cardId, value) {
    const card = document.getElementById(cardId);
    if (card) {
        const valueElement = card.querySelector('.stat-value');
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
}

// Получаване на брой потребители (ако е достъпно)
function getAllUsersCount() {
    // Тази функция ще работи само ако auth.js е зареден
    try {
        return window.users ? window.users.length : 0;
    } catch (e) {
        return 0;
    }
}

// Зареждане на последни аларми в dashboard
function loadRecentAlerts() {
    const recentAlertsContainer = document.getElementById('recent-alerts-list');
    if (!recentAlertsContainer) return;
    
    // Взимане на последните 5 аларми
    const recentAlerts = alerts.slice(-5).reverse();
    
    if (recentAlerts.length === 0) {
        recentAlertsContainer.innerHTML = '<p class="no-data">Няма създадени аларми</p>';
        return;
    }
    
    recentAlertsContainer.innerHTML = recentAlerts.map(alert => `
        <div class="alert-item">
            <div class="alert-info">
                <h4>${alert.name}</h4>
                <p>${alert.description}</p>
                <span class="alert-meta">Тип: ${alert.type} | Приоритет: ${alert.priority}</span>
            </div>
            <div class="alert-status status-${alert.status.toLowerCase().replace(' ', '-')}">
                ${alert.status}
            </div>
        </div>
    `).join('');
}

// Създаване на нова аларма
function createAlert() {
    // Проверка за права
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser) {
        showErrorMessage('Трябва да влезете в системата!');
        return;
    }
    
    // Проверка за минимални права (само аналитици и администратори могат да създават аларми)
    if (!window.hasPermission || !window.hasPermission('Аналитик')) {
        showErrorMessage('Нямате права за създаване на аларми!');
        return;
    }
    
    const name = document.getElementById('alertName').value.trim();
    const description = document.getElementById('alertDescription').value.trim();
    const type = document.getElementById('alertType').value;
    const priority = document.getElementById('alertPriority').value;
    const threshold = document.getElementById('alertThreshold').value;
    
    // Валидация
    if (!name || !description || !threshold) {
        showErrorMessage('Моля попълнете всички задължителни полета!');
        return;
    }
    
    // Създаване на нова аларма
    const newAlert = {
        id: nextAlertId++,
        name: name,
        description: description,
        type: type,
        priority: priority,
        threshold: parseFloat(threshold),
        status: 'Активна',
        createdBy: currentUser.name,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        lastTriggered: null,
        triggerCount: 0
    };
    
    // Добавяне към масива
    alerts.push(newAlert);
    
    // Запазване в localStorage
    saveAlerts();
    
    // Изчистване на формата
    clearAlertForm();
    
    // Обновяване на дисплея
    displayAlerts();
    
    // Успешно съобщение
    showSuccessMessage('Алармата е създадена успешно!');
}

// Запазване на аларми в localStorage
function saveAlerts() {
    localStorage.setItem('alerts', JSON.stringify(alerts));
    localStorage.setItem('nextAlertId', nextAlertId.toString());
}

// Зареждане на аларми от localStorage
function loadAlerts() {
    const savedAlerts = localStorage.getItem('alerts');
    if (savedAlerts) {
        alerts = JSON.parse(savedAlerts);
    }
    
    const savedNextId = localStorage.getItem('nextAlertId');
    if (savedNextId) {
        nextAlertId = parseInt(savedNextId);
    }
}

// Показване на аларми
function displayAlerts() {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<div class="no-alerts">Няма създадени аларми</div>';
        return;
    }
    
    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-card">
            <div class="alert-header">
                <h3>${alert.name}</h3>
                <span class="status-badge status-${alert.status.toLowerCase().replace(' ', '-')}">${alert.status}</span>
            </div>
            <div class="alert-body">
                <p><strong>Описание:</strong> ${alert.description}</p>
                <p><strong>Тип:</strong> ${alert.type}</p>
                <p><strong>Приоритет:</strong> ${alert.priority}</p>
                <p><strong>Праг:</strong> ${alert.threshold}</p>
                <p><strong>Създадена от:</strong> ${alert.createdBy}</p>
                <p><strong>Дата:</strong> ${alert.createdAt}</p>
                ${alert.lastTriggered ? `<p><strong>Последно задействане:</strong> ${alert.lastTriggered}</p>` : ''}
            </div>
            <div class="alert-actions">
                <button onclick="toggleAlert(${alert.id})" class="btn-sm">
                    ${alert.status === 'Активна' ? 'Изключи' : 'Включи'}
                </button>
                <button onclick="editAlert(${alert.id})" class="btn-sm">Редактирай</button>
                <button onclick="deleteAlert(${alert.id})" class="btn-sm btn-danger">Изтрий</button>
                <button onclick="testAlert(${alert.id})" class="btn-sm btn-test">Тествай</button>
            </div>
        </div>
    `).join('');
}

// Превключване на статуса на аларма
function toggleAlert(alertId) {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
        alert.status = alert.status === 'Активна' ? 'Неактивна' : 'Активна';
        saveAlerts();
        displayAlerts();
        showSuccessMessage(`Алармата е ${alert.status.toLowerCase()}!`);
    }
}

// Редактиране на аларма
function editAlert(alertId) {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    // Проверка за права
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser || (!window.hasPermission || !window.hasPermission('Аналитик'))) {
        showErrorMessage('Нямате права за редактиране на аларми!');
        return;
    }
    
    // Основно редактиране чрез prompt (може да се подобри с модален прозорец)
    const newName = prompt('Ново име на алармата:', alert.name);
    if (newName && newName.trim()) {
        alert.name = newName.trim();
        
        const newDescription = prompt('Ново описание:', alert.description);
        if (newDescription && newDescription.trim()) {
            alert.description = newDescription.trim();
            
            const newThreshold = prompt('Нов праг:', alert.threshold);
            if (newThreshold && !isNaN(parseFloat(newThreshold))) {
                alert.threshold = parseFloat(newThreshold);
                
                saveAlerts();
                displayAlerts();
                showSuccessMessage('Алармата е обновена успешно!');
            }
        }
    }
}

// Изтриване на аларма
function deleteAlert(alertId) {
    // Проверка за права
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser || (!window.hasPermission || !window.hasPermission('Аналитик'))) {
        showErrorMessage('Нямате права за изтриване на аларми!');
        return;
    }
    
    if (confirm('Сигурни ли сте, че искате да изтриете тази аларма?')) {
        alerts = alerts.filter(a => a.id !== alertId);
        saveAlerts();
        displayAlerts();
        showSuccessMessage('Алармата е изтрита успешно!');
    }
}

// Тестване на аларма
function testAlert(alertId) {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    // Симулация на задействане
    alert.lastTriggered = new Date().toISOString().slice(0, 16).replace('T', ' ');
    alert.triggerCount = (alert.triggerCount || 0) + 1;
    
    saveAlerts();
    displayAlerts();
    
    // Показване на тестово съобщение
    showTestAlertMessage(alert);
}

// Показване на тестово съобщение за аларма
function showTestAlertMessage(alert) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'test-alert-message';
    messageDiv.innerHTML = `
        <div class="test-alert-content">
            <h3>🚨 ТЕСТОВА АЛАРМА</h3>
            <p><strong>${alert.name}</strong></p>
            <p>${alert.description}</p>
            <p>Приоритет: ${alert.priority}</p>
            <p>Праг: ${alert.threshold}</p>
            <button onclick="this.parentElement.parentElement.remove()">Затвори</button>
        </div>
    `;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = messageDiv.querySelector('.test-alert-content');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(messageDiv);
    
    // Автоматично премахване след 5 секунди
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Изчистване на формата за аларми
function clearAlertForm() {
    document.getElementById('alertName').value = '';
    document.getElementById('alertDescription').value = '';
    document.getElementById('alertType').value = 'Anomaly Detection';
    document.getElementById('alertPriority').value = 'Средна';
    document.getElementById('alertThreshold').value = '';
}

// Обновяване на анализ екрана
function updateAnalysis() {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser) return;
    
    // Основна статистика
    const analysisStats = document.getElementById('analysis-stats');
    if (analysisStats) {
        analysisStats.innerHTML = `
            <div class="stat-card">
                <h3>Общо аларми</h3>
                <div class="stat-value">${alerts.length}</div>
            </div>
            <div class="stat-card">
                <h3>Активни</h3>
                <div class="stat-value">${alerts.filter(a => a.status === 'Активна').length}</div>
            </div>
            <div class="stat-card">
                <h3>Критични</h3>
                <div class="stat-value">${alerts.filter(a => a.priority === 'Критична').length}</div>
            </div>
            <div class="stat-card">
                <h3>Задействания</h3>
                <div class="stat-value">${alerts.reduce((sum, a) => sum + (a.triggerCount || 0), 0)}</div>
            </div>
        `;
    }
    
    // Графика (може да се добави Charts.js или друга библиотека)
    const chartContainer = document.getElementById('analysis-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <h3>Графика на алармите по тип</h3>
                <p>Тук може да се добави графика с реални данни</p>
            </div>
        `;
    }
}

// Зареждане на потребителски настройки
function loadUserSettings() {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser) return;
    
    // Запълване на потребителски данни
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.innerHTML = `
            <div class="settings-section">
                <h3>Профил</h3>
                <div class="form-group">
                    <label>Име:</label>
                    <input type="text" value="${currentUser.name}" readonly>
                </div>
                <div class="form-group">
                    <label>Имейл:</label>
                    <input type="email" value="${currentUser.email}" readonly>
                </div>
                <div class="form-group">
                    <label>Роля:</label>
                    <input type="text" value="${currentUser.role}" readonly>
                </div>
                <div class="form-group">
                    <label>Компания:</label>
                    <input type="text" value="${currentUser.company}" readonly>
                </div>
            </div>
            <div class="settings-section">
                <h3>Настройки на алармите</h3>
                <div class="form-group">
                    <label>
                        <input type="checkbox" checked> Имейл нотификации
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" checked> Звукови нотификации
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox"> SMS нотификации
                    </label>
                </div>
            </div>
        `;
    }
}

// Помощни функции за съобщения
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-size: 14px;
        z-index: 1000;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}
