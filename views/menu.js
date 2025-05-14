function navigateTo(url) {
    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);
    setTimeout(() => window.location.href = url, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('menu').classList.add('show');
    }, 100);
});

function startGame() {
    const playButton = document.getElementById('play-button');
    const errorElement = document.getElementById('error-message');
    
    errorElement.style.display = 'none';
    errorElement.textContent = '';
    
    playButton.textContent = 'Загрузка...';
    playButton.disabled = true;
    
    fetch('snake/game.html')
        .then(response => {
            if (!response.ok) throw new Error('Файл игры не найден');
            
            document.getElementById('menu').classList.remove('show');
            document.getElementById('menu').classList.add('hide');
            setTimeout(() => navigateTo("snake/game.html"), 500);
        })
        .catch(error => {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
            playButton.textContent = 'Играть';
            playButton.disabled = false;
        });
}

function showInstructions() {
    const modal = document.getElementById('instructions-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);

    const elements = modal.querySelectorAll('.instruction-item, .rules-list li');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-30px)';
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
            el.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 200 + index * 80);
    });
}

function showShop() {
    const modal = document.getElementById('shop-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    const fruits = document.querySelectorAll('.fruit-option');
    fruits.forEach((fruit, index) => {
        fruit.style.transitionDelay = `${index * 0.1}s`;
    });
}

async function showLeaders() {
    const modal = document.getElementById('leaders-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    await fetchLeaderboard();
    
    const rows = document.querySelectorAll('#leaderboard-table tr');
    rows.forEach((row, index) => {
        row.style.transitionDelay = `${index * 0.1 + 0.2}s`;
    });
}

async function fetchLeaderboard() {
    const token = localStorage.getItem('token');
    const tableBody = document.querySelector('#leaderboard-table tbody');
    const errorElement = document.getElementById('leaderboard-error');

    tableBody.innerHTML = '';
    errorElement.style.display = 'none';
    errorElement.textContent = '';

    try {
        const response = await fetch('https://snakegame-6n0q.onrender.com/auth/leaderboard', {
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
        
        const sortedData = data.sort((a, b) => b.score - a.score);
        
        sortedData.forEach((user, index) => {
            const row = document.createElement('tr');
            const place = index + 1;

            const rankCell = document.createElement('td');
            rankCell.style.textAlign = 'center';
            
            if (place === 1) {
                rankCell.innerHTML = '<img src="img/first.svg" alt="1st" width="30">';
            } else if (place === 2) {
                rankCell.innerHTML = '<img src="img/second.svg" alt="2nd" width="30">';
            } else if (place === 3) {
                rankCell.innerHTML = '<img src="img/third.svg" alt="3rd" width="30">';
            } else {
                rankCell.textContent = place;
            }

            const nameCell = document.createElement('td');
            nameCell.textContent = user.username;

            const scoreCell = document.createElement('td');
            scoreCell.textContent = user.score;

            row.appendChild(rankCell);
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
        const menu = document.getElementById('menu');
        menu.classList.remove('show');
        menu.classList.add('hide');
        
        const transition = document.createElement('div');
        transition.className = 'page-transition-exit';
        document.body.appendChild(transition);
        
        setTimeout(() => {
            navigateTo("index.html");
            document.body.removeChild(transition);
        }, 900);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.querySelectorAll('*').forEach(el => {
            el.style.transitionDelay = '';
            el.style.opacity = '';
            el.style.transform = '';
        });
    }, 500);
}

window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

async function selectFruit(fruitType) {
    const fruitImages = {
        'apple': 'snake/Graphics/apple.png',
        'banana': 'snake/Graphics/banana.png',
        'lemon': 'snake/Graphics/lemon.png',
        'watermelon': 'snake/Graphics/watermelon.png',
        'pineapple': 'snake/Graphics/pineapple.png'
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
    
    img.onload = async function() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Вы не авторизованы');
                return;
            }

            const response = await fetch('https://snakegame-6n0q.onrender.com/auth/update-fruit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fruitType })
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении фрукта');
            }

            alert(`Выбран фрукт: ${fruitNames[fruitType]}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Произошла ошибка при сохранении выбранного фрукта');
        }
    };
}