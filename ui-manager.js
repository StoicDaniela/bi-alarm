/**
 * BI Anomaly Detection System - UI Manager
 * Управление на потребителския интерфейс и CSV импорт
 */

// === TAB MANAGEMENT ===
function showDataTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.data-tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(tabName + 'DataInput');
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Activate corresponding button
    const clickedButton = event.target;
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    console.log(`📑 Switched to ${tabName} tab`);
}

function showChart(chartType) {
    // Update chart tab buttons
    const chartButtons = document.querySelectorAll('#analysis .tab-btn');
    chartButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate clicked button
    const clickedButton = event.target;
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Update chart area based on type
    updateChartDisplay(chartType);
    
    console.log(`📊 Switched to ${chartType} chart`);
}

function updateChartDisplay(chartType) {
    const chartArea = document.getElementById('chartArea');
    if (!chartArea) return;
    
    let chartContent = '';
    
    switch (chartType) {
        case 'sales':
            chartContent = generateSalesChart();
            break;
        case 'traffic':
            chartContent = generateTrafficChart();
            break;
        case 'production':
            chartContent = generateProductionChart();
            break;
        case 'combined':
            chartContent = generateCombinedChart();
            break;
        default:
            chartContent = getDefaultChartMessage();
    }
    
    chartArea.innerHTML = chartContent;
}

function generateSalesChart() {
    if (globalData.sales.length === 0) {
        return getNoDataMessage('💰 Продажби');
    }
    
    const recentSales = globalData.sales.slice(-30); // Last 30 entries
    const maxValue = Math.max(...recentSales.map(s => s.amount));
    const minValue = Math.min(...recentSales.map(s => s.amount));
    const avgValue = recentSales.reduce((sum, s) => sum + s.amount, 0) / recentSales.length;
    
    return `
        <div style="padding: 20px;">
            <h4>💰 Продажби - Последните ${recentSales.length} записа</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 20px; color: #4caf50;">${maxValue.toLocaleString()} лв</div>
                    <small>Максимум</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 20px; color: #2196f3;">${avgValue.toFixed(0).toLocaleString()} лв</div>
                    <small>Средно</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 20px; color: #ff6b6b;">${minValue.toLocaleString()} лв</div>
                    <small>Минимум</small>
                </div>
            </div>
            ${generateSimpleChart(recentSales.map(s => ({ date: s.date, value: s.amount, label: s.amount + ' лв' })), '#667eea')}
        </div>
    `;
}

function generateTrafficChart() {
    if (globalData.traffic.length === 0) {
        return getNoDataMessage('🌐 Трафик');
    }
    
    const recentTraffic = globalData.traffic.slice(-30);
    const maxVisitors = Math.max(...recentTraffic.map(t => t.visitors));
    const minVisitors = Math.min(...recentTraffic.map(t => t.visitors));
    const avgVisitors = recentTraffic.reduce((sum, t) => sum + t.visitors, 0) / recentTraffic.length;
    
    return `
        <div style="padding: 20px;">
            <h4>🌐 Уебсайт Трафик - Последните ${recentTraffic.length} записа</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 20px; color: #4caf50;">${maxVisitors.toLocaleString()}</div>
                    <small>Макс. посетители</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 20px; color: #2196f3;">${avgVisitors.toFixed(0).toLocaleString()}</div>
                    <small>Средно посетители</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 20px; color: #ff6b6b;">${minVisitors.toLocaleString()}</div>
                    <small>Мин. посетители</small>
                </div>
            </div>
            ${generateSimpleChart(recentTraffic.map(t => ({ date: t.date, value: t.visitors, label: t.visitors + ' посетители' })), '#4caf50')}
        </div>
    `;
}

function generateProductionChart() {
    if (globalData.production.length === 0) {
        return getNoDataMessage('🏭 Производство');
    }
    
    const recentProduction = globalData.production.slice(-30);
    const maxUnits = Math.max(...recentProduction.map(p => p.units));
    const minUnits = Math.min(...recentProduction.map(p => p.units));
    const avgUnits = recentProduction.reduce((sum, p) => sum + p.units, 0) / recentProduction.length;
    const avgDefectRate = recentProduction.reduce((sum, p) => sum + p.defectRate, 0) / recentProduction.length;
    
    return `
        <div style="padding: 20px;">
            <h4>🏭 Производство - Последните ${recentProduction.length} записа</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 18px; color: #4caf50;">${maxUnits.toLocaleString()}</div>
                    <small>Макс. единици</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 18px; color: #2196f3;">${avgUnits.toFixed(0).toLocaleString()}</div>
                    <small>Средно единици</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 18px; color: #ff6b6b;">${minUnits.toLocaleString()}</div>
                    <small>Мин. единици</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 18px; color: ${avgDefectRate > 5 ? '#ff6b6b' : '#4caf50'};">${avgDefectRate.toFixed(1)}%</div>
                    <small>Средно дефекти</small>
                </div>
            </div>
            ${generateSimpleChart(recentProduction.map(p => ({ date: p.date, value: p.units, label: p.units + ' единици' })), '#ff9800')}
        </div>
    `;
}

