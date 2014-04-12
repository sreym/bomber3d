Game = function() {
    this.width = 15;
    this.height = 13;
    this.world = new Game.World(this.width, this.height);
    this.player = new Game.Player();
    this.world.players.push(this.player);
    this.staticWorld = new Game.StaticWorld(this.width, this.height);
}

Game.prototype.update = function(data) {
    this.staticWorld.update(data.staticWorld);
}

Game.StaticWorld = function(width, height) {
    this.width = width;
    this.height = height;
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
}

Game.StaticWorld.prototype.update = function(data) {
    for(var i = 0; i < this.walls.length; i++) {
        for(var j = 0; j < this.walls[i].length; i++) {
            this.walls[i][j] = data.walls[i][j];
        }
    }
}

Game.World = function() {
    this.players = [];
    this.walls = [];
    this.bombs = [];
}

Game.World.prototype.update = function(data) {
    for(var i = 0; i < this.players.length; i++) {
        this.players[i].update(data.players[i]);
    }
}

Game.Player = function() {
    this.x = 0.0;
    this.y = 0.0;
    this.z = 0.0;
}

Game.Player.prototype.update = function(data) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
}

Game.Player.prototype.moveByKeys = function(keys) {
    if (keys.left) {
        this.x -= 0.1;
    }
    if (keys.right) {
        this.x += 0.1;
    }
    if (keys.up) {
        this.z -= 0.1;
    }
    if (keys.down) {
        this.z += 0.1;
    }
}

if (!this.document) {
    module.exports = Game;
}
