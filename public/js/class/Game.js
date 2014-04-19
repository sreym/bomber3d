Game = function() {
//    randomize();
    this.width = 15;
    this.height = 13;
    this.blockWidth = 1.0;
    this.blockHeight = 0.8;
    this.bombInterval = 8000;
    this.step = 0.1;
    this.world = new Game.World(this.width, this.height);
    this.player = new Game.Player();
    this.world.players.push(this.player);
};

Game.prototype.update = function(data) {
    this.world.update(data.world);
};

Game.World = function(width, height) {
    this.players = [];
    this.walls = [];
    this.objects = [];
    for(var i = 0; i < height; i++) {
        var A = [];
        var B = [];
        for(var j = 0; j < width; j++) {
            if (j == 0 || j == width - 1 || i == 0 || i == height - 1) {
                A.push(1);
                B.push(1);
            } else {
                if (i % 2 == 0 && j % 2 == 0) {
                    A.push(1);
                    B.push(1);
                }
                else {
                    if (Math.random() < 0.3) {
                        A.push(2);
                        B.push(2);
                    }
                    else {
                        A.push(0);
                        B.push(0);
                    }
                }
            }
        }
        this.walls.push(A);
        this.objects.push(B);
    }
    this.walls[1][1] = 0;
    this.walls[1][2] = 0;
    this.walls[2][1] = 0;
    this.walls[1][width - 2] = 0;
    this.walls[1][width - 3] = 0;
    this.walls[2][width - 2] = 0;
    this.walls[height - 2][1] = 0;
    this.walls[height - 3][1] = 0;
    this.walls[height - 2][2] = 0;
    this.walls[height - 2][width - 2] = 0;
    this.walls[height - 3][width - 2] = 0;
    this.walls[height - 2][width - 3] = 0;
    this.bombs = [];
};

Game.World.prototype.update = function(data) {
    for(var i = 0; i < this.walls.length; i++) {
        for(var j = 0; j < this.walls[i].length; j++) {
            this.walls[i][j] = data.walls[i][j];
        }
    }
    
    for(var i = 0; i < this.players.length; i++) {
        this.players[i].update(data.players[i]);
    }

    this.bombs.length = 0;
    for (var i = 0; i < data.bombs.length; i++) {
        this.bombs.push(data.bombs[i]);
    }
};

Game.Player = function() {
    this.x = 1.0;
    this.y = 1.0;
    this.z = 0.0;
    this.width = 0.6;
    this.height = 1.0;
    this.maxBombs = 1;
};

Game.Bomb = function(x, y, game) {
    this.x = x;
    this.y = y;
    this.power = 1;
    var thisBomb = this;
    setTimeout(function() {
        game.Explode(thisBomb);
    }, game.bombInterval);
};

Game.prototype.Explode = function(bomb) {
    console.log("BoOOoOOOOM!\nBoOOoOOOOM!\nBoOOoOOOOM!\nBoOOoOOOOM!\n");
    var i, j = -1;

    for (i = bomb.x; i <= bomb.x + bomb.power && i < this.width; i++) {
        if (this.world.walls[bomb.y][i] == 2) {
            this.world.walls[bomb.y][i] = 0;
            break;
        }
        if (this.world.walls[bomb.y][i] == 1) break;
    }
    for (i = bomb.x; i >= bomb.x - bomb.power && i >= 0; i--) {
        if (this.world.walls[bomb.y][i] == 2) {
            this.world.walls[bomb.y][i] = 0;
            break;
        }
        if (this.world.walls[bomb.y][i] == 1) break;
    }
    for (i = bomb.y; i <= bomb.y + bomb.power && i < this.height; i++) {
        if (this.world.walls[i][bomb.x] == 2) {
            this.world.walls[i][bomb.x] = 0;
            break;
        }
        if (this.world.walls[i][bomb.x] == 1) break;
    }
    for (i = bomb.y; i >= bomb.y - bomb.power && i >= 0; i--) {
        if (this.world.walls[i][bomb.x] == 2) {
            this.world.walls[i][bomb.x] = 0;
            break;
        }
        if (this.world.walls[i][bomb.x] == 1) break;
    }
    for (i = 0; i < this.world.bombs.length; i++) {
        if (this.world.bombs[i].x == bomb.x && this.world.bombs[i].y == bomb.y) {
            j = i;
        }
    }
    //this.world.objects[this.y][this.x] = 0;
    if (j >= 0) {
        this.world.bombs.splice(j, 1);
    }

};

Game.Player.prototype.update = function(data) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
};

