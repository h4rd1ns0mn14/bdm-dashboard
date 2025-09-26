// BDM Dashboard - Полная версия с тестированием всех функций
let appData = {
    stores: [
        {
            id: 1,
            name: "Электроника Плюс",
            type: "Электроника",
            address: "ул. Тверская, 10, Москва",
            contact: "+7 (495) 123-45-67",
            email: "info@electroplus.ru",
            manager: "Иванов Петр Сергеевич",
            status: "active",
            monthlyRevenue: 2500000,
            contractDate: "2024-03-15",
            rating: 4.8
        },
        {
            id: 2,
            name: "Техно Мир",
            type: "Компьютеры и IT",
            address: "пр. Мира, 45, Москва",
            contact: "+7 (495) 987-65-43",
            email: "sales@tehnomir.ru",
            manager: "Сидорова Анна Владимировна",
            status: "active",
            monthlyRevenue: 1800000,
            contractDate: "2024-01-20",
            rating: 4.6
        },
        {
            id: 3,
            name: "Умный Дом",
            type: "Смарт-техника",
            address: "ул. Новый Арбат, 22, Москва",
            contact: "+7 (495) 111-22-33",
            email: "contact@smarthouse.ru",
            manager: "Козлов Дмитрий Алексеевич",
            status: "potential",
            monthlyRevenue: 0,
            contractDate: null,
            rating: 0
        }
    ],
    deals: [
        {
            id: 1,
            title: "Расширение ассортимента - Электроника Плюс",
            storeId: 1,
            storeName: "Электроника Плюс",
            amount: 500000,
            status: "contract",
            probability: 80,
            expectedCloseDate: "2025-01-15",
            description: "Расширение линейки продуктов умного дома",
            createdDate: "2024-11-01",
            files: []
        },
        {
            id: 2,
            title: "Новый контракт - Умный Дом",
            storeId: 3,
            storeName: "Умный Дом",
            amount: 750000,
            status: "negotiation",
            probability: 60,
            expectedCloseDate: "2025-02-01",
            description: "Заключение первого контракта с новым партнером",
            createdDate: "2024-11-15",
            files: []
        },
        {
            id: 3,
            title: "Продление договора - Техно Мир",
            storeId: 2,
            storeName: "Техно Мир",
            amount: 1200000,
            status: "leads",
            probability: 40,
            expectedCloseDate: "2025-03-01",
            description: "Продление договора на новый год",
            createdDate: "2024-12-01",
            files: []
        }
    ],
    tasks: [
        {
            id: 1,
            title: "Звонок в Электронику Плюс",
            description: "Обсудить детали нового контракта",
            dueDate: "2025-01-05",
            priority: "high",
            status: "pending",
            storeId: 1
        },
        {
            id: 2,
            title: "Презентация для Умного Дома",
            description: "Подготовить презентацию продуктов",
            dueDate: "2025-01-07",
            priority: "medium",
            status: "pending",
            storeId: 3
        }
    ],
    contacts: [
        {
            id: 1,
            name: "Иванов Петр Сергеевич",
            position: "Директор по закупкам",
            storeId: 1,
            storeName: "Электроника Плюс",
            phone: "+7 (495) 123-45-67",
            email: "p.ivanov@electroplus.ru",
            lastContact: "2024-12-20"
        }
    ]
};

let currentTheme = 'light';

// Система уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Переключение темы
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    localStorage.setItem('bdm-theme', currentTheme);
    showNotification(`Тема изменена на ${currentTheme === 'light' ? 'светлую' : 'тёмную'}`);
}

// Автосохранение
function autoSave() {
    localStorage.setItem('bdm-data', JSON.stringify(appData));
    console.log('Данные автоматически сохранены');
}

