const font = new FontFace('Poetsen One', 'url(./Fonts/PoetsenOne-Regular.ttf)');

   font.load().then(function(loaded_font) {
       document.fonts.add(loaded_font);
       console.log('Font loaded');

       document.fonts.ready.then(() => {
           game();
       });

   }).catch(function(error) {
       console.error('Font loading error:', error);
   });

// Графика
const head_up_img = new Image();
head_up_img.src = 'Graphics/head_up.png';
const head_down_img = new Image();
head_down_img.src = 'Graphics/head_down.png';
const head_right_img = new Image();
head_right_img.src = 'Graphics/head_right.png';
const head_left_img = new Image();
head_left_img.src = 'Graphics/head_left.png';

const tail_up_img = new Image();
tail_up_img.src = 'Graphics/tail_up.png';
const tail_down_img = new Image();
tail_down_img.src = 'Graphics/tail_down.png';
const tail_right_img = new Image();
tail_right_img.src = 'Graphics/tail_right.png';
const tail_left_img = new Image();
tail_left_img.src = 'Graphics/tail_left.png';

const body_vertical_img = new Image();
body_vertical_img.src = 'Graphics/body_vertical.png';
const body_horizontal_img = new Image();
body_horizontal_img.src = 'Graphics/body_horizontal.png';

const body_tr_img = new Image();
body_tr_img.src = 'Graphics/body_tr.png';
const body_tl_img = new Image();
body_tl_img.src = 'Graphics/body_tl.png';
const body_br_img = new Image();
body_br_img.src = 'Graphics/body_br.png';
const body_bl_img = new Image();
body_bl_img.src = 'Graphics/body_bl.png';

const apple_img = new Image();
apple_img.src = 'Graphics/apple.png';

const banana_img = new Image();
banana_img.src = 'Graphics/banana.png';
banana_img.onerror = function() {
    console.error('Ошибка загрузки изображения банана');
    this.src = 'Graphics/apple.png';
};

const lemon_img = new Image();
lemon_img.src = 'Graphics/lemon.png';
lemon_img.onerror = function() {
    console.error('Ошибка загрузки изображения лимона');
    this.src = 'Graphics/apple.png';
};

const watermelon_img = new Image();
watermelon_img.src = 'Graphics/watermelon.png';
watermelon_img.onerror = function() {
    console.error('Ошибка загрузки изображения арбуза');
    this.src = 'Graphics/apple.png';
};

const pineapple_img = new Image();
pineapple_img.src = 'Graphics/pineapple.png';
pineapple_img.onerror = function() {
    console.error('Ошибка загрузки изображения ананаса');
    this.src = 'Graphics/apple.png';
};

// Звуки
const crunch_sound = new Audio('Sounds/music_food.mp3');
const turn_sound = new Audio('Sounds/music_move.mp3');
const gameover_sound = new Audio('Sounds/music_gameover.mp3');

// Функция для установки громкости
function setVolume(volume) {
    crunch_sound.volume = volume;
    turn_sound.volume = volume;
    gameover_sound.volume = volume;
}

const cell_size = 40;
const cell_number = 15;

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}

class SNAKE {
    constructor() {
        this.body = [new Vector2(5, 8), new Vector2(4, 8), new Vector2(3, 8)];
        this.direction = new Vector2(0, 0);
        
        this.head = null;
        this.tail = null;

        this.hasMoved = false;
        this.new_block = false;
    }

    draw_snake() {
        this.update_head_graphics();
        this.update_tail_graphics();

        for (let i = 0; i < this.body.length; i++) {
            const block = this.body[i];
            const x_pos = Math.trunc(block.x * cell_size);
            const y_pos = Math.trunc(block.y * cell_size);

            if (i === 0) {
                ctx.drawImage(this.head, x_pos, y_pos, cell_size, cell_size);
            } else if (i === this.body.length - 1) {
                ctx.drawImage(this.tail, x_pos, y_pos, cell_size, cell_size);
            } else {
                const previous_block = this.body[i + 1].subtract(block);
                const next_block = this.body[i - 1].subtract(block);

                if (previous_block.x === next_block.x) {
                    ctx.drawImage(body_vertical_img, x_pos, y_pos, cell_size, cell_size);
                } else if (previous_block.y === next_block.y) {
                    ctx.drawImage(body_horizontal_img, x_pos, y_pos, cell_size, cell_size);
                } else {
                    if ((previous_block.x === -1 && next_block.y === -1) || (previous_block.y === -1 && next_block.x === -1)) {
                        ctx.drawImage(body_tl_img, x_pos, y_pos, cell_size, cell_size);
                    } else if ((previous_block.x === 1 && next_block.y === -1) || (previous_block.y === -1 && next_block.x === 1)) {
                        ctx.drawImage(body_tr_img, x_pos, y_pos, cell_size, cell_size);
                    } else if ((previous_block.x === -1 && next_block.y === 1) || (previous_block.y === 1 && next_block.x === -1)) {
                        ctx.drawImage(body_bl_img, x_pos, y_pos, cell_size, cell_size);
                    } else if ((previous_block.x === 1 && next_block.y === 1) || (previous_block.y === 1 && next_block.x === 1)) {
                        ctx.drawImage(body_br_img, x_pos, y_pos, cell_size, cell_size);
                    }
                }
            }
        }
    }

