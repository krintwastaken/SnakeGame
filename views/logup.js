
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    container.classList.add('show');

    // Добавляем валидацию в реальном времени
    document.getElementById('password').addEventListener('input', validatePassword);
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);

    document.getElementById('registrationForm').addEventListener('submit', async function(event) {
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

        if (password.length < 5 || password.length > 12) {
            showError('password', 'Пароль должен быть от 5 до 12 символов');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirmPassword', 'Пароли не совпадают');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка регистрации');
            }

            const data = await response.json();
            document.querySelector('.container').classList.remove('show');
            document.querySelector('.container').classList.add('hide');
            setTimeout(() => {
                window.location.href = `verify-email.html?email=${encodeURIComponent(data.email)}`;
            }, 500);
        } catch (error) {
            showGlobalError(error.message); // Используем showGlobalError для отображения ошибок
            console.error('Ошибка регистрации:', error);
        }
    });

    // Функции валидации
    function validatePassword() {
        const password = document.getElementById('password').value;
        if (password.length > 0 && (password.length < 5 || password.length > 12)) {
            showError('password', 'Пароль должен быть от 5 до 12 символов');
        } else {
            clearError('password');
        }
    }

    function validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (confirmPassword.length > 0 && password !== confirmPassword) {
            showError('confirmPassword', 'Пароли не совпадают');
        } else if (confirmPassword.length > 0) {
            clearError('confirmPassword');
        }
    }

    // Вспомогательные функции
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group') || field.parentElement;

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
        const formGroup = field.closest('.form-group') || field.parentElement;
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
});
