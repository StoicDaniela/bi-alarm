// auth.js - Система за автентикация и управление на потребители
// Симулирана база данни с потребители
const users = [
    {
        id: 1,
        email: "stoicdaniela@gmail.com",
        password: "admin123",
        name: "Даниела Димова",
        role: "Администратор",
        company: "Stoic 11",
        joinDate: "2024-01-15",
        lastLogin: "2024-12-02 09:30"
    },
    {
        id: 2,
        email: "analyst@stoic11.com",
        password: "analyst123",
        name: "Мария Петрова",
        role: "Аналитик",
        company: "Stoic 11",
        joinDate: "2024-02-20",
        lastLogin: "2024-12-01 14:20"
    },
    {
        id: 3,
        email: "user@stoic11.com",
        password: "user123",
        name: "Иван Георгиев",
        role: "Потребител",
        company: "Stoic 11",
        joinDate: "2024-03-10",
        lastLogin: "2024-12-01 16:45"
    },
    {
        id: 4,
        email: "demo@example.com",
        password: "demo123",
        name: "Демо Потребител",
        role: "Потребител",
        company: "Demo Corp",
        joinDate: "2024-11-01",
        lastLogin: "2024-12-02 08:15"
    }
];

// Текущ потребител
let currentUser = null;

// Инициализация при зареждане на страницата
document.addEventListener('DOMContentLoaded', function() {
    checkAutoLogin();
    setupAuthEventListeners();
});

// Проверка за автоматичен вход
function checkAutoLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showLoginScreen();
    }
}

// Настройка на event listeners
function setupAuthEventListeners() {
    // Toggle between Login и Register
    document.getElementById('showRegister').addEventListener('click', function(e) {
        e.preventDefault();
        toggleAuthForms();
    });
    
    document.getElementById('showLogin').addEventListener('click', function(e) {
        e.preventDefault();
        toggleAuthForms();
    });
    
    // Enter key за форми
    document.getElementById('loginForm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    document.getElementById('registerForm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            register();
        }
    });
}

// Превключване между Login и Register форми
function toggleAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    
    // Изчистване на грешки
    clearAuthErrors();
}

// Функция за вход
function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Валидация
    if (!email || !password) {
        showAuthError('Моля въведете имейл и парола!');
        return;
    }
    
    // ВАЖНО: Търсене на потребител със строга проверка
    const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        // Успешен вход - ПРИНУДИТЕЛНО запазваме оригиналните данни
        currentUser = {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,  // Това е ключовото - запазваме точната роля
            company: user.company,
            joinDate: user.joinDate,
            lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        
        // Обновяване на последен вход в оригиналния масив
        user.lastLogin = currentUser.lastLogin;
        
        // ВАЖНО: Принудително изчистване на localStorage преди запазване
        localStorage.removeItem('currentUser');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Debug информация в конзолата
        console.log('Login successful for:', currentUser);
        console.log('User role:', currentUser.role);
        
        // Показване на основното приложение
        showMainApp();
        
        // Успешно съобщение
        showSuccessMessage(`Добре дошли, ${user.name}! Роля: ${user.role}`);
    } else {
        showAuthError('Грешен имейл или парола!');
    }
}

// Функция за регистрация
function register() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Валидация
    if (!name || !email || !password || !confirmPassword) {
        showAuthError('Моля попълнете всички полета!');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthError('Паролите не съвпадат!');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('Паролата трябва да е поне 6 символа!');
        return;
    }
    
    // Проверка дали имейлът съществува
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showAuthError('Потребител с този имейл вече съществува!');
        return;
    }
    
    // Създаване на нов потребител
    const newUser = {
        id: users.length + 1,
        email: email,
        password: password,
        name: name,
        role: "Потребител",
        company: "Нова компания",
        joinDate: new Date().toISOString().slice(0, 10),
        lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    
    // Добавяне към базата данни
    users.push(newUser);
    
    // Автоматичен вход
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Показване на основното приложение
    showMainApp();
    showSuccessMessage(`Регистрацията е успешна! Добре дошли, ${newUser.name}!`);
}

// Функция за изход
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginScreen();
    showSuccessMessage('Излязохте успешно от системата!');
}

// Показване на екран за вход
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // Изчистване на полетата
    clearAuthForms();
    clearAuthErrors();
}

// Показване на основното приложение
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Обновяване на потребителски данни в header
    updateUserInfo();
    
    // Проверка за права на администратор
    updateAdminAccess();
    
    // Показване на основния екран
    showScreen('dashboard');
}

// Обновяване на потребителски данни в header
function updateUserInfo() {
    if (currentUser) {
        console.log('Updating user info:', currentUser); // Debug
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userRole').textContent = currentUser.role;
    }
}