    update_head_graphics() {
        const head_relation = this.body[1].subtract(this.body[0]);
        if (head_relation.x === 1 && head_relation.y === 0) this.head = head_left_img;
        else if (head_relation.x === -1 && head_relation.y === 0) this.head = head_right_img;
        else if (head_relation.x === 0 && head_relation.y === 1) this.head = head_up_img;
        else if (head_relation.x === 0 && head_relation.y === -1) this.head = head_down_img;
    }

    update_tail_graphics() {
        const tail_relation = this.body[this.body.length - 2].subtract(this.body[this.body.length - 1]);
        if (tail_relation.x === 1 && tail_relation.y === 0) this.tail = tail_left_img;
        else if (tail_relation.x === -1 && tail_relation.y === 0) this.tail = tail_right_img;
        else if (tail_relation.x === 0 && tail_relation.y === 1) this.tail = tail_up_img;
        else if (tail_relation.x === 0 && tail_relation.y === -1) this.tail = tail_down_img;
    }

    move_snake() {
        if (this.direction.x === 0 && this.direction.y === 0) {
            return;
        }

        this.hasMoved = true;

        let body_copy;
        if (this.new_block) {
            body_copy = [...this.body];
            body_copy.unshift(body_copy[0].add(this.direction));
            this.body = [...body_copy];
            this.new_block = false;
        } else {
            body_copy = this.body.slice(0, -1);
            body_copy.unshift(body_copy[0].add(this.direction));
            this.body = [...body_copy];
        }
    }

    add_block() {
        this.new_block = true;
    }

    reset() {
        this.body = [new Vector2(5, 8), new Vector2(4, 8), new Vector2(3, 8)];
        this.direction = new Vector2(0, 0);
        this.hasMoved = false;
    }

    play_crunch_sound() {
        crunch_sound.play();
    }

    play_turn_sound() {
        turn_sound.play();
    }

    play_gameover_sound() {
        gameover_sound.play();
    }
}

class FRUIT {
    constructor() {
        this.currentFruit = 'apple'; // По умолчанию яблоко
        this.randomize([]);
    }

    draw_fruit() {
        const x_pos = Math.trunc(this.pos.x * cell_size);
        const y_pos = Math.trunc(this.pos.y * cell_size);
        let fruitImage;
        
        switch(this.currentFruit) {
            case 'banana':
                fruitImage = banana_img.complete && banana_img.naturalWidth !== 0 ? banana_img : apple_img;
                break;
            case 'lemon':
                fruitImage = lemon_img.complete && lemon_img.naturalWidth !== 0 ? lemon_img : apple_img;
                break;
            case 'watermelon':
                fruitImage = watermelon_img.complete && watermelon_img.naturalWidth !== 0 ? watermelon_img : apple_img;
                break;
            case 'pineapple':
                fruitImage = pineapple_img.complete && pineapple_img.naturalWidth !== 0 ? pineapple_img : apple_img;
                break;
            default:
                fruitImage = apple_img;
        }
        
        ctx.drawImage(fruitImage, x_pos, y_pos, cell_size, cell_size);
    }

    setFruitType(type) {
        this.currentFruit = type;
    }

    randomize(snakeBody) {
        const availablePositions = [];
        for (let x = 0; x < cell_number; x++) {
            for (let y = 0; y < cell_number; y++) {
                const position = new Vector2(x, y);
                let isOnSnake = false;
                if (snakeBody) {
                  for (const block of snakeBody) {
                      if (block.equals(position)) {
                          isOnSnake = true;
                          break;
                      }
                  }
                }

                if (!isOnSnake) {
                    availablePositions.push(position);
                }
            }
        }

        if (availablePositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            this.pos = availablePositions[randomIndex];
            this.x = this.pos.x;
            this.y = this.pos.y;
        }
    }
}

