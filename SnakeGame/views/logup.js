document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;  // Получаем email
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value; // Получаем подтверждение пароля

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        document.getElementById('error-message').textContent = 'Пароли не совпадают.';
        return; // Прерываем выполнение, если пароли не совпадают
    }

    fetch('http://localhost:5000/auth/registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, email: email, password: password }) // Отправляем email на сервер
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || 'Произошла ошибка при регистрации.');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Регистрация прошла успешно!');
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('Ошибка:', error);
        document.getElementById('error-message').textContent = error.message || 'Произошла ошибка при отправке запроса.';
    });
});
