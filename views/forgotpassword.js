document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);

    document.getElementById('requestResetForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        clearErrors();
        
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            showError('email', 'Введите email');
            return;
        }

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при запросе сброса пароля');
            }

            const data = await response.json();
            showSuccessMessage(data.message || 'Ссылка отправлена на ваш email');
        } catch (error) {
            showGlobalError(error.message);
            console.error('Ошибка:', error);
        }
    });

    function showSuccessMessage(message) {
        const messageEl = document.getElementById('request-message');
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