document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);

    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        clearErrors();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Базовая валидация на клиенте
        let isValid = true;
        
        if (!email) {
            showError('email', 'Введите email');
            isValid = false;
        }
        
        if (!password) {
            showError('password', 'Введите пароль');
            isValid = false;
        }
        
        if (!isValid) return;

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password, email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error('Неверный email или пароль');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            document.querySelector('.container').classList.remove('show');
            document.querySelector('.container').classList.add('hide');
            setTimeout(() => navigateTo('menu.html'), 500);
        } catch (error) {
            showGlobalError(error.message);
            console.error('Ошибка входа:', error);
        }
    });

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        let errorElement = field.nextElementSibling;
        
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = message;
        field.classList.add('error');
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
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