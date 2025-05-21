document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    document.getElementById('verifyEmailForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const code = document.getElementById('verificationCode').value;

        try {
            //const response = await fetch('http://localhost:5000/auth/verify-email', {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Ошибка подтверждения');

            document.getElementById('message').textContent = 'Email успешно подтвержден!';
            document.getElementById('message').style.color = 'green';
            setTimeout(() => navigateTo('index.html'), 2000);
        } catch (error) {
            document.getElementById('message').textContent = error.message;
            document.getElementById('message').style.color = 'red';
        }
    });

    document.getElementById('resendCode').addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            //const response = await fetch('http://localhost:5000/auth/resend-verification', {
            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Ошибка отправки кода');

            document.getElementById('message').textContent = 'Новый код отправлен на вашу почту';
            document.getElementById('message').style.color = 'green';
        } catch (error) {
            document.getElementById('message').textContent = error.message;
            document.getElementById('message').style.color = 'red';
        }
    });
});