function generateCombinedChart() {
    if (globalData.sales.length === 0 && globalData.traffic.length === 0 && globalData.production.length === 0) {
        return getNoDataMessage('📊 Комбинирани данни');
    }
    
    return `
        <div style="padding: 20px;">
            <h4>📊 Комбиниран Преглед на Всички Данни</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="text-align: center; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                    <div style="font-size: 24px; color: #2196f3;">${globalData.sales.length}</div>
                    <small>💰 Записа продажби</small>
                </div>
                <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px;">
                    <div style="font-size: 24px; color: #4caf50;">${globalData.traffic.length}</div>
                    <small>🌐 Записа трафик</small>
                </div>
                <div style="text-align: center; padding: 15px; background: #fff3cd; border-radius: 8px;">
                    <div style="font-size: 24px; color: #ff9800;">${globalData.production.length}</div>
                    <small>🏭 Записа производство</small>
                </div>
            </div>
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h5>📈 Общи Тенденции</h5>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 10px;">
                        📊 <strong>Общо анализирани точки:</strong> ${globalData.sales.length + globalData.traffic.length + globalData.production.length}
                    </li>
                    <li style="margin-bottom: 10px;">
                        🚨 <strong>Активни аларми:</strong> ${globalData.alerts.filter(a => !a.resolved).length}
                    </li>
                    <li style="margin-bottom: 10px;">
                        🕐 <strong>Последно сканиране:</strong> ${globalData.lastScanTime ? formatTime(globalData.lastScanTime) : 'Никога'}
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function generateSimpleChart(data, color) {
    if (data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    return `
        <div style="margin-top: 20px;">
            <div style="display: flex; align-items: end; height: 150px; gap: 3px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e1e1e1;">
                ${data.slice(-20).map((point, index) => {
                    const height = ((point.value - minValue) / range) * 120 + 10;
                    return `
                        <div style="
                            width: ${100 / Math.min(data.length, 20)}%;
                            height: ${height}px;
                            background: ${color};
                            border-radius: 2px 2px 0 0;
                            margin: 0 1px;
                            display: flex;
                            align-items: end;
                            justify-content: center;
                            color: white;
                            font-size: 10px;
                            position: relative;
                        " title="${point.date}: ${point.label}">
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="text-align: center; margin-top: 5px; font-size: 12px; color: #666;">
                Последните ${Math.min(data.length, 20)} записа
            </div>
        </div>
    `;
}

function getNoDataMessage(dataType) {
    return `
        <div style="height: 250px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 10px; border: 2px dashed #dee2e6;">
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
                <h4>Няма данни за ${dataType}</h4>
                <p>Добавете данни в раздел "Настройки" за да видите графики</p>
            </div>
        </div>
    `;
}

function getDefaultChartMessage() {
    return `
        <div style="height: 300px; background: linear-gradient(45deg, #f8f9fa, #e9ecef); border: 2px dashed #dee2e6; display: flex; align-items: center; justify-content: center; border-radius: 10px;">
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">📈</div>
                <h4>Интерактивни Графики</h4>
                <p>Тук ще се показват детайлни графики на данните<br>с означени аномалии и тенденции</p>
            </div>
        </div>
    `;
}

// === CSV IMPORT FUNCTIONALITY ===
function importCSV() {
    const fileInput = document.getElementById('csvFileInput');
    const dataType = document.getElementById('csvDataType').value;
    
    if (!fileInput.files.length) {
        showNotification('❌ Моля изберете CSV файл!', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showNotification('❌ Моля изберете валиден CSV файл!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const parsedData = parseCSV(csv, dataType);
            
            if (parsedData.length === 0) {
                showNotification('❌ CSV файлът е празен или невалиден!', 'error');
                return;
            }
            
            // Show preview
            showCSVPreview(parsedData, dataType);
            
        } catch (error) {
            console.error('CSV Import Error:', error);
            showNotification('❌ Грешка при четене на CSV файла!', 'error');
        }
    };
    
    reader.readAsText(file);
}

function parseCSV(csvText, dataType) {
    const lines = csvText.trim().split('\n');
    const results = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        
        if (row.length < 2) continue; // Skip invalid rows
        
        try {
            let parsedRow;
            
            switch (dataType) {
                case 'sales':
                    // Expected format: date, amount, description
                    parsedRow = {
                        date: row[0],
                        amount: parseFloat(row[1]) || 0,
                        description: row[2] || '',
                        timestamp: getCurrentDateTime(),
                        id: Date.now() + i
                    };
                    break;
                    
                case 'traffic':
                    // Expected format: date, visitors, pageViews, source
                    parsedRow = {
                        date: row[0],
                        visitors: parseInt(row[1]) || 0,
                        pageViews: parseInt(row[2]) || 0,
                        source: row[3] || '',
                        timestamp: getCurrentDateTime(),
                        id: Date.now() + i
                    };
                    break;
                    
                case 'production':
                    // Expected format: date, units, defects, line
                    const units = parseInt(row[1]) || 0;
                    const defects = parseInt(row[2]) || 0;
                    parsedRow = {
                        date: row[0],
                        units: units,
                        defects: defects,
                        line: row[3] || '',
                        defectRate: units > 0 ? (defects / units) * 100 : 0,
                        timestamp: getCurrentDateTime(),
                        id: Date.now() + i
                    };
                    break;
                    
                default:
                    continue;
            }
            
            // Validate date
            if (isValidDate(parsedRow.date)) {
                results.push(parsedRow);
            }
            
        } catch (error) {
            console.warn(`Skipping invalid row ${i + 1}:`, row);
        }
    }
    
    return results;
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function showCSVPreview(data, dataType) {
    const previewContainer = document.getElementById('csvPreview');
    const previewContent = document.getElementById('csvPreviewContent');
    
    if (!previewContainer || !previewContent) return;
    
    const typeName = {
        'sales': '💰 Продажби',
        'traffic': '🌐 Трафик',
        'production': '🏭 Производство'
    }[dataType];
    
    let tableHTML = `
        <p><strong>Намерени ${data.length} валидни записа за ${typeName}</strong></p>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
    `;
    
    // Generate table headers based on data type
    switch (dataType) {
        case 'sales':
            tableHTML += '<th>Дата</th><th>Сума (лв)</th><th>Описание</th>';
            break;
        case 'traffic':
            tableHTML += '<th>Дата</th><th>Посетители</th><th>Прегледи</th><th>Източник</th>';
            break;
        case 'production':
            tableHTML += '<th>Дата</th><th>Единици</th><th>Дефекти</th><th>Линия</th><th>% Дефекти</th>';
            break;
    }
    
    tableHTML += '</tr></thead><tbody>';
    
    // Show first 10 rows as preview
    data.slice(0, 10).forEach(row => {
        tableHTML += '<tr>';
        switch (dataType) {
            case 'sales':
                tableHTML += `<td>${row.date}</td><td>${row.amount}</td><td>${row.description}</td>`;
                break;
            case 'traffic':
                tableHTML += `<td>${row.date}</td><td>${row.visitors}</td><td>${row.pageViews}</td><td>${row.source}</td>`;
                break;
            case 'production':
                tableHTML += `<td>${row.date}</td><td>${row.units}</td><td>${row.defects}</td><td>${row.line}</td><td>${row.defectRate.toFixed(1)}%</td>`;
                break;
        }
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    
    if (data.length > 10) {
        tableHTML += `<p style="margin-top: 10px;"><em>Показани са първите 10 от ${data.length} записа</em></p>`;
    }
    
    tableHTML += `
        <div style="margin-top: 15px;">
            <button onclick="confirmCSVImport('${dataType}')" class="btn" style="width: auto; margin-right: 10px;">✅ Импортирай данните</button>
            <button onclick="cancelCSVImport()" class="btn" style="width: auto; background: #6c757d;">❌ Отказ</button>
        </div>
    `;
    
    previewContent.innerHTML = tableHTML;
    previewContainer.style.display = 'block';
    
    // Store data temporarily for import
    window.pendingCSVData = data;
    window.pendingCSVType = dataType;
}

function confirmCSVImport(dataType) {
    if (!window.pendingCSVData) {
        showNotification('❌ Няма данни за импорт!', 'error');
        return;
    }
    
    const data = window.pendingCSVData;
    
    // Add data to global storage
    switch (dataType) {
        case 'sales':
            globalData.sales.push(...data);
            break;
        case 'traffic':
            globalData.traffic.push(...data);
            break;
        case 'production':
            globalData.production.push(...data);
            break;
    }
    
    // Sort by date
    if (globalData[dataType]) {
        globalData[dataType].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    saveDataToStorage();
    
    // Clear temporary data
    window.pendingCSVData = null;
    window.pendingCSVType = null;
    
    // Hide preview and clear form
    cancelCSVImport();
    
    // Update UI
    updateDashboard();
    checkForAnomalies();
    
    const typeName = {
        'sales': 'продажби',
        'traffic': 'трафик',
        'production': 'производство'
    }[dataType];
    
    showNotification(`✅ Успешно импортирани ${data.length} записа за ${typeName}!`, 'success');
    
    console.log(`📁 CSV Import completed: ${data.length} ${dataType} records`);
}

function cancelCSVImport() {
    const previewContainer = document.getElementById('csvPreview');
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
    
    // Clear temporary data
    window.pendingCSVData = null;
    window.pendingCSVType = null;
    
    // Clear file input
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
}

// === ALERT MANAGEMENT FUNCTIONS ===
function markAllAlertsRead() {
    globalData.alerts.forEach(alert => {
        alert.read = true;
    });
    
    saveDataToStorage();
    updateAlertsDisplay();
    showNotification('✅ Всички аларми са маркирани като прочетени!', 'success');
}

function exportAlerts() {
    const alerts = globalData.alerts.slice(0, 100); // Last 100 alerts
    
    if (alerts.length === 0) {
        showNotification('❌ Няма аларми за експорт!', 'warning');
        return;
    }
    
    const csvContent = generateAlertsCSV(alerts);
    downloadCSV(csvContent, 'bi-anomaly-alerts.csv');
    showNotification('✅ Алармите са експортирани успешно!', 'success');
}

function generateAlertsCSV(alerts) {
    const headers = ['Дата', 'Време', 'Тип', 'Категория', 'Съобщение', 'Статус'];
    const rows = alerts.map(alert => [
        formatDate(alert.timestamp),
        formatTime(alert.timestamp),
        alert.severity,
        alert.category,
        alert.message.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        alert.resolved ? 'Решена' : 'Активна'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function clearOldAlerts() {
    const activeAlerts = globalData.alerts.filter(alert => !alert.resolved);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentResolvedAlerts = globalData.alerts.filter(alert => 
        alert.resolved && new Date(alert.timestamp) > oneWeekAgo
    );
    
    globalData.alerts = [...activeAlerts, ...recentResolvedAlerts];
    
    saveDataToStorage();
    updateAlertsDisplay();
    updateDashboard();
    
    showNotification('✅ Старите аларми са изчистени!', 'success');
}

function runAnomalyCheck() {
    showNotification('🔍 Стартирано сканиране за аномалии...', 'info');
    
    setTimeout(() => {
        checkForAnomalies();
        showNotification('✅ Сканирането за аномалии приключи!', 'success');
    }, 1000);
}

// === DASHBOARD FUNCTIONS ===
function runImmediateScan() {
    runAnomalyCheck();
}

function exportDashboardReport() {
    const reportData = generateDashboardReport();
    downloadCSV(reportData, 'bi-anomaly-dashboard-report.csv');
    showNotification('✅ Dashboard отчетът е експортиран!', 'success');
}

function generateDashboardReport() {
    const totalData = globalData.sales.length + globalData.traffic.length + globalData.production.length;
    const activeAlerts = globalData.alerts.filter(a => !a.resolved).length;
    const resolvedAlerts = globalData.alerts.filter(a => a.resolved).length;
    
    const lines = [
        'BI Anomaly Detection System - Dashboard Report',
        `Генериран на: ${formatDate(new Date())} ${formatTime(new Date())}`,
        '',
        'ОБЩА СТАТИСТИКА:',
        `Общо анализирани данни: ${totalData}`,
        `Записи продажби: ${globalData.sales.length}`,
        `Записи трафик: ${globalData.traffic.length}`,
        `Записи производство: ${globalData.production.length}`,
        '',
        'АЛАРМИ:',
        `Активни аларми: ${activeAlerts}`,
        `Решени аларми: ${resolvedAlerts}`,
        `Последно сканиране: ${globalData.lastScanTime ? formatTime(globalData.lastScanTime) : 'Никога'}`,
        '',
        'НАСТРОЙКИ:',
        `Продажби - мин праг: ${globalData.settings.salesMinThreshold}`,
        `Продажби - макс праг: ${globalData.settings.salesMaxThreshold}`,
        `Продажби - % промяна: ${globalData.settings.salesChangePercent}%`,
        `Трафик - мин праг: ${globalData.settings.trafficMinThreshold}`,
        `Трафик - макс праг: ${globalData.settings.trafficMaxThreshold}`,
        `Трафик - % промяна: ${globalData.settings.trafficChangePercent}%`,
        `Производство - мин праг: ${globalData.settings.productionMinThreshold}`,
        `Производство - макс праг: ${globalData.settings.productionMaxThreshold}`,
        `Производство - % промяна: ${globalData.settings.productionChangePercent}%`,
    ];
    
    return lines.join('\n');
}

// Auto-initialize when loaded
console.log('🎨 UI Manager loaded successfully');