// Управление на достъп до администраторски функции
function updateAdminAccess() {
    const adminNavBtn = document.getElementById('adminNavBtn');
    const adminPanel = document.getElementById('adminPanel');
    
    console.log('Checking admin access for role:', currentUser?.role); // Debug
    
    if (currentUser && currentUser.role === 'Администратор') {
        console.log('User is administrator - showing admin panel'); // Debug
        if (adminNavBtn) adminNavBtn.style.display = 'block';
    } else {
        console.log('User is not administrator - hiding admin panel'); // Debug
        if (adminNavBtn) adminNavBtn.style.display = 'none';
        
        // Скриване на админ панела ако не е администратор
        if (adminPanel && adminPanel.style.display === 'block') {
            showScreen('dashboard');
        }
    }
}

// Показване на администраторски панел
function showAdminPanel() {
    if (!currentUser || currentUser.role !== 'Администратор') {
        showErrorMessage('Нямате права за достъп до администраторския панел!');
        return;
    }
    
    // Скриване на всички други екрани
    const screens = ['dashboard', 'alerts', 'analysis', 'settings'];
    screens.forEach(screen => {
        const element = document.getElementById(screen);
        if (element) element.style.display = 'none';
    });
    
    // Показване на админ панел
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'block';
    
    // Зареждане на потребителите
    loadUsersTable();
    
    // Обновяване на активната навигация
    updateActiveNavigation('admin');
}

// Зареждане на таблица с потребители
function loadUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.company}</td>
            <td>${user.joinDate}</td>
            <td>${user.lastLogin}</td>
            <td>
                ${user.id !== 1 ? `
                    <button onclick="editUser(${user.id})" class="btn btn-sm">Редактирай</button>
                    <button onclick="deleteUser(${user.id})" class="btn btn-sm btn-danger">Изтрий</button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Редакция на потребител (базова функционалност)
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        const newName = prompt('Ново име:', user.name);
        if (newName && newName.trim()) {
            user.name = newName.trim();
            loadUsersTable();
            showSuccessMessage('Потребителят е обновен успешно!');
        }
    }
}

// Изтриване на потребител
function deleteUser(userId) {
    if (userId === 1) {
        showErrorMessage('Не можете да изтриете главния администратор!');
        return;
    }
    
    if (confirm('Сигурни ли сте, че искате да изтриете този потребител?')) {
        const index = users.findIndex(u => u.id === userId);
        if (index > -1) {
            users.splice(index, 1);
            loadUsersTable();
            showSuccessMessage('Потребителят е изтрит успешно!');
        }
    }
}

// Проверка на права
function hasPermission(requiredRole) {
    if (!currentUser) return false;
    
    const roleHierarchy = {
        'Администратор': 3,
        'Аналитик': 2,
        'Потребител': 1
    };
    
    const userLevel = roleHierarchy[currentUser.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
}

// Обновяване на активната навигация
function updateActiveNavigation(activeScreen) {
    // Премахване на активен клас от всички навигационни бутони
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Добавяне на активен клас към текущия
    const activeBtn = document.querySelector(`[onclick*="${activeScreen}"]`);
    if (activeBtn && activeBtn.closest('.nav-item')) {
        activeBtn.closest('.nav-item').classList.add('active');
    }
}

// Показване на грешка при автентикация
function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Автоматично скриване след 5 секунди
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Изчистване на грешки при автентикация
function clearAuthErrors() {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}
// Изчистване на формулари за автентикация
function clearAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm && typeof loginForm.reset === 'function') {
        loginForm.reset();
    }
    if (registerForm && typeof registerForm.reset === 'function') {
        registerForm.reset();
    }
}

// Показване на съобщение за успех
function showSuccessMessage(message) {
    // Създаване на временно съобщение
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        font-size: 14px;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Автоматично премахване след 3 секунди
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Показване на съобщение за грешка
function showErrorMessage(message) {
    // Създаване на временно съобщение
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        font-size: 14px;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Автоматично премахване след 3 секунди
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Експорт на текущия потребител за използване в други файлове
window.getCurrentUser = function() {
    return currentUser;
};

// Експорт на функция за проверка на права
window.hasPermission = hasPermission;


// ВРЕМЕНЕН АДМИН БУТОН - ЛЕСНО РЕШЕНИЕ
function createAdminButton() {
    // Премахни стар админ бутон ако има
    const oldBtn = document.getElementById('tempAdminBtn');
    if (oldBtn) oldBtn.remove();
    
    // Създай нов админ бутон
    const adminBtn = document.createElement('button');
    adminBtn.id = 'tempAdminBtn';
    adminBtn.innerHTML = '👑 АДМИН ПАНЕЛ';
    adminBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    
    // Добави click събитие
    adminBtn.onclick = function() {
        showAdminPanel();
    };
    
    // Добави към страницата
    document.body.appendChild(adminBtn);
    
    console.log('Temporary admin button created!');
}

// Обновена showMainApp функция
const originalShowMainApp = showMainApp;
showMainApp = function() {
    originalShowMainApp();
    
    // Ако потребителят е администратор, покажи админ бутона
    if (currentUser && currentUser.role === 'Администратор') {
        setTimeout(createAdminButton, 500); // Малко забавяне за сигурност
        console.log('Admin button should appear for:', currentUser.name);
    }
};
