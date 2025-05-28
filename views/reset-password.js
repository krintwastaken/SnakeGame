document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    container.classList.add('show');

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const notificationContainer = document.querySelector('.notification-container');

    if (!token) {
        showNotification('Неверная ссылка для сброса пароля', 'error');
        return;
    }

    document.getElementById('token').value = token;

    // Добавлена функция для переключения видимости пароля
    function setupPasswordToggle(inputId, toggleId) {
        const passwordInput = document.getElementById(inputId);
        const togglePassword = document.getElementById(toggleId);

        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Инициализация переключателей видимости
    setupPasswordToggle('newPassword', 'toggleNewPassword');
    setupPasswordToggle('confirmPassword', 'toggleConfirmPassword');

    // Добавлена валидация пароля
    function validatePasswordRequirements() {
        const value = document.getElementById('newPassword').value;

        const lengthValid = value.length >= 8 && value.length <= 127;
        const uppercaseValid = /[A-ZА-ЯЁ]/.test(value);
        const specialCharValid = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value);
        const digitValid = /\d/.test(value);

        toggleRequirement('req-length', lengthValid);
        toggleRequirement('req-uppercase', uppercaseValid);
        toggleRequirement('req-special', specialCharValid);
        toggleRequirement('req-digit', digitValid);

        return lengthValid && uppercaseValid && specialCharValid && digitValid;
    }

    function toggleRequirement(id, isMet) {
        const el = document.getElementById(id);
        if (!el) return;

        if (isMet) {
            el.classList.add('met');
        } else {
            el.classList.remove('met');
        }
    }

    // Проверка при вводе пароля
    document.getElementById('newPassword').addEventListener('input', validatePasswordRequirements);

    document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Проверка требований к паролю
        if (!validatePasswordRequirements()) {
            showNotification('Пароль не соответствует требованиям', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/reset-password-with-token', {
            //const response = await fetch('http://localhost:5000/auth/reset-password-with-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при сбросе пароля');
            }

            showNotification('Пароль успешно изменен! Перенаправление...', 'success');
            setTimeout(() => window.location.href = 'index.html', 2000);
        } catch (error) {
            showNotification(error.message || 'Ошибка при сбросе пароля', 'error');
        }
    });

    // Улучшенная функция уведомлений в правом нижнем углу
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

        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 1000);
        }, 3000);
    }
});