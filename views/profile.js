document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('show');
    }

    const usernameSpan = document.getElementById('username');    
    const emailSpan = document.getElementById('email');
    const twoFactorEnabledSpan = document.getElementById('two-factor-enabled');
    const twoFactorSetupDiv = document.getElementById('two-factor-setup');
    const qrCodeImg = document.getElementById('qr-code');
    const secretKeySpan = document.getElementById('secret-key');
    const generateQrCodeButton = document.getElementById('generate-qr-code');
    const disable2faButton = document.getElementById('disable-2fa');
    const enable2faButton = document.getElementById('enable-2fa');
    const verificationCodeInput = document.getElementById('verification-code');
    const errorMessageDiv = document.getElementById('error-message');
    const successMessageDiv = document.getElementById('success-message');
    
    // Получаем контейнер для уведомлений
    const notificationContainer = document.querySelector('.notification-container');

    // Функция для отображения уведомлений
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;

        // Добавляем классы в зависимости от типа уведомления
        if (type === 'success') {
            notification.classList.add('success');
        } else if (type === 'error') {
            notification.classList.add('error');
        }

        notificationContainer.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            // Удаляем элемент из DOM после завершения анимации
            setTimeout(() => {
                notification.remove();
            }, 1000);
        }, 3000);
    }

    // Функция для получения данных профиля
    async function fetchProfileData() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/profile', {
            //const response = await fetch('http://localhost:5000/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении данных профиля');
            }

            const data = await response.json();
            usernameSpan.textContent = data.username;
            emailSpan.textContent = data.email;

            // Обновление интерфейса в зависимости от статуса 2FA
            if (data.isTwoFactorEnabled) {
                twoFactorEnabledSpan.textContent = 'Включена';
                generateQrCodeButton.style.display = 'none';
                disable2faButton.style.display = 'inline-block';
            } else {
                twoFactorEnabledSpan.textContent = 'Отключена';
                generateQrCodeButton.style.display = 'inline-block';
                disable2faButton.style.display = 'none';
            }

        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
        }
    }

    // Функция для генерации QR-кода
    async function generateQrCode() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/two-factor/generate', {
            //const response = await fetch('http://localhost:5000/auth/two-factor/generate', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при генерации QR-кода');
            }

            const data = await response.json();
            qrCodeImg.src = data.qrCode;
            secretKeySpan.textContent = data.secret;
            twoFactorSetupDiv.style.display = 'block';
            generateQrCodeButton.style.display = 'none';
        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
        }
    }

    // Функция для включения 2FA
    async function enableTwoFactor() {
        const token = localStorage.getItem('token');
        const secret = secretKeySpan.textContent;
        const verificationCode = verificationCodeInput.value;

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/two-factor/enable', {
            //const response = await fetch('http://localhost:5000/auth/two-factor/enable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ secret, token: verificationCode })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при включении 2FA');
            }

            showNotification('Двухфакторная аутентификация включена!', 'success');
            fetchProfileData(); // Обновляем данные профиля
            twoFactorSetupDiv.style.display = 'none';
            generateQrCodeButton.style.display = 'none';
            disable2faButton.style.display = 'inline-block';
        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
        }
    }

    // Функция для выключения 2FA
    async function disableTwoFactor() {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/two-factor/disable', {
            //const response = await fetch('http://localhost:5000/auth/two-factor/disable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при выключении 2FA');
            }

            showNotification('Двухфакторная аутентификация выключена!', 'success');
            fetchProfileData(); // Обновляем данные профиля
            generateQrCodeButton.style.display = 'inline-block';
            disable2faButton.style.display = 'none';
        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
        }
    }

    // Функция для выхода из аккаунта
    function logout() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }

    // Функция для перехода в меню
    function goToMenu() {
        window.location.href = 'menu.html';
    }

    // Обработчики событий
    generateQrCodeButton.addEventListener('click', generateQrCode);
    enable2faButton.addEventListener('click', enableTwoFactor);
    disable2faButton.addEventListener('click', disableTwoFactor);
    /*document.getElementById('exit-button').addEventListener('click', logout);*/
    //Добавим кнопку для выхода на страницу menu.html
    document.getElementById('menu-button').addEventListener('click', goToMenu);

    // Загрузка данных профиля при загрузке страницы
    fetchProfileData();
});
