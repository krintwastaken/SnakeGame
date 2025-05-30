let recaptchaWidgetId = null;

document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('show');
    }

    const form = document.getElementById('twoFactorForm');
    const notificationContainer = document.querySelector('.notification-container');
    const captchaModal = document.getElementById('captchaModal');
    const captchaConfirmBtn = document.getElementById('captchaConfirmBtn');
    let captchaPassed = false;
    let failedAttempts = 0;
    const MAX_ATTEMPTS = 5;
    
    const captchaForm = document.getElementById('captchaForm');
    captchaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (captchaPassed) {
            captchaModal.style.display = 'none';
            captchaModal.classList.remove('show');
            failedAttempts = 0;
            captchaPassed = false;
            grecaptcha.reset();
        } else {
            showNotification('Пожалуйста, подтвердите капчу', 'error');
        }
    });

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
            }, 300);
        }, 3000);
    }

    function showCaptchaModal() {
        captchaModal.style.display = 'flex';
        captchaModal.classList.add('show');
        const recaptchaContainer = document.getElementById('recaptcha-container');
        captchaPassed = false;

        if (typeof grecaptcha !== "undefined") {
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
            // Делаем контейнер видимым после рендера
            recaptchaContainer.classList.add('show');
        } else {
            showNotification('Ошибка загрузки капчи. Попробуйте обновить страницу.', 'error');
        }
    }
/*
    captchaConfirmBtn.addEventListener('click', () => {
        if (captchaPassed) {
            captchaModal.style.display = 'none';
            failedAttempts = 0;
            captchaPassed = false;
            grecaptcha.reset();
        } else {
            showNotification('Пожалуйста, подтвердите капчу', 'error');
        }
    });
*/
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (captchaModal.style.display === 'flex') {
            showNotification('Сначала подтвердите капчу', 'error');
            return;
        }

        const twoFactorCode = document.getElementById('twoFactorCode').value;
        const username = localStorage.getItem('pendingUsername'); // Получаем имя пользователя из localStorage
        const password = localStorage.getItem('pendingPassword'); // Получаем пароль из localStorage

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/login', {
            //const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username, // Отправляем имя пользователя
                    password: password, // Отправляем пароль
                    twoFactorCode: twoFactorCode // Отправляем код 2FA
                })
            });

            if (!response.ok) {
                failedAttempts++;
                if (failedAttempts >= MAX_ATTEMPTS) showCaptchaModal();
                const errorData = await response.json();
                showNotification(errorData.message || 'Неверный код 2FA', 'error');
                return;
            }

            const data = await response.json();
            localStorage.removeItem('pendingUsername');
            localStorage.removeItem('pendingPassword');
            localStorage.setItem('token', data.token);
            showNotification('Вход выполнен успешно!', 'success');
            setTimeout(() => window.location.href = 'menu.html', 500);
            failedAttempts = 0;
        } catch (error) {
            failedAttempts++;
            if (failedAttempts >= MAX_ATTEMPTS) showCaptchaModal();
            showNotification('Много неудачных попыток ввода. Попробуйте позже', 'error');
        }
    });
});

