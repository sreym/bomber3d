Game = function() {
    this.width = 15;
    this.height = 13;
    this.world = new Game.World(this.width, this.height);
    this.player = new Game.Player();
    this.world.players.push(this.player);
    this.staticWorld = new Game.StaticWorld(this.width, this.height);
};

Game.prototype.update = function(data) {
    this.staticWorld.update(data.staticWorld);
};

Game.StaticWorld = function(width, height) {
    this.width = width;
    this.height = height;
    this.blockWidth = 1.0;
    this.blockHeight = 0.8;
    this.step = 0.1;
    this.walls = [];
    for(var i = 0; i < height; i++) {
        var A = [];
        for(var j = 0; j < width; j++) {
            if (j == 0 || j == width - 1 || i == 0 || i == height - 1) {
                A.push(1);
            } else {
                A.push(i % 2 == 0 && j % 2 == 0 ? 1 : 0);
            }
        }
        this.walls.push(A);
    }
};

Game.StaticWorld.prototype.update = function(data) {
    for(var i = 0; i < this.walls.length; i++) {
        for(var j = 0; j < this.walls[i].length; j++) {
            this.walls[i][j] = data.walls[i][j];
        }
    }
};

Game.World = function() {
    this.players = [];
    this.walls = [];
    this.bombs = [];
};

Game.World.prototype.update = function(data) {
    for(var i = 0; i < this.players.length; i++) {
        this.players[i].update(data.players[i]);
    }
};

Game.Player = function() {
    this.x = 1.0;
    this.y = 1.0;
    this.z = 0.0;
    this.width = 0.6;
    this.height = 1.0;
};

Game.Player.prototype.update = function(data) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
};

Game.Player.prototype.moveByKeys = function(keys, game) {
    var oldx = this.x;
    var oldy = this.y;

    var i1 = Math.floor((this.y + game.staticWorld.blockWidth / 2)/ game.staticWorld.blockWidth);
    var j1 = Math.floor((this.x + game.staticWorld.blockWidth / 2) / game.staticWorld.blockWidth);
    console.log(i1 + " " + j1);
    if (keys.left) {
        this.x -= game.staticWorld.step;
    }
    if (keys.right) {
        this.x += game.staticWorld.step;
    }
    if (keys.up) {
        this.y += game.staticWorld.step;
    }
    if (keys.down) {
        this.y -= game.staticWorld.step;
    }

//    var i2 = Math.floor(this.y / game.staticWorld.blockWidth);
//    var j2 = Math.floor(this.x / game.staticWorld.blockWidth);
//    console.log((this.y + this.width / 2) + "<=" + ((i1 + 0.5) * game.staticWorld.blockWidth));
//    console.log((this.y - this.width / 2) + ">=" + ((i1 - 0.5) * game.staticWorld.blockWidth));
    if (this.y > oldy && i1 < game.staticWorld.height - 1 && game.staticWorld.walls[i1 + 1][j1] == 1 && this.y + this.width / 2 >= (i1 + 0.5) * game.staticWorld.blockWidth) {
        this.y = oldy;
    }
    if (this.y < oldy && i1 > 0 && game.staticWorld.walls[i1 - 1][j1] == 1 && this.y - this.width / 2  <= (i1 - 0.5) * game.staticWorld.blockWidth) {
        this.y = oldy;
    }
    if (this.x > oldx && j1 < game.staticWorld.width - 1 && game.staticWorld.walls[i1][j1 + 1] == 1 && this.x + this.width / 2 >= (j1 + 0.5) * game.staticWorld.blockWidth) {
        this.x = oldx;
    }
    if (this.x < oldx && j1 > 0 && game.staticWorld.walls[i1][j1 - 1] == 1 && this.x - this.width / 2  <= (j1 - 0.5) * game.staticWorld.blockWidth) {
        this.x = oldx;
    }

//    if (Math.floor( (this.z + this.width) / game.staticWorld.blockWidth) < i2 && game.staticWorld.walls[i2 - 1][j2] == 1) {
//     this.z = oldz;
//    }
//
//    if (Math.floor( (this.z - this.width) / game.staticWorld.blockWidth) > i2 && game.staticWorld.walls[i2 + 1][j2] == 1) {
//     this.z = oldz;
//    }
//
//    if (Math.floor( (this.x + this.width) / game.staticWorld.blockWidth) < j2 && game.staticWorld.walls[i2][j2 + 1] == 1) {
//     this.x = oldx;
//    }
//
//    if (Math.floor( (this.x - this.width) / game.staticWorld.blockWidth) < j2 && game.staticWorld.walls[i2][j2 - 1] == 1) {
//     this.x = oldx;
//    }


};

if (typeof module != "undefined") {
    module.exports = Game;
}
