document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.game-container').classList.add('show');
    }, 100);

    const authButton = document.getElementById('authButton');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');

    if (!authButton || !volumeSlider || !volumeIcon) {
        console.error('Один из элементов управления не найден!');
        return;
    }

    authButton.addEventListener('click', (e) => {
        e.preventDefault();
        exitGame();
    });

    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        if (window.setVolume) {
            setVolume(volume);
            updateVolumeIcon(volume);
        } else {
            console.error('Функция setVolume не определена!');
        }
    });

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

    updateVolumeIcon(volumeSlider.value / 100);
});

function exitGame() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) {
        console.error('Контейнер игры не найден!');
        return;
    }

    gameContainer.classList.remove('show');
    gameContainer.classList.add('hide');

    document.querySelectorAll('.top-left-corner button, .slider-container')
        .forEach(el => el.style.opacity = '0');

    const transition = document.createElement('div');
    transition.className = 'page-transition-exit';
    document.body.appendChild(transition);

    setTimeout(() => {
        if (window.navigateTo) {
            navigateTo("../views/index.html");
        } else {
            window.location.href = "../views/index.html";
        }
        document.body.removeChild(transition);
    }, 1000);
}
