
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    container.classList.add('show');
    const notificationContainer = document.querySelector('.notification-container');

    document.getElementById('registrationForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Валидация на клиенте
        let isValid = true;

        if (username.length < 3) {
            showNotification('Имя пользователя должно быть не менее 3 символов', 'error');
            isValid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNotification('Введите корректный email', 'error');
            isValid = false;
        }

        if (!isValid) return;


        try {
            //const response = await fetch('http://localhost:5000/auth/registration', {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, email, password, confirmPassword})
            });

            if (!response.ok) {
                const errorData = await response.json();
                //Отображаем ошибки валидации с сервера
                if (errorData.errors) {
                    errorData.errors.forEach(error => {
                        if (error.path === 'username') {
                            showNotification(error.msg, 'error');
                        } else if (error.path === 'email') {
                            showNotification(error.msg, 'error');
                        } else if (error.path === 'password') {
                            showNotification(error.msg, 'error');
                        } else if (error.path === 'confirmPassword') {
                            showNotification(error.msg, 'error');
                        } else {
                            showNotification(error.msg, 'error');
                        }
                    });
                } else {
                    showNotification(errorData.message || 'Ошибка регистрации', 'error');
                }
                return;
            }

            const data = await response.json();
            document.querySelector('.container').classList.remove('show');
            document.querySelector('.container').classList.add('hide');
            showNotification('Регистрация прошла успешно!', 'success');
            setTimeout(() => {
                window.location.href = `verify-email.html?email=${encodeURIComponent(data.email)}`;
            }, 500);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

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
        }, 10); // Небольшая задержка для запуска анимации

        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            // Удаляем элемент из DOM после завершения анимации
            setTimeout(() => {
                notification.remove();
            }, 1000); // Время анимации
        }, 3000);
    }

    const passwordInput = document.getElementById('password');

    passwordInput.addEventListener('input', validatePasswordRequirements);

    function validatePasswordRequirements() {
        const value = passwordInput.value;

        // Проверки
        const lengthValid = value.length >= 8 && value.length <= 127;
        const uppercaseValid = /[A-ZА-ЯЁ]/.test(value);
        const specialCharValid = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value);
        const digitValid = /\d/.test(value);

        toggleRequirement('req-length', lengthValid);
        toggleRequirement('req-uppercase', uppercaseValid);
        toggleRequirement('req-special', specialCharValid);
        toggleRequirement('req-digit', digitValid);
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
});
