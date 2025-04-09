window.onload = function() {
    setTimeout(function() {
        document.getElementById('menu').classList.add('show');
    }, 100);
};

function startGame() {
    const playButton = document.getElementById('play-button');
    const errorElement = document.getElementById('error-message');
    
    errorElement.style.display = 'none';
    errorElement.textContent = '';
    
    playButton.textContent = 'Загрузка...';
    playButton.disabled = true;
    
    fetch('../snake/game.html')
        .then(response => {
            if (!response.ok) throw new Error('Файл игры не найден');
            
            document.getElementById('menu').classList.remove('show');
            setTimeout(() => {
                window.location.href = "../snake/game.html";
            }, 500);
        })
        .catch(error => {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
            playButton.textContent = 'Играть';
            playButton.disabled = false;
        });
}

function showInstructions() {
    document.getElementById('instructions-modal').style.display = 'flex';
}

function showShop() {
    document.getElementById('shop-modal').style.display = 'flex';
}

function showLeaders() {
    document.getElementById('leaders-modal').style.display = 'flex';
    fetchLeaderboard();
}

async function fetchLeaderboard() {
    const token = localStorage.getItem('token');
    const tableBody = document.querySelector('#leaderboard-table tbody');
    const errorElement = document.getElementById('leaderboard-error');

    tableBody.innerHTML = '';
    errorElement.style.display = 'none';
    errorElement.textContent = '';

    try {
        const response = await fetch('http://localhost:5000/auth/leaderboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0) {
            errorElement.textContent = 'Таблица лидеров пуста.';
            errorElement.style.display = 'block';
            return;
        }

        const medalImages = {
            0: 'img/first.png',
            1: 'img/second.png',
            2: 'img/third.png'
        };

        data.forEach((user, index) => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.style.verticalAlign = 'middle';
            nameCell.style.padding = '8px';

            let medalImage = '';
            if (medalImages[index]) {
                medalImage = `<img src="${medalImages[index]}" alt="${getMedalAltText(index)}" width="20" style="vertical-align: middle;">`;
            }

            nameCell.innerHTML = `${medalImage} ${user.username}`;

            const scoreCell = document.createElement('td');
            scoreCell.textContent = user.score;

            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Ошибка при загрузке таблицы лидеров:', error);
        errorElement.textContent = 'Не удалось загрузить таблицу лидеров.';
        errorElement.style.display = 'block';
    }
}

function getMedalAltText(index) {
    switch (index) {
        case 0: return "Gold Medal";
        case 1: return "Silver Medal";
        case 2: return "Bronze Medal";
        default: return "";
    }
}

function exitGame() {
    if (confirm('Вы действительно хотите выйти в меню авторизации?')) {
        window.location.href = "../views/login.html";
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

function selectFruit(fruitType) {
    const fruitImages = {
        'apple': '../snake/Graphics/apple.png',
        'banana': '../snake/Graphics/banana.png',
        'lemon': '../snake/Graphics/lemon.png',
        'watermelon': '../snake/Graphics/watermelon.png',
        'pineapple': '../snake/Graphics/pineapple.png'
    };

    const fruitNames = {
        'apple': 'Яблоко',
        'banana': 'Банан',
        'lemon': 'Лимон',
        'watermelon': 'Арбуз',
        'pineapple': 'Ананас'
    };

    const img = new Image();
    img.src = fruitImages[fruitType];
    
    img.onerror = function() {
        alert(`Ошибка загрузки изображения ${fruitNames[fruitType]}. Пожалуйста, выберите другой фрукт.`);
        return;
    };
    
    img.onload = function() {
        localStorage.setItem('selectedFruit', fruitType);
        alert(`Выбран фрукт: ${fruitNames[fruitType]}`);
    };
}