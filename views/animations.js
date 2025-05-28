document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const container = document.querySelector('.container');
        if (container) {
            container.classList.add('show');
        }
    }, 100);
});

function navigateTo(url) {
    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);
    
    setTimeout(() => {
        document.body.removeChild(transition);
        window.location.href = url;
        
        if(url.includes('game.html')) {
            setTimeout(() => {
                const gameContainer = document.querySelector('.game-container');
                if (gameContainer) {
                    gameContainer.classList.add('show');
                }
            }, 100);
        }
    }, 1000);

    if(url.includes('game.html')) {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.classList.add('show');
        }
    }
    
    if(url.includes('menu.html')) {
        const menuContainer = document.querySelector('.menu-container');
        if (menuContainer) {
            menuContainer.classList.add('show');
        }
    }
}