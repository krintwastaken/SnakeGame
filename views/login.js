document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value; 
    
    if (!password || !email) {
        document.getElementById('error-message').textContent = 'Пожалуйста, заполните все поля.';
        return;
    }

    fetch('https://snakegame-6n0q.onrender.com/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: password, email: email })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || 'Неверный email или пароль.');
            });
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('token', data.token);
        // Анимация исчезновения
        document.querySelector('.container').classList.remove('show');
        document.querySelector('.container').classList.add('hide');
        // Переход с задержкой
        setTimeout(() => navigateTo('menu.html'), 500);
    })
    .catch(error => {
        console.error('Ошибка:', error);
        document.getElementById('error-message').textContent = error.message;
    });
});