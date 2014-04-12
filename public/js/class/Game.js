Game = function() {
    this.world = new Game.World();
    this.player = new Game.Player();
    this.world.players.push(this.player);
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
        this.z += 0.1;
    }
    if (keys.down) {
        this.z -= 0.1;
    }
}

if (this.module) {
    module.exports = Game;
}