Game.Player.prototype.moveByKeys = function(keys, game) {
    var tempX, tempY;
    var oldX = this.x;
    var oldY = this.y;

    var i1 = Math.floor((this.y + game.blockWidth / 2)/ game.blockWidth);
    var j1 = Math.floor((this.x + game.blockWidth / 2) / game.blockWidth);

    if (keys.space) {
        var newBomb = new Game.Bomb(j1, i1, game);
        game.world.bombs.push(newBomb);
    }

    if (keys.left) {
        this.x -= game.step;
    }
    if (keys.right) {
        this.x += game.step;
    }
    if (keys.up) {
        this.y += game.step;
    }
    if (keys.down) {
        this.y -= game.step;
    }

//    console.log((this.y + this.width / 2) + "<=" + ((i1 + 0.5) * game.staticWorld.blockWidth));
//    console.log((this.y - this.width / 2) + ">=" + ((i1 - 0.5) * game.staticWorld.blockWidth));

    if (this.y > oldY && i1 < game.height - 1 && game.world.walls[i1 + 1][j1] > 0 && this.y + this.width / 2 >= (i1 + 0.5) * game.blockWidth) {
        this.y = oldY;
    }
    if (this.y < oldY && i1 > 0 && game.world.walls[i1 - 1][j1] > 0 && this.y - this.width / 2  <= (i1 - 0.5) * game.blockWidth) {
        this.y = oldY;
    }
    if (this.x > oldX && j1 < game.width - 1 && game.world.walls[i1][j1 + 1] > 0 && this.x + this.width / 2 >= (j1 + 0.5) * game.blockWidth) {
        this.x = oldX;
    }
    if (this.x < oldX && j1 > 0 && game.world.walls[i1][j1 - 1] > 0 && this.x - this.width / 2  <= (j1 - 0.5) * game.blockWidth) {
        this.x = oldX;
    }
    if ((this.x >= oldX && this.y > oldY || this.x > oldX && this.y >= oldY) &&
        i1 < game.height - 1 && j1 < game.width - 1 && game.world.walls[i1 + 1][j1 + 1] > 0) {
        tempX = this.x - (j1 + 0.5) * game.blockWidth;
        tempY = this.y - (i1 + 0.5) * game.blockWidth;
        if (tempX * tempX + tempY * tempY <= this.width * this.width / 4) {
            if (this.x > oldX) {
                this.x = oldX + game.step / 2;
                this.y = oldY - game.step / 2;
            } else {
                this.x = oldX - game.step / 2;
                this.y = oldY + game.step / 2;
            }
        }
    }
    if ((this.x >= oldX && this.y < oldY || this.x > oldX && this.y <= oldY) &&
        i1 > 0 && j1 < game.width - 1 && game.world.walls[i1 - 1][j1 + 1] > 0) {
        tempX = this.x - (j1 + 0.5) * game.blockWidth;
        tempY = this.y - (i1 - 0.5) * game.blockWidth;
        if (tempX * tempX + tempY * tempY <= this.width * this.width / 4) {
            if (this.x > oldX) {
                this.x = oldX + game.step / 2;
                this.y = oldY + game.step / 2;
            } else {
                this.x = oldX - game.step / 2;
                this.y = oldY - game.step / 2;
            }
        }
    }
    if ((this.x <= oldX && this.y > oldY || this.x < oldX && this.y >= oldY) &&
        i1 < game.height - 1 && j1 > 0 && game.world.walls[i1 + 1][j1 - 1] > 0) {
        tempX = this.x - (j1 - 0.5) * game.blockWidth;
        tempY = this.y - (i1 + 0.5) * game.blockWidth;
        if (tempX * tempX + tempY * tempY <= this.width * this.width / 4) {
            if (this.x > oldX) {
                this.x = oldX - game.step / 2;
                this.y = oldY - game.step / 2;
            } else {
                this.x = oldX + game.step / 2;
                this.y = oldY + game.step / 2;
            }
        }
    }
    if ((this.x <= oldX && this.y < oldY || this.x > oldX && this.y <= oldY) &&
        i1 > 0 && j1 > 0 && game.world.walls[i1 - 1][j1 - 1] > 0) {
        tempX = this.x - (j1 - 0.5) * game.blockWidth;
        tempY = this.y - (i1 - 0.5) * game.blockWidth;
        if (tempX * tempX + tempY * tempY <= this.width * this.width / 4) {
            if (this.x > oldX) {
                this.x = oldX - game.step / 2;
                this.y = oldY + game.step / 2;
            } else {
                this.x = oldX + game.step / 2;
                this.y = oldY - game.step / 2;
            }
        }
    }
};

if (typeof module != "undefined") {
    module.exports = Game;
}
