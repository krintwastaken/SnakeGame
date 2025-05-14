// game_ui.js

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация анимации контейнера
    setTimeout(() => {
        document.querySelector('.game-container').classList.add('show');
    }, 100);

    // Получаем элементы управления
    const authButton = document.getElementById('authButton');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');

    // Проверка существования элементов
    if (!authButton || !volumeSlider || !volumeIcon) {
        console.error('Один из элементов управления не найден!');
        return;
    }

    // Обработчик кнопки "Назад"
    authButton.addEventListener('click', (e) => {
        e.preventDefault();
        exitGame();
    });

    // Обработчик громкости
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        if (window.setVolume) {
            setVolume(volume);
            updateVolumeIcon(volume);
        } else {
            console.error('Функция setVolume не определена!');
        }
    });

    // Функция обновления иконки громкости
    function updateVolumeIcon(volume) {
        const icons = {
            0: 'volume_off',
            0.33: 'volume_mute',
            0.66: 'volume_down',
            1: 'volume_up'
        };
        const icon = Object.keys(icons).find(key => volume <= parseFloat(key)) || 'volume_up';
        volumeIcon.textContent = icons[icon];
    }

    // Инициализация громкости
    updateVolumeIcon(volumeSlider.value / 100);
});

// Функция выхода из игры
function exitGame() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) {
        console.error('Контейнер игры не найден!');
        return;
    }

    // Анимация закрытия
    gameContainer.classList.remove('show');
    gameContainer.classList.add('hide');

    // Анимация элементов управления
    document.querySelectorAll('.top-left-corner button, .slider-container')
        .forEach(el => el.style.opacity = '0');

    // Создаем анимацию перехода
    const transition = document.createElement('div');
    transition.className = 'page-transition-exit';
    document.body.appendChild(transition);

    // Задержка для перехода
    setTimeout(() => {
        if (window.navigateTo) {
            navigateTo("../views/menu.html");
        } else {
            window.location.href = "../views/menu.html";
        }
        document.body.removeChild(transition);
    }, 1000);
}