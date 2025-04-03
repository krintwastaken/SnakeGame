document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value; 
    
    if (!password || !email) {
        document.getElementById('error-message').textContent = 'Пожалуйста, заполните все поля.';
        return;
    }

    fetch('http://localhost:5000/auth/login', {
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
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 200);
        localStorage.setItem('token', data.token); 
    })
    .catch(error => {
        console.error('Ошибка:', error);
        document.getElementById('error-message').textContent = error.message || 'Произошла ошибка при отправке запроса.';
    });
});

