// App State
let currentScreen = 'dashboard';
let currentStep = 1;
let chartInstance = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateStatus();
    drawChart();
});

function initializeApp() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Simulate periodic data checks
    setInterval(checkForAnomalies, 30000); // Check every 30 seconds
}

// Screen Navigation
function showScreen(screenName) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Show selected screen
    document.getElementById(screenName).classList.add('active');
    
    // Update navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-btn').classList.add('active');
    
    currentScreen = screenName;
    
    // Redraw chart if on details screen
    if (screenName === 'details') {
        setTimeout(drawChart, 100);
    }
}

// Alert Setup Steps
function nextStep(step) {
    const currentStepEl = document.getElementById(`step${currentStep}`);
    const nextStepEl = document.getElementById(`step${step}`);
    
    currentStepEl.classList.remove('active');
    nextStepEl.classList.add('active');
    
    currentStep = step;
}

function prevStep(step) {
    nextStep(step);
}

function selectMetric(metricName) {
    document.getElementById('metricName').value = metricName;
    
    // Add visual feedback
    const suggestions = document.querySelectorAll('.suggestion-btn');
    suggestions.forEach(btn => {
        btn.style.background = btn.textContent === metricName 
            ? 'rgba(86, 164, 177, 0.4)' 
            : 'rgba(86, 164, 177, 0.2)';
    });
}

function createAlert() {
    const metricName = document.getElementById('metricName').value;
    const thresholdType = document.getElementById('thresholdType').value;
    const thresholdValue = document.getElementById('thresholdValue').value;
    const comparisonPeriod = document.getElementById('comparisonPeriod').value;
    const apiKey = document.getElementById('apiKey').value;
    
    if (!metricName || !thresholdValue) {
        showNotification('Моля попълнете всички задължителни полета', 'warning');
        return;
    }
    
    // Simulate alert creation
    const newAlert = {
        metric: metricName,
        threshold: `${thresholdValue}% ${thresholdType === 'percentage' ? 'промяна' : 'стойност'}`,
        period: getComparisonText(comparisonPeriod),
        status: 'active'
    };
    
    addAlertToList(newAlert);
    
    // Reset form
    document.getElementById('metricName').value = '';
    document.getElementById('thresholdValue').value = '';
    
    // Go back to step 1
    nextStep(1);
    
    showNotification('✅ Аларма създадена успешно!', 'success');
    
    // Update active alarms count
    updateActiveAlarmsCount();
}

function getComparisonText(period) {
    switch(period) {
        case 'yesterday': return 'спрямо вчера';
        case 'lastWeek': return 'спрямо миналата седмица';
        case 'lastMonth': return 'спрямо миналия месец';
        default: return 'спрямо вчера';
    }
}

function addAlertToList(alert) {
    const existingAlerts = document.getElementById('existingAlerts');
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-config';
    alertDiv.innerHTML = `
        <div class="config-content">
            <h4>${alert.metric}</h4>
            <p>${alert.threshold} ${alert.period}</p>
            <span class="config-status active">Активна</span>
        </div>
        <button class="toggle-btn" onclick="toggleAlert(this)">⏸️</button>
    `;
    
    existingAlerts.appendChild(alertDiv);
}

function toggleAlert(button) {
    const alertConfig = button.closest('.alert-config');
    const statusSpan = alertConfig.querySelector('.config-status');
    
    if (statusSpan.classList.contains('active')) {
        statusSpan.classList.remove('active');
        statusSpan.textContent = 'Неактивна';
        statusSpan.style.background = 'rgba(107, 114, 128, 0.2)';
        statusSpan.style.color = '#6B7280';
        button.textContent = '▶️';
    } else {
        statusSpan.classList.add('active');
        statusSpan.textContent = 'Активна';
        statusSpan.style.background = 'rgba(74, 222, 128, 0.2)';
        statusSpan.style.color = '#4ADE80';
        button.textContent = '⏸️';
    }
    
    updateActiveAlarmsCount();
}

// Anomaly Details
function showAnomalyDetails(type) {
    const details = getAnomalyData(type);
    
    document.getElementById('anomalyTitle').textContent = details.title;
    document.getElementById('detailMetric').textContent = details.metric;
    document.getElementById('detailThreshold').textContent = details.threshold;
    document.getElementById('detailValue').textContent = details.value;
    document.getElementById('detailTime').textContent = details.time;
    
    // Switch to details screen
    showScreen('details');
    
    // Update navigation manually since event might not trigger properly
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    navBtns[2].classList.add('active'); // Details tab
    
    // Redraw chart with animation
    setTimeout(() => drawChart(type), 200);
}

