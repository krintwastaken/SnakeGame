
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    container.classList.add('show');
    const notificationContainer = document.querySelector('.notification-container');

    document.getElementById('registrationForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Очищаем предыдущие ошибки
        clearErrors();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Валидация на клиенте
        let isValid = true;

        if (username.length < 3) {
            showError('username', 'Имя пользователя должно быть не менее 3 символов');
            isValid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', 'Введите корректный email');
            isValid = false;
        }

        if (!isValid) return;


        try {
            const response = await fetch('http://localhost:5000/auth/registration', {
            //const response = await fetch('https://snakegame-6n0q.onrender.com/auth/registration', {
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
                            showError('username', error.msg);
                            showNotification(error.msg, 'error');
                        } else if (error.path === 'email') {
                            showError('email', error.msg);
                            showNotification(error.msg, 'error');
                        } else if (error.path === 'password') {
                            showError('password', error.msg);
                            showNotification(error.msg, 'error');
                        } else if (error.path === 'confirmPassword') {
                            showError('confirmPassword', error.msg);
                            showNotification(error.msg, 'error');
                        } else {
                            showGlobalError(error.msg);
                            showNotification(error.msg, 'error');
                        }
                    });
                } else {
                    // Отображаем общую ошибку, если нет детальной информации
                    showGlobalError(errorData.message || 'Ошибка регистрации');
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
            showGlobalError(error.message); // Используем showGlobalError для отображения ошибок
            showNotification(error.message, 'error');
            console.error('Ошибка регистрации:', error);
        }
    });

    // Вспомогательные функции
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group') || (field.parentElement ? field.parentElement : null);

        // Проверяем, что formGroup существует, прежде чем продолжить
        if (!formGroup) {
            console.warn(`Form group not found for field: ${fieldId}`);
            return;
        }

        // Создаем или находим контейнер для ошибки
        let errorContainer = formGroup.querySelector('.error-container');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'error-container';
            formGroup.appendChild(errorContainer);
        }

        // Создаем элемент с сообщением об ошибке
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        // Очищаем предыдущие ошибки и добавляем новую
        errorContainer.innerHTML = '';
        errorContainer.appendChild(errorElement);

        // Добавляем класс ошибки к полю ввода
        field.classList.add('error');
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group') || (field.parentElement ? field.parentElement : null);
        if (!formGroup) return; // Добавлена проверка на null
        const errorContainer = formGroup.querySelector('.error-container');

        if (errorContainer) {
            errorContainer.innerHTML = '';
        }

        field.classList.remove('error');
    }

    function clearErrors() {
        document.querySelectorAll('.error-container').forEach(el => el.innerHTML = '');
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        const globalError = document.getElementById('global-error');
        if (globalError) globalError.textContent = '';
    }

    function showGlobalError(message) {
        let errorElement = document.getElementById('global-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'global-error';
            errorElement.className = 'global-error-message';
            document.querySelector('form').appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

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
