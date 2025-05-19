document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('show');
    }

    const form = document.getElementById('twoFactorForm');
    const notificationContainer = document.querySelector('.notification-container');

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

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const twoFactorCode = document.getElementById('twoFactorCode').value;
        const username = localStorage.getItem('pendingUsername'); // Получаем имя пользователя из localStorage
        const password = localStorage.getItem('pendingPassword'); // Получаем пароль из localStorage

        try {
            //const response = await fetch('https://snakegame-6n0q.onrender.com/auth/login', {
            const response = await fetch('http://localhost:5000/auth/login', {
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
                const errorData = await response.json();
                showNotification(errorData.message || 'Неверный код 2FA', 'error');
                return;
            }

            const data = await response.json();
            localStorage.removeItem('pendingUsername'); // Очищаем pendingUsername
            localStorage.removeItem('pendingPassword'); // Очищаем пароль
            localStorage.setItem('token', data.token);
            showNotification('Вход выполнен успешно!', 'success');
            setTimeout(() => window.location.href = 'menu.html', 500);

        } catch (error) {
            console.error('Ошибка при подтверждении 2FA:', error);
            showNotification('Ошибка при подтверждении 2FA', 'error');
        }
    });
});