class MAIN {
    constructor() {
        this.snake = new SNAKE();
        this.fruit = new FRUIT();
        this.currentScore = 0;
        this.totalScore = 0;
        
        // Устанавливаем выбранный фрукт
        const selectedFruit = localStorage.getItem('selectedFruit') || 'apple';
        this.fruit.setFruitType(selectedFruit);
    }

    resetGame() {
        this.snake.reset();
        this.fruit.randomize(this.snake.body);
        this.currentScore = 0;
        this.getTotalScore();
        
        // Устанавливаем выбранный фрукт при сбросе игры
        const selectedFruit = localStorage.getItem('selectedFruit') || 'apple';
        this.fruit.setFruitType(selectedFruit);
    }

    async getTotalScore() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/score', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Failed to get total score:', response.status, response.statusText);
            } else {
                const data = await response.json();
                this.totalScore = data.score;
                this.draw_score();
            }
        } catch (error) {
            console.error('Error getting total score:', error);
        }
    }

    update() {
        this.snake.move_snake();
        this.check_collision();
        this.check_fail();
    }

    draw_elements() {
        this.draw_grass();
        this.fruit.draw_fruit();
        this.snake.draw_snake();
        this.draw_score();
    }

    check_collision() {
        if (this.fruit.pos.equals(this.snake.body[0])) {
            this.snake.add_block();
            this.snake.play_crunch_sound();
            this.fruit.randomize(this.snake.body);
            this.currentScore++;
            this.draw_score();
        }
    }

    check_fail() {
        if (!(this.snake.body[0].x >= 0 && this.snake.body[0].x < cell_number &&
              this.snake.body[0].y >= 0 && this.snake.body[0].y < cell_number)) {
            this.snake.play_gameover_sound();
            this.game_over();
            return;
        }

        if (this.snake.hasMoved) {
            for (const block of this.snake.body.slice(1)) {
                if (block.equals(this.snake.body[0])) {
                    this.snake.play_gameover_sound();
                    this.game_over();
                    return;
                }
            }
        }
    }

    game_over() {
        const score = this.snake.body.length - 3;
        this.snake.reset();
        this.fruit.randomize(this.snake.body);

        this.sendScoreToServer(score);
        this.currentScore = 0;
    }

    async sendScoreToServer(score) {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found.  User might not be logged in.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/update-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ score: score })
            });

            if (!response.ok) {
                console.error('Failed to update score:', response.status, response.statusText);
            } else {
                const data = await response.json();
                console.log('Score updated successfully:', data);
                this.totalScore = data.newScore;
                this.draw_score();
            }
        } catch (error) {
            console.error('Error sending score:', error);
        }
    }

    draw_grass() {
        const grass_color = 'rgb(167, 208, 61)';
        const bg_color = 'rgb(155, 195, 50)';

        for (let row = 0; row < cell_number; row++) {
            for (let col = 0; col < cell_number; col++) {
                if ((row % 2 === 0 && col % 2 === 0) || (row % 2 !== 0 && col % 2 !== 0)) {
                    ctx.fillStyle = grass_color;
                    ctx.fillRect(col * cell_size, row * cell_size, cell_size, cell_size);
                }
            }
        }

        ctx.fillStyle = bg_color;
        ctx.fillRect(0, cell_size * cell_number, cell_size * cell_number, cell_size * 2);
    }

    draw_score() {
        const score_text = String(this.currentScore);
        const total_score_text = String(this.totalScore);
    
        // Общие параметры
        const apple_size = 30;
        const padding = 15;
        const block_height = 35;
        const right_margin = 40;
        const text_color = '#000000';
        const score_area_height = cell_size * 2;
    
        // --- Текущий счет ---
        const score_width = ctx.measureText(score_text).width;
        const total_width = score_width + apple_size + padding * 3;
        const block_x = cell_size * cell_number - total_width - right_margin;
        const block_y = cell_size * cell_number + (score_area_height - block_height) / 2;
    
        ctx.beginPath();
        ctx.roundRect(block_x, block_y, total_width, block_height, 8);
        ctx.fillStyle = 'rgb(167, 220, 61)';
        ctx.fill();
    
        // Получаем текущий фрукт
        const selectedFruit = localStorage.getItem('selectedFruit') || 'apple';
        let fruitImage;
        switch(selectedFruit) {
            case 'banana':
                fruitImage = banana_img;
                break;
            case 'lemon':
                fruitImage = lemon_img;
                break;
            case 'watermelon':
                fruitImage = watermelon_img;
                break;
            case 'pineapple':
                fruitImage = pineapple_img;
                break;
            default:
                fruitImage = apple_img;
        }
    
        ctx.drawImage(fruitImage, block_x + padding, block_y + (block_height - apple_size) / 2, apple_size, apple_size);
        ctx.fillStyle = text_color;
    
        ctx.font = '25px "Poetsen One"';
        ctx.textAlign = 'left';
        ctx.fillText(score_text, block_x + padding + apple_size + padding / 2, block_y + block_height - 8);
    
        ctx.font = '16px "Poetsen One"';
        const current_score_label = "Current";
        const current_score_label_width = ctx.measureText(current_score_label).width;
        const current_score_label_x = block_x + (total_width - current_score_label_width) / 2;
        const current_score_label_y = cell_size * cell_number + (score_area_height / 4) - 2.5;
        ctx.fillStyle = text_color;
        ctx.fillText(current_score_label, current_score_label_x, current_score_label_y);
    
        // --- Общий счет ---
        const total_score_width = ctx.measureText(total_score_text).width;
        const total_total_width = total_score_width + apple_size + padding * 3;
        const total_block_x = right_margin;
        const total_block_y = cell_size * cell_number + (score_area_height - block_height) / 2;
    
        ctx.beginPath();
        ctx.roundRect(total_block_x, total_block_y, total_total_width + 10, block_height, 8);
        ctx.fillStyle = 'rgb(167, 220, 61)';
        ctx.fill();
    
        ctx.drawImage(fruitImage, total_block_x + padding, total_block_y + (block_height - apple_size) / 2, apple_size, apple_size);
        ctx.fillStyle = text_color;
    
        ctx.font = '25px "Poetsen One"';
        ctx.textAlign = 'left';
        ctx.fillText(total_score_text, total_block_x + padding + apple_size + padding / 2, total_block_y + block_height - 8);
    
        ctx.font = '16px "Poetsen One"';
        const total_score_label = "Total";
        const total_score_label_width = ctx.measureText(total_score_label).width;
        const total_score_label_x = total_block_x + (total_total_width - total_score_label_width) / 2;
        const total_score_label_y = cell_size * cell_number + (score_area_height / 4) - 2.5;
        ctx.fillStyle = text_color;
        ctx.fillText(total_score_label, total_score_label_x, total_score_label_y);
    }
}


