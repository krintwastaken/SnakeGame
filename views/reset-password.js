document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const container = document.querySelector('.container');
    container.classList.add('show');

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showGlobalError('Неверная ссылка для сброса пароля');
        return;
    }

    document.getElementById('token').value = token;

    document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword.length < 5 || newPassword.length > 12) {
            showError('newPassword', 'Пароль должен быть от 5 до 12 символов');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('confirmPassword', 'Пароли не совпадают');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/reset-password-with-token', {
            //const response = await fetch('https://snakegame-6n0q.onrender.com/auth/reset-password-with-token', {
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

            showSuccessMessage('Пароль успешно изменен! Перенаправление...');
            setTimeout(() => window.location.href = 'index.html', 2000);
        } catch (error) {
            showGlobalError(error.message);
            console.error('Error:', error);
        }
    });

    function showSuccessMessage(message) {
        const messageEl = document.getElementById('reset-message');
        messageEl.textContent = message;
        messageEl.style.color = 'green';
    }

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
