document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);

    const notificationContainer = document.querySelector('.notification-container');

    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        clearErrors();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/auth/login', {
            //const response = await fetch('https://snakegame-6n0q.onrender.com/auth/login', {    
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password,
                    username
                })
            });

            // Обработка блокировки
            if (response.status === 429) {
                window.location.href = 'blocked.html';
                return;
            }

            if (response.status === 403) {
                localStorage.setItem('pendingUsername', username);
                localStorage.setItem('pendingPassword', password);
                window.location.href = 'two-factor-verify.html';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.requiresVerification) {
                    window.location.href = `verify-email.html?email=${encodeURIComponent(errorData.email)}`;
                    return;
                } else {
                    showNotification(errorData.message || 'Неверное имя пользователя или пароль', 'error');
                    return;
                }
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            document.querySelector('.container').classList.remove('show');
            document.querySelector('.container').classList.add('hide');
            showNotification('Вход выполнен успешно!', 'success');
            failedLoginAttempts = 0;
            setTimeout(() => navigateTo('menu.html'), 500);
        } catch (error) {
            console.error('Ошибка входа:', error);
            showNotification(error.message, 'error');
            console.error('Ошибка входа:', error);
        }
    });

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

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
});
