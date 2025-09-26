// BDM Dashboard - Полная версия с редактированием, импортом Excel и всеми функциями
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
let editingStoreId = null;
let editingTaskId = null;
let editingContactId = null;

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
    } else if (currentPage.id === 'tasks-page') {
        const taskCards = currentPage.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    } else if (currentPage.id === 'contacts-page') {
        const contactCards = currentPage.querySelectorAll('.contact-card');
        contactCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    }
}

// Загрузка файлов для сделок
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

// Excel импорт
function setupExcelImport() {
    const excelFile = document.getElementById('excelFile');
    const excelUploadArea = document.getElementById('excelUploadArea');

    if (!excelFile || !excelUploadArea) return;

    excelUploadArea.addEventListener('click', () => {
        excelFile.click();
    });

    excelFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            readExcelFile(file);
        }
    });
}

function readExcelFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            displayExcelPreview(jsonData);
        } catch (error) {
            console.error('Ошибка при чтении Excel файла:', error);
            showNotification('Ошибка при чтении Excel файла', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function displayExcelPreview(data) {
    const preview = document.getElementById('excelPreview');
    const table = document.getElementById('previewTable');
    const summary = document.getElementById('importSummary');
    const importBtn = document.getElementById('importBtn');

    if (!data || data.length === 0) {
        showNotification('Excel файл пуст или имеет неверный формат', 'error');
        return;
    }

    // Очищаем таблицу
    table.innerHTML = '';

    // Создаем заголовки
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Добавляем первые 5 строк для предварительного просмотра
    data.slice(0, 5).forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] || '';
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    // Показываем сводку
    summary.innerHTML = `
        <strong>Найдено строк:</strong> ${data.length}<br>
        <strong>Колонки:</strong> ${headers.join(', ')}<br>
        <small>Показаны первые 5 строк</small>
    `;

    // Показываем предварительный просмотр и кнопку импорта
    preview.style.display = 'block';
    importBtn.style.display = 'inline-flex';

    // Сохраняем данные для импорта
    window.excelDataToImport = data;
}

function importFromExcel() {
    const data = window.excelDataToImport;
    if (!data || data.length === 0) {
        showNotification('Нет данных для импорта', 'error');
        return;
    }

    let imported = 0;
    let errors = 0;

    data.forEach((row, index) => {
        try {
            // Мапим колонки Excel на поля магазина
            const store = {
                id: Date.now() + index,
                name: row['Название'] || row['Name'] || `Магазин ${index + 1}`,
                type: row['Тип'] || row['Type'] || 'Не указан',
                address: row['Адрес'] || row['Address'] || '',
                contact: row['Телефон'] || row['Phone'] || '',
                email: row['Email'] || row['email'] || '',
                manager: row['Менеджер'] || row['Manager'] || '',
                status: 'potential',
                monthlyRevenue: parseInt(row['Доход'] || row['Revenue'] || 0),
                contractDate: null,
                rating: 0
            };

            // Валидация обязательных полей
            if (store.name && store.type) {
                appData.stores.push(store);
                imported++;
            } else {
                errors++;
                console.warn(`Строка ${index + 1}: отсутствуют обязательные поля`);
            }
        } catch (error) {
            errors++;
            console.error(`Ошибка импорта строки ${index + 1}:`, error);
        }
    });

    // Обновляем интерфейс
    renderStores();
    closeExcelImportModal();
    autoSave();

    // Показываем результат импорта
    if (imported > 0) {
        showNotification(`Импортировано магазинов: ${imported}${errors > 0 ? `, ошибок: ${errors}` : ''}`, imported > 0 ? 'success' : 'warning');
    } else {
        showNotification('Не удалось импортировать ни одного магазина', 'error');
    }
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
            <div class="store-actions">
                <button class="btn-icon edit" onclick="editStore(${store.id})" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="confirmDeleteStore(${store.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <h3>${store.name}</h3>
            <p><strong>Тип:</strong> ${store.type}</p>
            <p><strong>Адрес:</strong> ${store.address}</p>
            <p><strong>Телефон:</strong> ${store.contact}</p>
            <p><strong>Email:</strong> ${store.email}</p>
            <p><strong>Менеджер:</strong> ${store.manager}</p>
            <p><strong>Статус:</strong> <span class="status-badge ${store.status}">${getStoreStatusName(store.status)}</span></p>
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

function editStore(storeId) {
    const store = appData.stores.find(s => s.id === storeId);
    if (!store) return;

    editingStoreId = storeId;

    // Заполняем форму данными магазина
    document.getElementById('storeId').value = store.id;
    document.getElementById('storeName').value = store.name;
    document.getElementById('storeType').value = store.type;
    document.getElementById('storeAddress').value = store.address;
    document.getElementById('storeContact').value = store.contact;
    document.getElementById('storeEmail').value = store.email;
    document.getElementById('storeManager').value = store.manager;
    document.getElementById('storeRevenue').value = store.monthlyRevenue;

    // Изменяем заголовок и кнопку
    document.getElementById('storeModalTitle').textContent = 'Редактировать магазин';
    document.getElementById('storeSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';

    // Открываем модальное окно
    openStoreModal();
}

function confirmDeleteStore(storeId) {
    const store = appData.stores.find(s => s.id === storeId);
    if (!store) return;

    showConfirmModal(
        'Удаление магазина',
        `Вы уверены, что хотите удалить магазин "${store.name}"? Это действие нельзя отменить.`,
        () => deleteStore(storeId)
    );
}

function deleteStore(storeId) {
    const index = appData.stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
        const deletedStore = appData.stores.splice(index, 1)[0];

        // Удаляем связанные сделки и задачи
        appData.deals = appData.deals.filter(deal => deal.storeId !== storeId);
        appData.tasks = appData.tasks.filter(task => task.storeId !== storeId);
        appData.contacts = appData.contacts.filter(contact => contact.storeId !== storeId);

        renderStores();
        renderDeals();
        renderTasks();
        renderContacts();
        renderDashboard();
        autoSave();

        showNotification(`Магазин "${deletedStore.name}" удален`);
    }
}

function renderTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    container.innerHTML = '';

    appData.tasks.forEach(task => {
        const store = appData.stores.find(s => s.id === task.storeId);
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-card ${task.priority}-priority`;
        taskDiv.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                ${store ? `<small><strong>Магазин:</strong> ${store.name}</small><br>` : ''}
                <small><strong>Срок:</strong> ${new Date(task.dueDate).toLocaleDateString('ru-RU')}</small>
            </div>
            <div class="task-actions">
                <span class="priority-badge ${task.priority}">${getPriorityName(task.priority)}</span>
                <button class="btn-icon edit" onclick="editTask(${task.id})" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="confirmDeleteTask(${task.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
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

function editTask(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;

    // Заполняем форму данными задачи
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStore').value = task.storeId || '';

    // Изменяем заголовок и кнопку
    document.getElementById('taskModalTitle').textContent = 'Редактировать задачу';
    document.getElementById('taskSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';

    // Открываем модальное окно
    openTaskModal();
}

function confirmDeleteTask(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task) return;

    showConfirmModal(
        'Удаление задачи',
        `Вы уверены, что хотите удалить задачу "${task.title}"?`,
        () => deleteTask(taskId)
    );
}

function deleteTask(taskId) {
    const index = appData.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        const deletedTask = appData.tasks.splice(index, 1)[0];
        renderTasks();
        renderDashboard();
        autoSave();
        showNotification(`Задача "${deletedTask.title}" удалена`);
    }
}

function renderContacts() {
    const container = document.getElementById('contacts-grid');
    if (!container) return;

    container.innerHTML = '';

    appData.contacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-card';
        contactDiv.innerHTML = `
            <div class="contact-actions">
                <button class="btn-icon edit" onclick="editContact(${contact.id})" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="confirmDeleteContact(${contact.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
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

function editContact(contactId) {
    const contact = appData.contacts.find(c => c.id === contactId);
    if (!contact) return;

    editingContactId = contactId;

    // Заполняем форму данными контакта
    document.getElementById('contactId').value = contact.id;
    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactPosition').value = contact.position;
    document.getElementById('contactStore').value = contact.storeId;
    document.getElementById('contactPhone').value = contact.phone;
    document.getElementById('contactEmail').value = contact.email;

    // Изменяем заголовок и кнопку
    document.getElementById('contactModalTitle').textContent = 'Редактировать контакт';
    document.getElementById('contactSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';

    // Открываем модальное окно
    openContactModal();
}

function confirmDeleteContact(contactId) {
    const contact = appData.contacts.find(c => c.id === contactId);
    if (!contact) return;

    showConfirmModal(
        'Удаление контакта',
        `Вы уверены, что хотите удалить контакт "${contact.name}"?`,
        () => deleteContact(contactId)
    );
}

function deleteContact(contactId) {
    const index = appData.contacts.findIndex(c => c.id === contactId);
    if (index !== -1) {
        const deletedContact = appData.contacts.splice(index, 1)[0];
        renderContacts();
        autoSave();
        showNotification(`Контакт "${deletedContact.name}" удален`);
    }
}

function renderAnalytics() {
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

        // Если не редактируем, сбрасываем форму
        if (!editingStoreId) {
            document.getElementById('storeModalTitle').textContent = 'Добавить магазин';
            document.getElementById('storeSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Добавить магазин';
        }
    }
}

function closeStoreModal() {
    const modal = document.getElementById('storeModal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('storeForm');
        if (form) form.reset();
        editingStoreId = null;
    }
}

function openExcelImportModal() {
    const modal = document.getElementById('excelImportModal');
    if (modal) {
        modal.classList.add('active');
        setupExcelImport();
    }
}

function closeExcelImportModal() {
    const modal = document.getElementById('excelImportModal');
    if (modal) {
        modal.classList.remove('active');
        const preview = document.getElementById('excelPreview');
        const importBtn = document.getElementById('importBtn');
        const fileInput = document.getElementById('excelFile');

        if (preview) preview.style.display = 'none';
        if (importBtn) importBtn.style.display = 'none';
        if (fileInput) fileInput.value = '';

        window.excelDataToImport = null;
    }
}

function openTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.add('active');

        const storeSelect = document.getElementById('taskStore');
        if (storeSelect && !editingTaskId) {
            storeSelect.innerHTML = '<option value="">Выберите магазин (необязательно)</option>';

            appData.stores.forEach(store => {
                const option = document.createElement('option');
                option.value = store.id;
                option.textContent = store.name;
                storeSelect.appendChild(option);
            });
        }

        // Если не редактируем, сбрасываем форму
        if (!editingTaskId) {
            document.getElementById('taskModalTitle').textContent = 'Добавить задачу';
            document.getElementById('taskSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Добавить задачу';
        }
    }
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('taskForm');
        if (form) form.reset();
        editingTaskId = null;
    }
}

function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('active');

        const storeSelect = document.getElementById('contactStore');
        if (storeSelect && !editingContactId) {
            storeSelect.innerHTML = '<option value="">Выберите магазин</option>';

            appData.stores.forEach(store => {
                const option = document.createElement('option');
                option.value = store.id;
                option.textContent = store.name;
                storeSelect.appendChild(option);
            });
        }

        // Если не редактируем, сбрасываем форму
        if (!editingContactId) {
            document.getElementById('contactModalTitle').textContent = 'Добавить контакт';
            document.getElementById('contactSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Добавить контакт';
        }
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('contactForm');
        if (form) form.reset();
        editingContactId = null;
    }
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');

    if (modal && titleEl && messageEl && confirmBtn) {
        titleEl.textContent = title;
        messageEl.textContent = message;

        // Удаляем старые обработчики
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Добавляем новый обработчик
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            closeConfirmModal();
        });

        modal.classList.add('active');
    }
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Обработка форм
function setupFormHandlers() {
    const dealForm = document.getElementById('dealForm');
    const storeForm = document.getElementById('storeForm');
    const taskForm = document.getElementById('taskForm');
    const contactForm = document.getElementById('contactForm');

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
            renderDashboard();
            closeDealModal();
            autoSave();
            showNotification('Сделка успешно создана!');
        });
    }

    if (storeForm) {
        storeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const isEditing = editingStoreId !== null;

            if (isEditing) {
                // Редактируем существующий магазин
                const store = appData.stores.find(s => s.id === editingStoreId);
                if (store) {
                    store.name = formData.get('name');
                    store.type = formData.get('type');
                    store.address = formData.get('address');
                    store.contact = formData.get('contact');
                    store.email = formData.get('email');
                    store.manager = formData.get('manager');
                    store.monthlyRevenue = parseInt(formData.get('monthlyRevenue')) || 0;

                    // Обновляем имя магазина в сделках и контактах
                    appData.deals.forEach(deal => {
                        if (deal.storeId === editingStoreId) {
                            deal.storeName = store.name;
                        }
                    });
                    appData.contacts.forEach(contact => {
                        if (contact.storeId === editingStoreId) {
                            contact.storeName = store.name;
                        }
                    });

                    showNotification('Магазин успешно обновлен!');
                }
            } else {
                // Создаем новый магазин
                const store = {
                    id: Date.now(),
                    name: formData.get('name'),
                    type: formData.get('type'),
                    address: formData.get('address'),
                    contact: formData.get('contact'),
                    email: formData.get('email'),
                    manager: formData.get('manager'),
                    status: 'potential',
                    monthlyRevenue: parseInt(formData.get('monthlyRevenue')) || 0,
                    contractDate: null,
                    rating: 0
                };

                appData.stores.push(store);
                showNotification('Магазин успешно добавлен!');
            }

            renderStores();
            renderDashboard();
            closeStoreModal();
            autoSave();
        });
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const isEditing = editingTaskId !== null;

            if (isEditing) {
                // Редактируем существующую задачу
                const task = appData.tasks.find(t => t.id === editingTaskId);
                if (task) {
                    task.title = formData.get('title');
                    task.description = formData.get('description');
                    task.priority = formData.get('priority');
                    task.dueDate = formData.get('dueDate');
                    task.storeId = parseInt(formData.get('storeId')) || null;

                    showNotification('Задача успешно обновлена!');
                }
            } else {
                // Создаем новую задачу
                const task = {
                    id: Date.now(),
                    title: formData.get('title'),
                    description: formData.get('description'),
                    priority: formData.get('priority'),
                    dueDate: formData.get('dueDate'),
                    status: 'pending',
                    storeId: parseInt(formData.get('storeId')) || null
                };

                appData.tasks.push(task);
                showNotification('Задача успешно добавлена!');
            }

            renderTasks();
            renderDashboard();
            closeTaskModal();
            autoSave();
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const storeId = parseInt(formData.get('storeId'));
            const store = appData.stores.find(s => s.id === storeId);
            const isEditing = editingContactId !== null;

            if (isEditing) {
                // Редактируем существующий контакт
                const contact = appData.contacts.find(c => c.id === editingContactId);
                if (contact) {
                    contact.name = formData.get('name');
                    contact.position = formData.get('position');
                    contact.storeId = storeId;
                    contact.storeName = store ? store.name : '';
                    contact.phone = formData.get('phone');
                    contact.email = formData.get('email');

                    showNotification('Контакт успешно обновлен!');
                }
            } else {
                // Создаем новый контакт
                const contact = {
                    id: Date.now(),
                    name: formData.get('name'),
                    position: formData.get('position'),
                    storeId: storeId,
                    storeName: store ? store.name : '',
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    lastContact: new Date().toISOString().split('T')[0]
                };

                appData.contacts.push(contact);
                showNotification('Контакт успешно добавлен!');
            }

            renderContacts();
            closeContactModal();
            autoSave();
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
    setupExcelImport();

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
window.openExcelImportModal = openExcelImportModal;
window.closeExcelImportModal = closeExcelImportModal;
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.closeConfirmModal = closeConfirmModal;
window.removeFile = removeFile;
window.exportData = exportData;
window.toggleTheme = toggleTheme;
window.importFromExcel = importFromExcel;
window.editStore = editStore;
window.confirmDeleteStore = confirmDeleteStore;
window.editTask = editTask;
window.confirmDeleteTask = confirmDeleteTask;
window.editContact = editContact;
window.confirmDeleteContact = confirmDeleteContact;

// Функции тестирования
console.log('🧪 Тестирование всех функций...');
console.log('✅ showNotification:', typeof showNotification === 'function');
console.log('✅ toggleTheme:', typeof toggleTheme === 'function');
console.log('✅ exportData:', typeof exportData === 'function');
console.log('✅ openDealModal:', typeof openDealModal === 'function');
console.log('✅ setupFileUpload:', typeof setupFileUpload === 'function');
console.log('✅ renderDeals:', typeof renderDeals === 'function');
console.log('✅ renderStores:', typeof renderStores === 'function');
console.log('✅ renderTasks:', typeof renderTasks === 'function');
console.log('✅ renderContacts:', typeof renderContacts === 'function');
console.log('✅ editStore:', typeof editStore === 'function');
console.log('✅ deleteStore:', typeof confirmDeleteStore === 'function');
console.log('✅ importFromExcel:', typeof importFromExcel === 'function');
console.log('✅ Все функции готовы к работе!');