function loadData() {
    const saved = localStorage.getItem('bdm-data');
    if (saved) {
        try {
            appData = JSON.parse(saved);
            showNotification('Данные загружены из локального хранилища');
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    }
}

// Экспорт данных
function exportData(format = 'json') {
    const data = {
        stores: appData.stores,
        deals: appData.deals,
        tasks: appData.tasks,
        contacts: appData.contacts,
        exportDate: new Date().toISOString()
    };

    let content, mimeType, filename;

    if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        filename = 'bdm-data.json';
    } else if (format === 'csv') {
        content = convertToCSV(data.stores);
        mimeType = 'text/csv';
        filename = 'bdm-stores.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showNotification(`Данные экспортированы в формате ${format.toUpperCase()}`);
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(header => `"${item[header] || ''}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
}

// Навигация
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));

            item.classList.add('active');

            const pageId = item.dataset.page + '-page';
            const page = document.getElementById(pageId);
            if (page) {
                page.classList.add('active');

                // Обновляем содержимое страницы при переходе
                if (pageId === 'stores-page') {
                    renderStores();
                } else if (pageId === 'deals-page') {
                    renderDeals();
                } else if (pageId === 'tasks-page') {
                    renderTasks();
                } else if (pageId === 'contacts-page') {
                    renderContacts();
                } else if (pageId === 'analytics-page') {
                    renderAnalytics();
                }
            }

            const title = item.querySelector('span').textContent;
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = title;
            }
        });
    });
}

// Поиск
function setupSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterContent(query);
        });
    }
}

function filterContent(query) {
    const currentPage = document.querySelector('.page.active');
    if (!currentPage) return;

    if (currentPage.id === 'stores-page') {
        const storeCards = currentPage.querySelectorAll('.store-card');
        storeCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    } else if (currentPage.id === 'deals-page') {
        const dealCards = currentPage.querySelectorAll('.deal-card');
        dealCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    }
}

// Загрузка файлов
function setupFileUpload() {
    const fileArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('dealFiles');
    const uploadedFiles = document.getElementById('uploadedFiles');

    if (!fileArea || !fileInput || !uploadedFiles) return;

    fileArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileArea.classList.add('dragover');
    });

    fileArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileArea.classList.remove('dragover');
    });

    fileArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileArea.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });

    fileArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });

    function handleFiles(files) {
        uploadedFiles.innerHTML = '';

        files.forEach(file => {
            if (validateFile(file)) {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'uploaded-file';
                fileDiv.innerHTML = `
                    <i class="fas fa-${getFileIcon(file.type)}"></i>
                    <div>
                        <strong>${file.name}</strong>
                        <span>(${formatFileSize(file.size)})</span>
                    </div>
                    <button type="button" onclick="removeFile(this)" style="margin-left: auto; background: none; border: none; color: var(--accent-red); cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                uploadedFiles.appendChild(fileDiv);
            }
        });

        if (files.length > 0) {
            showNotification(`Загружено файлов: ${files.length}`);
        }
    }

    function validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        if (file.size > maxSize) {
            showNotification(`Файл ${file.name} слишком большой (максимум 10MB)`, 'error');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            showNotification(`Тип файла ${file.name} не поддерживается`, 'error');
            return false;
        }

        return true;
    }

    function getFileIcon(mimeType) {
        if (mimeType.includes('pdf')) return 'file-pdf';
        if (mimeType.includes('word')) return 'file-word';
        if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'file-excel';
        if (mimeType.includes('image')) return 'file-image';
        return 'file';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

function removeFile(button) {
    button.parentElement.remove();
    showNotification('Файл удален');
}

// Рендеринг данных
function renderDashboard() {
    const stats = calculateStats();

    const totalRevenueEl = document.getElementById('total-revenue');
    const activeStoresEl = document.getElementById('active-stores');
    const activeDealsEl = document.getElementById('active-deals');
    const todayTasksEl = document.getElementById('today-tasks');

    if (totalRevenueEl) totalRevenueEl.textContent = (stats.totalRevenue / 1000000).toFixed(2) + ' млн ₽';
    if (activeStoresEl) activeStoresEl.textContent = stats.activeStores;
    if (activeDealsEl) activeDealsEl.textContent = stats.totalDeals;
    if (todayTasksEl) todayTasksEl.textContent = stats.todayTasks;

    renderTopStores();
    renderSalesChart();
}

function calculateStats() {
    return {
        totalRevenue: appData.stores.reduce((sum, store) => sum + store.monthlyRevenue, 0),
        activeStores: appData.stores.filter(store => store.status === 'active').length,
        totalDeals: appData.deals.length,
        todayTasks: appData.tasks.filter(task => task.status === 'pending').length
    };
}

function renderTopStores() {
    const container = document.getElementById('top-stores');
    if (!container) return;

    container.innerHTML = '';

    appData.stores
        .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
        .slice(0, 5)
        .forEach(store => {
            const storeDiv = document.createElement('div');
            storeDiv.className = 'store-item';
            storeDiv.innerHTML = `
                <span class="store-name">${store.name}</span>
                <span class="store-revenue">${(store.monthlyRevenue / 1000000).toFixed(1)} млн ₽</span>
            `;
            container.appendChild(storeDiv);
        });
}

function renderSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            datasets: [{
                label: 'Продажи (млн ₽)',
                data: [4.2, 4.8, 5.2, 5.8, 6.1, 6.45],
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e2e8f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderDeals() {
    const statuses = ['leads', 'negotiation', 'contract', 'closed'];

    statuses.forEach(status => {
        const container = document.getElementById(`${status}-deals`);
        const countElement = document.getElementById(`${status}-count`);

        if (!container) return;

        container.innerHTML = '';

        const deals = appData.deals.filter(deal => deal.status === status);

        deals.forEach(deal => {
            const dealDiv = document.createElement('div');
            dealDiv.className = 'deal-card';
            dealDiv.dataset.dealId = deal.id;
            dealDiv.draggable = true;

            dealDiv.innerHTML = `
                <div class="deal-title">${deal.title}</div>
                <div class="deal-info">
                    <span class="deal-amount">${deal.amount.toLocaleString()} ₽</span>
                    <span class="deal-probability">${deal.probability}%</span>
                </div>
                <div class="deal-store">${deal.storeName}</div>
                <div class="deal-date">До: ${new Date(deal.expectedCloseDate).toLocaleDateString('ru-RU')}</div>
                ${deal.files && deal.files.length > 0 ? 
                    `<div style="margin-top: 8px; color: var(--accent-blue); font-size: 12px;">
                        <i class="fas fa-paperclip"></i> ${deal.files.length} файл(ов)
                    </div>` : ''}
            `;

            container.appendChild(dealDiv);
        });

        if (countElement) {
            countElement.textContent = deals.length;
        }
    });

    setupKanbanDragDrop();
}

function setupKanbanDragDrop() {
    const deals = document.querySelectorAll('.deal-card');
    const columns = document.querySelectorAll('.deals-container');

    deals.forEach(deal => {
        deal.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', deal.dataset.dealId);
            deal.classList.add('dragging');
        });

        deal.addEventListener('dragend', () => {
            deal.classList.remove('dragging');
        });
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.parentElement.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.parentElement.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const dealId = e.dataTransfer.getData('text/plain');
            const newStatus = column.parentElement.dataset.status;

            updateDealStatus(dealId, newStatus);
            column.parentElement.classList.remove('drag-over');
        });
    });
}

