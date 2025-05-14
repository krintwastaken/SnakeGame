document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);
});

document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        document.getElementById('error-message').textContent = 'Пароли не совпадают.';
        return;
    }

    fetch('http://localhost:5000/auth/registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, email: email, password: password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || 'Ошибка регистрации.');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Регистрация успешна!');
        // Анимация перехода
        document.querySelector('.container').classList.remove('show');
        document.querySelector('.container').classList.add('hide');
        setTimeout(() => navigateTo('login.html'), 500);
    })
    .catch(error => {
        document.getElementById('error-message').textContent = error.message;
    });
});