document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);

    const notificationContainer = document.querySelector('.notification-container');

    document.getElementById('requestResetForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            showNotification('Введите email', 'error');
            return;
        }

        try {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/request-password-reset', {
            //const response = await fetch('http://localhost:5000/auth/request-password-reset', {
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
            showNotification('Ссылка отправлена на ваш email', 'success');
        } catch (error) {
            showNotification(error.message || 'Ошибка при отправке запроса', 'error');
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
            }, 1000);
        }, 3000);
    }
});