function updateDealStatus(dealId, newStatus) {
    const deal = appData.deals.find(d => d.id == dealId);
    if (deal) {
        deal.status = newStatus;
        renderDeals();
        autoSave();
        showNotification(`Сделка "${deal.title}" перемещена в "${getStatusName(newStatus)}"`);
    }
}

function getStatusName(status) {
    const names = {
        'leads': 'Лиды',
        'negotiation': 'Переговоры',
        'contract': 'Договор',
        'closed': 'Закрыто'
    };
    return names[status] || status;
}

function renderStores() {
    const container = document.getElementById('stores-grid');
    if (!container) return;

    container.innerHTML = '';

    appData.stores.forEach(store => {
        const storeDiv = document.createElement('div');
        storeDiv.className = 'store-card';
        storeDiv.innerHTML = `
            <h3>${store.name}</h3>
            <p><strong>Тип:</strong> ${store.type}</p>
            <p><strong>Адрес:</strong> ${store.address}</p>
            <p><strong>Телефон:</strong> ${store.contact}</p>
            <p><strong>Email:</strong> ${store.email}</p>
            <p><strong>Менеджер:</strong> ${store.manager}</p>
            <p><strong>Статус:</strong> ${getStoreStatusName(store.status)}</p>
            <p><strong>Доход в месяц:</strong> ${store.monthlyRevenue.toLocaleString()} ₽</p>
            ${store.rating > 0 ? `<p><strong>Рейтинг:</strong> ${store.rating}/5</p>` : ''}
        `;
        container.appendChild(storeDiv);
    });
}

function getStoreStatusName(status) {
    const names = {
        'active': 'Активный',
        'potential': 'Потенциальный',
        'paused': 'На паузе'
    };
    return names[status] || status;
}

function renderTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    container.innerHTML = '';

    appData.tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-card ${task.priority}-priority`;
        taskDiv.innerHTML = `
            <div>
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <small>Срок: ${new Date(task.dueDate).toLocaleDateString('ru-RU')}</small>
            </div>
            <div>
                <span class="priority ${task.priority}">${getPriorityName(task.priority)}</span>
            </div>
        `;
        container.appendChild(taskDiv);
    });
}

function getPriorityName(priority) {
    const names = {
        'high': 'Высокий',
        'medium': 'Средний',
        'low': 'Низкий'
    };
    return names[priority] || priority;
}

function renderContacts() {
    const container = document.getElementById('contacts-grid');
    if (!container) return;

    container.innerHTML = '';

    appData.contacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-card';
        contactDiv.innerHTML = `
            <h3>${contact.name}</h3>
            <p><strong>Должность:</strong> ${contact.position}</p>
            <p><strong>Магазин:</strong> ${contact.storeName}</p>
            <p><strong>Телефон:</strong> ${contact.phone}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Последний контакт:</strong> ${new Date(contact.lastContact).toLocaleDateString('ru-RU')}</p>
        `;
        container.appendChild(contactDiv);
    });
}

function renderAnalytics() {
    // Здесь можно добавить дополнительные графики
    setTimeout(() => {
        renderStoreTypesChart();
        renderConversionChart();
    }, 100);
}

function renderStoreTypesChart() {
    const ctx = document.getElementById('storeTypesChart');
    if (!ctx) return;

    const types = {};
    appData.stores.forEach(store => {
        types[store.type] = (types[store.type] || 0) + 1;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(types),
            datasets: [{
                data: Object.values(types),
                backgroundColor: [
                    '#4299e1',
                    '#68d391',
                    '#f6ad55',
                    '#fc8181',
                    '#9f7aea'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderConversionChart() {
    const ctx = document.getElementById('conversionChart');
    if (!ctx) return;

    const statuses = ['leads', 'negotiation', 'contract', 'closed'];
    const data = statuses.map(status => 
        appData.deals.filter(deal => deal.status === status).length
    );

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Лиды', 'Переговоры', 'Договор', 'Закрыто'],
            datasets: [{
                label: 'Количество сделок',
                data: data,
                backgroundColor: [
                    '#fc8181',
                    '#f6ad55',
                    '#4299e1',
                    '#68d391'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Модальные окна
function openDealModal() {
    const modal = document.getElementById('dealModal');
    if (modal) {
        modal.classList.add('active');

        const storeSelect = document.getElementById('dealStore');
        if (storeSelect) {
            storeSelect.innerHTML = '<option value="">Выберите магазин</option>';

            appData.stores.forEach(store => {
                const option = document.createElement('option');
                option.value = store.id;
                option.textContent = store.name;
                storeSelect.appendChild(option);
            });
        }

        setupFileUpload();
    }
}

function closeDealModal() {
    const modal = document.getElementById('dealModal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('dealForm');
        if (form) form.reset();
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (uploadedFiles) uploadedFiles.innerHTML = '';
    }
}

function openStoreModal() {
    const modal = document.getElementById('storeModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeStoreModal() {
    const modal = document.getElementById('storeModal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('storeForm');
        if (form) form.reset();
    }
}

// Обработка форм
function setupFormHandlers() {
    const dealForm = document.getElementById('dealForm');
    const storeForm = document.getElementById('storeForm');

    if (dealForm) {
        dealForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const files = Array.from(document.getElementById('dealFiles').files || []);

            const deal = {
                id: Date.now(),
                title: formData.get('title'),
                storeId: parseInt(formData.get('storeId')),
                storeName: appData.stores.find(s => s.id == formData.get('storeId'))?.name || '',
                amount: parseInt(formData.get('amount')) || 0,
                status: formData.get('status') || 'leads',
                probability: parseInt(formData.get('probability')) || 50,
                expectedCloseDate: formData.get('expectedCloseDate') || new Date().toISOString().split('T')[0],
                description: formData.get('description') || '',
                createdDate: new Date().toISOString(),
                files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
            };

            appData.deals.push(deal);
            renderDeals();
            closeDealModal();
            autoSave();
            showNotification('Сделка успешно создана!');
        });
    }

    if (storeForm) {
        storeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            const store = {
                id: Date.now(),
                name: formData.get('name'),
                type: formData.get('type'),
                address: formData.get('address'),
                contact: formData.get('contact'),
                email: formData.get('email'),
                manager: formData.get('manager'),
                status: 'potential',
                monthlyRevenue: 0,
                contractDate: null,
                rating: 0
            };

            appData.stores.push(store);
            renderStores();
            closeStoreModal();
            autoSave();
            showNotification('Магазин успешно добавлен!');
        });
    }
}

function setupCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = new Date().toLocaleDateString('ru-RU', options);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Инициализация BDM Dashboard...');

    // Загружаем данные
    loadData();

    // Настраиваем интерфейс
    setupCurrentDate();
    setupNavigation();
    setupSearch();
    setupFormHandlers();

    // Рендерим начальные данные
    renderDashboard();
    renderDeals();

    // Загружаем тему
    const savedTheme = localStorage.getItem('bdm-theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    }

    // Автосохранение каждые 30 секунд
    setInterval(autoSave, 30000);

    console.log('✅ BDM Dashboard готов к работе!');
    showNotification('Добро пожаловать в BDM Dashboard!');
});

// Глобальные функции
window.openDealModal = openDealModal;
window.closeDealModal = closeDealModal;
window.openStoreModal = openStoreModal;
window.closeStoreModal = closeStoreModal;
window.removeFile = removeFile;
window.exportData = exportData;
window.toggleTheme = toggleTheme;

// Тестирование функций при загрузке
console.log('🧪 Тестирование функций...');
console.log('✅ showNotification:', typeof showNotification === 'function');
console.log('✅ toggleTheme:', typeof toggleTheme === 'function');
console.log('✅ exportData:', typeof exportData === 'function');
console.log('✅ openDealModal:', typeof openDealModal === 'function');
console.log('✅ setupFileUpload:', typeof setupFileUpload === 'function');
console.log('✅ renderDeals:', typeof renderDeals === 'function');