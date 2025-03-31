document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value; // Получаем значение email

    // Добавляем проверку на пустые поля (по желанию, но рекомендуется)
    if (!username || !password || !email) {
        document.getElementById('error-message').textContent = 'Пожалуйста, заполните все поля.';
        return;
    }

    fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // Отправляем email вместе с username и password
        body: JSON.stringify({ username: username, password: password, email: email })
    })
    .then(response => {
        if (!response.ok) {
            // Обработка ошибок от сервера (включая пользовательские ошибки)
            return response.json().then(error => {
                throw new Error(error.message || 'Неверное имя пользователя, email или пароль.'); // Более конкретное сообщение об ошибке
            });
        }
        return response.json();
    })
    .then(data => {
        setTimeout(() => {
            window.location.href = '../snake/game.html';
        }, 200);
        localStorage.setItem('token', data.token); 
    })
    .catch(error => {
        console.error('Ошибка:', error);
        document.getElementById('error-message').textContent = error.message || 'Произошла ошибка при отправке запроса.';
    });
});

