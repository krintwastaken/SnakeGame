document.getElementById('authButton').addEventListener('click', () => {
    window.location.href = '../views/menu.html';
});

const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');

volumeSlider.addEventListener('input', (event) => {
    const volume = event.target.value / 100;
    setVolume(volume);
    updateVolumeIcon(volume);
});

function updateVolumeIcon(volume) {
    if (volume == 0) {
        volumeIcon.textContent = 'volume_off';
    } else if (volume <= 0.33) {
        volumeIcon.textContent = 'volume_mute';
    } else if (volume <= 0.66) {
        volumeIcon.textContent = 'volume_down';
    } else {
        volumeIcon.textContent = 'volume_up';
    }
}

updateVolumeIcon(volumeSlider.value / 100);

function updateScore(score) {
    document.getElementById('score').textContent = score;
    updateCurrentFruit();
}

function updateCurrentFruit() {
    const fruitImages = {
        'apple': 'Graphics/apple.png',
        'banana': 'Graphics/banana.png',
        'lemon': 'Graphics/lemon.jpg',
        'watermelon': 'Graphics/watermelon.png',
        'pineapple': 'Graphics/pineapple.png'
    };

    const selectedFruit = localStorage.getItem('selectedFruit') || 'apple';
    document.getElementById('currentFruitImg').src = fruitImages[selectedFruit];
}