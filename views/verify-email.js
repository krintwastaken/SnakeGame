document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.container').classList.add('show');
    }, 100);

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const captchaModal = document.getElementById('captchaModal');
    const captchaConfirmBtn = document.getElementById('captchaConfirmBtn');
    let captchaPassed = false;
    let failedAttempts = 0;
    const MAX_ATTEMPTS = 5;


    function showNotification(message, type = 'info') {
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        if (type === 'success') notification.classList.add('success');
        else if (type === 'error') notification.classList.add('error');
        notificationContainer.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function showCaptchaModal() {
        captchaModal.style.display = 'flex';
        if (!document.getElementById('g-recaptcha')) {
            grecaptcha.render('recaptcha-container', {
                'sitekey': '6Lc3MkQrAAAAALTBKy0p3JadmFHlM_deHepkeJp3',
                'callback': () => { captchaPassed = true; }
            });
        }
    }

    captchaConfirmBtn.addEventListener('click', () => {
        if (captchaPassed) {
            captchaModal.style.display = 'none';
            failedAttempts = 0;
            captchaPassed = false;
            grecaptcha.reset();
        } else {
            showNotification('Пожалуйста, подтвердите капчу', 'error');
        }
    });


    document.getElementById('verifyEmailForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (captchaModal.style.display === 'flex') {
            showNotification('Сначала подтвердите капчу', 'error');
            return;
        }
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
            if (!response.ok) {
                failedAttempts++;
                if (failedAttempts >= MAX_ATTEMPTS) showCaptchaModal();
                throw new Error(data.message || 'Ошибка подтверждения');
            }

            document.getElementById('message').textContent = 'Email успешно подтвержден!';
            document.getElementById('message').style.color = 'green';
            setTimeout(() => navigateTo('index.html'), 2000);
            failedAttempts = 0;
        } catch (error) {
            failedAttempts++;
            if (failedAttempts >= MAX_ATTEMPTS) showCaptchaModal();
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