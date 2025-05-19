
let recaptchaSiteKey = null; // Store the site key
let recaptchaWidgetId = null; // Store the reCAPTCHA widget ID
let failedLoginAttempts = 0; // Track failed login attempts

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired");

    setTimeout(() => {
        console.log("Timeout function called");
        document.querySelector('.container').classList.add('show');
    }, 100);

    const notificationContainer = document.querySelector('.notification-container');
    const recaptchaContainer = document.getElementById('recaptcha-container'); // Get the container

    // Function to fetch the reCAPTCHA site key from the server
    async function fetchRecaptchaSiteKey() {
        console.log("fetchRecaptchaSiteKey() called");
        try {
            //const response = await fetch('https://snakegame-6n0q.onrender.com/auth/recaptcha-site-key');
            const response = await fetch('http://localhost:5000/auth/recaptcha-site-key');
            console.log("Fetch response:", response);
            if (!response.ok) {
                throw new Error('Failed to fetch reCAPTCHA site key');
            }
            const data = await response.json();
            console.log("Fetched data:", data);
            recaptchaSiteKey = data.siteKey; // Store the site key
            console.log("reCAPTCHA site key:", recaptchaSiteKey);
            // Initialize reCAPTCHA with the fetched site key


        } catch (error) {
            console.error('Error fetching reCAPTCHA site key:', error);
            showNotification('Failed to initialize reCAPTCHA', 'error');
        }
    }

    // Function to show the reCAPTCHA
    function showRecaptcha() {
        console.log("showRecaptcha() called");
        recaptchaContainer.style.display = 'block'; // Show the reCAPTCHA container

        if (recaptchaWidgetId === null && recaptchaSiteKey) {
            recaptchaWidgetId = grecaptcha.render('recaptcha-container', { // Render in the new container
                'sitekey': recaptchaSiteKey,
                'callback': function (response) {
                    console.log("reCAPTCHA callback called");
                }
            });
        }
    }

    // Function to hide the reCAPTCHA - not needed in this approach
    function hideRecaptcha() {
        // If you need to hide the reCAPTCHA, you can add logic here
        console.log("hideRecaptcha() called");
        recaptchaContainer.style.display = 'none';
    }

    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        console.log("Login form submitted");
        event.preventDefault();
        clearErrors();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Get the reCAPTCHA response
        let recaptchaResponse = "";
        if (recaptchaContainer.style.display === 'block' && recaptchaWidgetId !== null) {
            recaptchaResponse = grecaptcha.getResponse(recaptchaWidgetId);

            // Check if the reCAPTCHA is not completed
            if (!recaptchaResponse) {
                showNotification("Пожалуйста, пройдите проверку reCAPTCHA.", 'error');
                return; // Stop the login attempt
            }
        }
        console.log("reCAPTCHA response:", recaptchaResponse);

        try {
            //const response = await fetch('https://snakegame-6n0q.onrender.com/auth/login', {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password,
                    username,
                    recaptchaResponse // Send the reCAPTCHA response
                })
            });
            console.log("Login response:", response);

            if (response.status === 403) {
                localStorage.setItem('pendingUsername', username);
                localStorage.setItem('pendingPassword', password);
                window.location.href = 'two-factor-verify.html';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Error data:", errorData);
                if (errorData.requiresVerification) {
                    window.location.href = `verify-email.html?email=${encodeURIComponent(errorData.email)}`;
                    return;
                } else {
                    showNotification(errorData.message || 'Неверное имя пользователя или пароль', 'error');
                    // Show reCAPTCHA after a failed login
                    failedLoginAttempts++;
                    if (failedLoginAttempts >= 5) {
                        showRecaptcha();
                    }
                    return;
                }
            }

            const data = await response.json();
            console.log("Success data:", data);
            localStorage.setItem('token', data.token);
            document.querySelector('.container').classList.remove('show');
            document.querySelector('.container').classList.add('hide');
            showNotification('Вход выполнен успешно!', 'success');
            failedLoginAttempts = 0; // Reset failed attempts on successful login
            setTimeout(() => navigateTo('menu.html'), 500);
        } catch (error) {
            console.error('Ошибка входа:', error);
            showNotification(error.message, 'error');
            // Show reCAPTCHA after a failed login
            failedLoginAttempts++;
            if (failedLoginAttempts >= 5) {
                showRecaptcha();
            }
            console.error('Ошибка входа:', error);
        }
    });

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

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
            }, 300);
        }, 3000);
    }

    // Fetch the reCAPTCHA site key when the page loads
    fetchRecaptchaSiteKey();
});
