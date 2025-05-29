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

    const notificationContainer = document.querySelector('.notification-container');

    // Капча элементы
    const captchaModal = document.getElementById('captchaModal');
    const captchaForm = document.getElementById('captchaForm');
    const recaptchaContainer = document.getElementById('recaptcha-container');
    let recaptchaWidgetId = null;
    let captchaPassed = false;

    let failedAttempts = 0;
    const MAX_ATTEMPTS = 5;

    // Функция для уведомлений (копия из вашего кода)
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;

        if (type === 'success') {
            notification.classList.add('success');
        } else if (type === 'error') {
            notification.classList.add('error');
        }

        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 1000);
        }, 3000);
    }

    // Инициализация reCAPTCHA
    function renderRecaptcha() {
        if (typeof grecaptcha !== 'undefined') {
            if (recaptchaWidgetId === null) {
                recaptchaWidgetId = grecaptcha.render('recaptcha-container', {
                    'sitekey': '6Ld0KEArAAAAACcp0r_c-3t784MnYUf4UyImv2La',
                    'callback': () => {
                        captchaPassed = true;
                    }
                });
            } else {
                grecaptcha.reset(recaptchaWidgetId);
            }
            recaptchaContainer.classList.add('show');
        } else {
            showNotification('Ошибка загрузки капчи. Попробуйте обновить страницу.', 'error');
        }
    }

    // Показать капчу
    function showCaptchaModal() {
        captchaModal.style.display = 'flex';
        captchaModal.classList.add('show');
        captchaPassed = false;
        renderRecaptcha();
    }

    // Скрыть капчу
    function hideCaptchaModal() {
        captchaModal.style.display = 'none';
        captchaModal.classList.remove('show');
        failedAttempts = 0;
        captchaPassed = false;
        if (typeof grecaptcha !== 'undefined' && recaptchaWidgetId !== null) {
            grecaptcha.reset(recaptchaWidgetId);
        }
    }

    // Обработка подтверждения капчи
    captchaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (captchaPassed) {
            hideCaptchaModal();
            showNotification('Капча пройдена, вы можете продолжить', 'success');
        } else {
            showNotification('Пожалуйста, подтвердите капчу', 'error');
        }
    });

    // Модифицируем функции включения и выключения 2FA, чтобы учитывать капчу

    async function generateQrCode() {
        if (captchaModal.style.display === 'flex') {
            showNotification('Сначала подтвердите капчу', 'error');
            return;
        }

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
            failedAttempts++;
            if (failedAttempts >= MAX_ATTEMPTS) showCaptchaModal();
            showNotification(error.message, 'error');
        }
    }

    async function enableTwoFactor() {
        if (captchaModal.style.display === 'flex') {
            showNotification('Сначала подтвердите капчу', 'error');
            return;
        }

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
            fetchProfileData();
            twoFactorSetupDiv.style.display = 'none';
            generateQrCodeButton.style.display = 'none';
            disable2faButton.style.display = 'inline-block';
            failedAttempts = 0; // сброс попыток при успехе
        } catch (error) {
            console.error(error);
            failedAttempts++;
            if (failedAttempts >= MAX_ATTEMPTS) showCaptchaModal();
            showNotification(error.message, 'error');
        }
    }

    async function disableTwoFactor() {
        if (captchaModal.style.display === 'flex') {
            showNotification('Сначала подтвердите капчу', 'error');
            return;
        }

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
            fetchProfileData();
            generateQrCodeButton.style.display = 'inline-block';
            disable2faButton.style.display = 'none';
            failedAttempts = 0; // сброс попыток при успехе
        } catch (error) {
            console.error(error);
            failedAttempts++;
            if (failedAttempts >= MAX_ATTEMPTS) showCaptchaModal();
            showNotification(error.message, 'error');
        }
    }

    // Функция для получения данных профиля (без изменений)
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

    // Навешиваем обработчики
    generateQrCodeButton.addEventListener('click', generateQrCode);
    enable2faButton.addEventListener('click', enableTwoFactor);
    disable2faButton.addEventListener('click', disableTwoFactor);

    // Кнопка назад
    document.getElementById('menu-button').addEventListener('click', () => {
        window.location.href = 'menu.html';
    });

    fetchProfileData();
});
