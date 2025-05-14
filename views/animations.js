function navigateTo(url) {
    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);
    
    setTimeout(() => {
        document.body.removeChild(transition);
        window.location.href = url;
        
        // Автоматическая активация анимации для game.html
        if(url.includes('game.html')) {
            setTimeout(() => {
                document.querySelector('.game-container').classList.add('show');
            }, 100);
        }
    }, 1000);

    if(url.includes('game.html')) {
        document.querySelector('.game-container').classList.add('show');
    }
    
    // Добавьте обработку выхода
    if(url.includes('menu.html')) {
        document.querySelector('.menu-container').classList.add('show');
    }
}