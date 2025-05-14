document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);
});

document.getElementById('resetPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        document.getElementById('error-message').textContent = 'Пароли не совпадают.';
        return;
    }

    fetch('https://snakegame-6n0q.onrender.com/auth/reset_password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: newPassword })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || 'Ошибка сброса пароля.');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Пароль сброшен!');
        document.querySelector('.container').classList.remove('show');
        document.querySelector('.container').classList.add('hide');
        setTimeout(() => navigateTo('login.html'), 500);
    })
    .catch(error => {
        document.getElementById('error-message').textContent = error.message;
    });
});