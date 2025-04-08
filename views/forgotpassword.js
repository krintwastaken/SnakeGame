document.getElementById('resetPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        document.getElementById('error-message').textContent = 'Новый пароль и его подтверждение не совпадают.';
        return;
    }

    fetch('http://localhost:5000/auth/reset_password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: newPassword })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || 'Ошибка при сбросе пароля.');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Пароль успешно сброшен!');
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('Ошибка:', error);
        document.getElementById('error-message').textContent = error.message || 'Произошла ошибка при отправке запроса.';
    });
});