function getAnomalyData(type) {
    const anomalies = {
        sales: {
            title: 'Общи Продажби - Аномалия',
            metric: 'Общи Продажби',
            threshold: 'Спад с повече от 15% спрямо вчера',
            value: '-18%',
            time: '2025-10-02 10:30'
        },
        basket: {
            title: 'Средна Стойност Кошница - Предупреждение',
            metric: 'Средна Стойност Кошница',
            threshold: 'Промяна с повече от 10% спрямо миналата седмица',
            value: '+12%',
            time: '2025-10-02 07:15'
        }
    };
    
    return anomalies[type] || anomalies.sales;
}

// Chart Drawing
function drawChart(anomalyType = 'sales') {
    const canvas = document.getElementById('anomalyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sample data for 7 days
    const data = getChartData(anomalyType);
    const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find min/max values
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(86, 164, 177, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i < labels.length; i++) {
        const x = padding + (i / (labels.length - 1)) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Draw line chart
    ctx.strokeStyle = '#56A4B1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((data[i] - minValue) / range) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw data points
    for (let i = 0; i < data.length; i++) {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((data[i] - minValue) / range) * chartHeight;
        
        // Highlight anomaly point (last point)
        if (i === data.length - 1) {
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add pulse animation effect
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#56A4B1';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    // Draw labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < labels.length; i++) {
        const x = padding + (i / (labels.length - 1)) * chartWidth;
        ctx.fillText(labels[i], x, height - 10);
    }
    
    // Draw anomaly marker
    const anomalyX = padding + ((data.length - 1) / (data.length - 1)) * chartWidth;
    const anomalyY = height - padding - ((data[data.length - 1] - minValue) / range) * chartHeight;
    
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚨 АНОМАЛИЯ', anomalyX, anomalyY - 15);
}

function getChartData(type) {
    const datasets = {
        sales: [120, 125, 118, 122, 127, 124, 102], // Last value shows the anomaly
        basket: [45, 47, 44, 46, 43, 48, 54]        // Last value shows the spike
    };
    
    return datasets[type] || datasets.sales;
}

// Notes Management
function saveNotes() {
    const notesField = document.getElementById('notesField');
    const note = notesField.value.trim();
    
    if (!note) {
        showNotification('Моля въведете забележка', 'warning');
        return;
    }
    
    const savedNotes = document.getElementById('savedNotes');
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-item';
    noteDiv.innerHTML = `
        <p>"${note}"</p>
        <span class="note-time">Сега</span>
    `;
    
    savedNotes.insertBefore(noteDiv, savedNotes.firstChild);
    notesField.value = '';
    
    showNotification('💾 Забележка запазена', 'success');
}

// Status Updates
function updateStatus() {
    const activeAlarms = document.querySelectorAll('.config-status.active').length;
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    
    if (activeAlarms > 2) {
        statusText.textContent = `Има активни аномалии (${activeAlarms - 2})`;
        statusDot.className = 'status-dot critical';
    } else if (activeAlarms > 1) {
        statusText.textContent = 'Има предупреждения (1)';
        statusDot.className = 'status-dot warning';
    } else {
        statusText.textContent = 'Всичко е нормално';
        statusDot.className = 'status-dot normal';
    }
}

function updateActiveAlarmsCount() {
    const activeCount = document.querySelectorAll('.config-status.active').length;
    document.getElementById('activeAlarms').textContent = activeCount;
    updateStatus();
}

// Anomaly Detection Simulation
function checkForAnomalies() {
    // Simulate random anomaly detection
    if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const anomalies = [
            {
                metric: 'Нови Регистрации',
                change: '-23%',
                severity: 'critical',
                icon: '🔴'
            },
            {
                metric: 'Време за Зареждане',
                change: '+45%',
                severity: 'warning',
                icon: '🟡'
            }
        ];
        
        const anomaly = anomalies[Math.floor(Math.random() * anomalies.length)];
        addNewAlert(anomaly);
        
        // Send notification
        showNotification(`🚨 АНОМАЛИЯ: ${anomaly.metric} ${anomaly.change}`, anomaly.severity);
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('BI Аларма за Аномалии', {
                body: `🚨 АНОМАЛИЯ: ${anomaly.metric} ${anomaly.change}`,
                icon: 'icon-192.png',
                badge: 'icon-192.png'
            });
        }
    }
}

function addNewAlert(anomaly) {
    const alertList = document.getElementById('alertList');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-item ${anomaly.severity}`;
    alertDiv.innerHTML = `
        <div class="alert-icon">${anomaly.icon}</div>
        <div class="alert-content">
            <h4>${anomaly.metric}</h4>
            <p>Промяна с ${anomaly.change} спрямо вчера</p>
            <span class="alert-time">Сега</span>
        </div>
        <button class="alert-action" onclick="showAnomalyDetails('new')">
            <span>→</span>
        </button>
    `;
    
    alertList.insertBefore(alertDiv, alertList.firstChild);
    
    // Update counters
    updateActiveAlarmsCount();
}

// Notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(74, 222, 128, 0.9)' : 
                    type === 'warning' ? 'rgba(245, 158, 11, 0.9)' : 
                    type === 'critical' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(86, 164, 177, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