let main_game = new MAIN();
let gameInterval;

function game() {
    main_game = new MAIN();
    main_game.resetGame();

    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        main_game.update();
        draw();
    }, 200);
}

function draw() {
    ctx.fillStyle = 'rgb(175, 215, 70)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    main_game.draw_elements();
}

// Управление
let current_head_position = main_game.snake.body[0];
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        if (main_game.snake.direction.y !== 1 && main_game.snake.direction.y !== -1 && main_game.snake.body[0] !== current_head_position) {
            current_head_position = main_game.snake.body[0];
            main_game.snake.direction = new Vector2(0, -1);
            main_game.snake.play_turn_sound();
        }
    } else if (event.key === 'ArrowDown') {
        if (main_game.snake.direction.y !== 1 && main_game.snake.direction.y !== -1 && main_game.snake.body[0] !== current_head_position) {
            current_head_position = main_game.snake.body[0];
            main_game.snake.direction = new Vector2(0, 1)
            main_game.snake.play_turn_sound();
        }
    } else if (event.key === 'ArrowRight') {
        if (main_game.snake.direction.x !== 1 && main_game.snake.direction.x !== -1 && main_game.snake.body[0] !== current_head_position) {
            current_head_position = main_game.snake.body[0];
            main_game.snake.direction = new Vector2(1, 0);
            main_game.snake.play_turn_sound();
        }
    } else if (event.key === 'ArrowLeft') {
        if (main_game.snake.direction.x !== 1 && main_game.snake.direction.x !== -1 && main_game.snake.body[0] !== current_head_position && main_game.snake.hasMoved !== false) {
            current_head_position = main_game.snake.body[0];
            main_game.snake.direction = new Vector2(-1, 0);
            main_game.snake.play_turn_sound();
        }
    }
});