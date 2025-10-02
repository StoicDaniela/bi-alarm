/**
 * BI Anomaly Detection System - Data Manager
 * Управление на данни и детекция на аномалии
 */

// === GLOBAL DATA STORAGE ===
let globalData = {
    sales: [],
    traffic: [],
    production: [],
    settings: {
        salesMinThreshold: 2000,
        salesMaxThreshold: 8000,
        salesChangePercent: 25,
        trafficMinThreshold: 1000,
        trafficMaxThreshold: 6000,
        trafficChangePercent: 30,
        productionMinThreshold: 1000,
        productionMaxThreshold: 3000,
        productionChangePercent: 20
    },
    alerts: [],
    lastScanTime: null
};

// === UTILITY FUNCTIONS ===
function getCurrentDateTime() {
    return new Date().toISOString();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('bg-BG');
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
}

function calculatePercentageChange(newValue, oldValue) {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

// === DATA PERSISTENCE ===
function saveDataToStorage() {
    try {
        localStorage.setItem('biAnomalyData', JSON.stringify(globalData));
        console.log('✅ Data saved to localStorage');
    } catch (error) {
        console.error('❌ Failed to save data:', error);
    }
}

function loadDataFromStorage() {
    try {
        const stored = localStorage.getItem('biAnomalyData');
        if (stored) {
            globalData = { ...globalData, ...JSON.parse(stored) };
            console.log('✅ Data loaded from localStorage');
            return true;
        }
    } catch (error) {
        console.error('❌ Failed to load data:', error);
    }
    return false;
}

// === DATA INPUT FUNCTIONS ===
function addSalesData() {
    const date = document.getElementById('salesDate').value;
    const amount = parseFloat(document.getElementById('salesAmount').value);
    const description = document.getElementById('salesDescription').value;
    
    if (!date || !amount) {
        showNotification('❌ Моля въведете дата и сума!', 'error');
        return;
    }
    
    const salesEntry = {
        id: Date.now(),
        date: date,
        amount: amount,
        description: description || '',
        timestamp: getCurrentDateTime()
    };
    
    globalData.sales.push(salesEntry);
    saveDataToStorage();
    
    // Clear form
    document.getElementById('salesDate').value = '';
    document.getElementById('salesAmount').value = '';
    document.getElementById('salesDescription').value = '';
    
    showNotification('✅ Продажбата е добавена успешно!', 'success');
    updateDashboard();
    checkForAnomalies();
}

function addTrafficData() {
    const date = document.getElementById('trafficDate').value;
    const visitors = parseInt(document.getElementById('trafficVisitors').value);
    const pageViews = parseInt(document.getElementById('trafficPageViews').value);
    const source = document.getElementById('trafficSource').value;
    
    if (!date || !visitors) {
        showNotification('❌ Моля въведете дата и брой посетители!', 'error');
        return;
    }
    
    const trafficEntry = {
        id: Date.now(),
        date: date,
        visitors: visitors,
        pageViews: pageViews || 0,
        source: source || '',
        timestamp: getCurrentDateTime()
    };
    
    globalData.traffic.push(trafficEntry);
    saveDataToStorage();
    
    // Clear form
    document.getElementById('trafficDate').value = '';
    document.getElementById('trafficVisitors').value = '';
    document.getElementById('trafficPageViews').value = '';
    document.getElementById('trafficSource').value = '';
    
    showNotification('✅ Трафик данните са добавени успешно!', 'success');
    updateDashboard();
    checkForAnomalies();
}

function addProductionData() {
    const date = document.getElementById('productionDate').value;
    const units = parseInt(document.getElementById('productionUnits').value);
    const defects = parseInt(document.getElementById('productionDefects').value);
    const line = document.getElementById('productionLine').value;
    
    if (!date || !units) {
        showNotification('❌ Моля въведете дата и произведени единици!', 'error');
        return;
    }
    
    const productionEntry = {
        id: Date.now(),
        date: date,
        units: units,
        defects: defects || 0,
        line: line || '',
        defectRate: units > 0 ? (defects / units) * 100 : 0,
        timestamp: getCurrentDateTime()
    };
    
    globalData.production.push(productionEntry);
    saveDataToStorage();
    
    // Clear form
    document.getElementById('productionDate').value = '';
    document.getElementById('productionUnits').value = '';
    document.getElementById('productionDefects').value = '';
    document.getElementById('productionLine').value = '';
    
    showNotification('✅ Производствените данни са добавени успешно!', 'success');
    updateDashboard();
    checkForAnomalies();
}

// === SETTINGS MANAGEMENT ===
function saveAnomalySettings() {
    const settings = {
        salesMinThreshold: parseFloat(document.getElementById('salesMinThreshold').value) || 0,
        salesMaxThreshold: parseFloat(document.getElementById('salesMaxThreshold').value) || 999999,
        salesChangePercent: parseFloat(document.getElementById('salesChangePercent').value) || 25,
        trafficMinThreshold: parseFloat(document.getElementById('trafficMinThreshold').value) || 0,
        trafficMaxThreshold: parseFloat(document.getElementById('trafficMaxThreshold').value) || 999999,
        trafficChangePercent: parseFloat(document.getElementById('trafficChangePercent').value) || 30,
        productionMinThreshold: parseFloat(document.getElementById('productionMinThreshold').value) || 0,
        productionMaxThreshold: parseFloat(document.getElementById('productionMaxThreshold').value) || 999999,
        productionChangePercent: parseFloat(document.getElementById('productionChangePercent').value) || 20
    };
    
    globalData.settings = { ...globalData.settings, ...settings };
    saveDataToStorage();
    
    showNotification('✅ Настройките са записани успешно!', 'success');
    console.log('📊 Updated anomaly settings:', settings);
}

function loadAnomalySettings() {
    const settings = globalData.settings;
    
    // Load values into form fields
    document.getElementById('salesMinThreshold').value = settings.salesMinThreshold || '';
    document.getElementById('salesMaxThreshold').value = settings.salesMaxThreshold === 999999 ? '' : settings.salesMaxThreshold;
    document.getElementById('salesChangePercent').value = settings.salesChangePercent || '';
    
    document.getElementById('trafficMinThreshold').value = settings.trafficMinThreshold || '';
    document.getElementById('trafficMaxThreshold').value = settings.trafficMaxThreshold === 999999 ? '' : settings.trafficMaxThreshold;
    document.getElementById('trafficChangePercent').value = settings.trafficChangePercent || '';
    
    document.getElementById('productionMinThreshold').value = settings.productionMinThreshold || '';
    document.getElementById('productionMaxThreshold').value = settings.productionMaxThreshold === 999999 ? '' : settings.productionMaxThreshold;
    document.getElementById('productionChangePercent').value = settings.productionChangePercent || '';
}

// === ANOMALY DETECTION ===
function checkForAnomalies() {
    console.log('🔍 Running anomaly detection...');
    
    const newAlerts = [];
    const now = getCurrentDateTime();
    
    // Check Sales Anomalies
    if (globalData.sales.length > 0) {
        const latestSales = globalData.sales[globalData.sales.length - 1];
        const previousSales = globalData.sales.length > 1 ? globalData.sales[globalData.sales.length - 2] : null;
        
        // Threshold check
        if (latestSales.amount < globalData.settings.salesMinThreshold) {
            newAlerts.push(createAlert('critical', 'sales', 
                `Продажбите са под минималния праг: ${latestSales.amount} лв (праг: ${globalData.settings.salesMinThreshold} лв)`));
        }
        if (latestSales.amount > globalData.settings.salesMaxThreshold) {
            newAlerts.push(createAlert('warning', 'sales', 
                `Продажбите са над максималния праг: ${latestSales.amount} лв (праг: ${globalData.settings.salesMaxThreshold} лв)`));
        }
        
        // Percentage change check
        if (previousSales) {
            const changePercent = calculatePercentageChange(latestSales.amount, previousSales.amount);
            if (Math.abs(changePercent) > globalData.settings.salesChangePercent) {
                const direction = changePercent > 0 ? 'ръст' : 'спад';
                const severity = Math.abs(changePercent) > 40 ? 'critical' : 'warning';
                newAlerts.push(createAlert(severity, 'sales', 
                    `Значителен ${direction} в продажбите: ${Math.abs(changePercent).toFixed(1)}% (праг: ${globalData.settings.salesChangePercent}%)`));
            }
        }
    }
    
    // Check Traffic Anomalies
    if (globalData.traffic.length > 0) {
        const latestTraffic = globalData.traffic[globalData.traffic.length - 1];
        const previousTraffic = globalData.traffic.length > 1 ? globalData.traffic[globalData.traffic.length - 2] : null;
        
        // Threshold check
        if (latestTraffic.visitors < globalData.settings.trafficMinThreshold) {
            newAlerts.push(createAlert('warning', 'traffic', 
                `Трафикът е под минималния праг: ${latestTraffic.visitors} посетители (праг: ${globalData.settings.trafficMinThreshold})`));
        }
        if (latestTraffic.visitors > globalData.settings.trafficMaxThreshold) {
            newAlerts.push(createAlert('warning', 'traffic', 
                `Трафикът е над максималния праг: ${latestTraffic.visitors} посетители (праг: ${globalData.settings.trafficMaxThreshold})`));
        }
        
        // Percentage change check
        if (previousTraffic) {
            const changePercent = calculatePercentageChange(latestTraffic.visitors, previousTraffic.visitors);
            if (Math.abs(changePercent) > globalData.settings.trafficChangePercent) {
                const direction = changePercent > 0 ? 'ръст' : 'спад';
                newAlerts.push(createAlert('warning', 'traffic', 
                    `Значителен ${direction} в трафика: ${Math.abs(changePercent).toFixed(1)}% (праг: ${globalData.settings.trafficChangePercent}%)`));
            }
        }
    }
    
    // Check Production Anomalies
    if (globalData.production.length > 0) {
        const latestProduction = globalData.production[globalData.production.length - 1];
        const previousProduction = globalData.production.length > 1 ? globalData.production[globalData.production.length - 2] : null;
        
        // Threshold check
        if (latestProduction.units < globalData.settings.productionMinThreshold) {
            newAlerts.push(createAlert('warning', 'production', 
                `Производството е под минималния праг: ${latestProduction.units} единици (праг: ${globalData.settings.productionMinThreshold})`));
        }
        if (latestProduction.units > globalData.settings.productionMaxThreshold) {
            newAlerts.push(createAlert('info', 'production', 
                `Производството е над максималния праг: ${latestProduction.units} единици (праг: ${globalData.settings.productionMaxThreshold})`));
        }
        
        // Defect rate check
        if (latestProduction.defectRate > 5) {
            const severity = latestProduction.defectRate > 10 ? 'critical' : 'warning';
            newAlerts.push(createAlert(severity, 'production', 
                `Висок процент дефекти: ${latestProduction.defectRate.toFixed(1)}% (норма: <5%)`));
        }
        
        // Percentage change check
        if (previousProduction) {
            const changePercent = calculatePercentageChange(latestProduction.units, previousProduction.units);
            if (Math.abs(changePercent) > globalData.settings.productionChangePercent) {
                const direction = changePercent > 0 ? 'ръст' : 'спад';
                newAlerts.push(createAlert('info', 'production', 
                    `Значителен ${direction} в производството: ${Math.abs(changePercent).toFixed(1)}% (праг: ${globalData.settings.productionChangePercent}%)`));
            }
        }
    }
    
    // Add new alerts to global alerts
    newAlerts.forEach(alert => {
        globalData.alerts.unshift(alert); // Add to beginning
    });
    
    // Keep only last 100 alerts
    if (globalData.alerts.length > 100) {
        globalData.alerts = globalData.alerts.slice(0, 100);
    }
    
    globalData.lastScanTime = now;
    saveDataToStorage();
    
    if (newAlerts.length > 0) {
        console.log(`🚨 Found ${newAlerts.length} new anomalies`);
        updateAlertsDisplay();
        updateDashboard();
    } else {
        console.log('✅ No anomalies detected');
    }
}

function createAlert(severity, category, message) {
    return {
        id: Date.now() + Math.random(),
        severity: severity, // 'critical', 'warning', 'info', 'success'
        category: category, // 'sales', 'traffic', 'production', 'system'
        message: message,
        timestamp: getCurrentDateTime(),
        read: false,
        resolved: false
    };
}

// === UI UPDATE FUNCTIONS ===
function updateDashboard() {
    // Update metrics
    const criticalAlerts = globalData.alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
    const warningAlerts = globalData.alerts.filter(a => a.severity === 'warning' && !a.resolved).length;
    const totalActive = criticalAlerts + warningAlerts;
    
    // Update dashboard cards
    const activeAlertsElement = document.querySelector('#dashboard .metric');
    if (activeAlertsElement) {
        activeAlertsElement.textContent = totalActive;
        activeAlertsElement.style.color = totalActive > 0 ? '#ff6b6b' : '#4caf50';
    }
    
    // Update analyzed data count
    const totalData = globalData.sales.length + globalData.traffic.length + globalData.production.length;
    const analyzedDataElements = document.querySelectorAll('#dashboard .metric');
    if (analyzedDataElements[1]) {
        analyzedDataElements[1].textContent = totalData.toLocaleString();
    }
    
    console.log('📊 Dashboard updated');
}

function updateAlertsDisplay() {
    updateAlertCounts();
    updateActiveAlerts();
    updateAlertHistory();
}

function updateAlertCounts() {
    const criticalCount = globalData.alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
    const warningCount = globalData.alerts.filter(a => a.severity === 'warning' && !a.resolved).length;
    const resolvedCount = globalData.alerts.filter(a => a.resolved).length;
    
    const criticalElement = document.getElementById('criticalAlertsCount');
    const warningElement = document.getElementById('warningAlertsCount');
    const resolvedElement = document.getElementById('resolvedAlertsCount');
    
    if (criticalElement) criticalElement.textContent = criticalCount;
    if (warningElement) warningElement.textContent = warningCount;
    if (resolvedElement) resolvedElement.textContent = resolvedCount;
}

function updateActiveAlerts() {
    const activeAlertsContainer = document.getElementById('activeAlerts');
    if (!activeAlertsContainer) return;
    
    const activeAlerts = globalData.alerts.filter(a => !a.resolved).slice(0, 10);
    
    if (activeAlerts.length === 0) {
        activeAlertsContainer.innerHTML = '<div class="alert alert-success">🎉 Няма активни аларми! Всичко работи нормално.</div>';
        return;
    }
    
    activeAlertsContainer.innerHTML = activeAlerts.map(alert => {
        const severityClass = {
            'critical': 'alert-critical',
            'warning': 'alert-warning',
            'info': 'alert-info',
            'success': 'alert-success'
        }[alert.severity] || 'alert-info';
        
        const severityIcon = {
            'critical': '🔴 КРИТИЧНА АНОМАЛИЯ',
            'warning': '🟡 ПРЕДУПРЕЖДЕНИЕ',
            'info': '🔵 ИНФОРМАЦИЯ',
            'success': '🟢 УСПЕХ'
        }[alert.severity] || '🔵 ИНФОРМАЦИЯ';
        
        const categoryName = {
            'sales': 'Продажби',
            'traffic': 'Уебсайт Трафик',
            'production': 'Производство',
            'system': 'Система'
        }[alert.category] || 'Система';
        
        return `
            <div class="alert ${severityClass}">
                <strong>${severityIcon} - ${categoryName}</strong>
                <span class="alert-time">${formatTime(alert.timestamp)}</span><br>
                ${alert.message}
            </div>
        `;
    }).join('');
}

function updateAlertHistory() {
    const historyContainer = document.querySelector('#alertHistory tbody');
    if (!historyContainer) return;
    
    const recentAlerts = globalData.alerts.slice(0, 20);
    
    historyContainer.innerHTML = recentAlerts.map(alert => {
        const severityIcon = {
            'critical': '🔴 Критична',
            'warning': '🟡 Предупреждение',
            'info': '🔵 Информация',
            'success': '🟢 Успех'
        }[alert.severity] || '🔵 Информация';
        
        const categoryName = {
            'sales': 'Продажби',
            'traffic': 'Трафик',
            'production': 'Производство',
            'system': 'Система'
        }[alert.category] || 'Система';
        
        const status = alert.resolved ? 
            '<span style="color: #4caf50;">Решена</span>' : 
            '<span style="color: #ff9800;">Активна</span>';
        
        return `
            <tr>
                <td>${formatTime(alert.timestamp)}</td>
                <td><span style="color: ${alert.severity === 'critical' ? '#ff6b6b' : alert.severity === 'warning' ? '#ffa94d' : '#4caf50'};">${severityIcon}</span></td>
                <td>${categoryName}</td>
                <td>${alert.message.substring(0, 50)}${alert.message.length > 50 ? '...' : ''}</td>
                <td>${status}</td>
            </tr>
        `;
    }).join('');
}

// === NOTIFICATION SYSTEM ===
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        'success': '#4caf50',
        'error': '#ff6b6b',
        'warning': '#ffa94d',
        'info': '#2196f3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// === INITIALIZATION ===
function initializeDataManager() {
    console.log('🚀 Initializing Data Manager...');
    
    // Load data from storage
    loadDataFromStorage();
    
    // Load settings into form
    setTimeout(() => {
        loadAnomalySettings();
        updateDashboard();
        updateAlertsDisplay();
    }, 500);
    
    // Set up automatic anomaly checking (every 5 minutes)
    setInterval(() => {
        if (globalData.sales.length > 0 || globalData.traffic.length > 0 || globalData.production.length > 0) {
            checkForAnomalies();
        }
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('✅ Data Manager initialized successfully');
}

// Initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDataManager);
} else {
    initializeDataManager();
}