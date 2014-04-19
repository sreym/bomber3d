Keys = function() {
    var this_ = this;

    this.space = false;
    this.left = false;
    this.up = false;
    this.right = false;
    this.down = false;

    this.lastKey = null;

    document.addEventListener('keydown', function(e) {
        this_.changeIfKeyStatus(e.keyCode, true);
    });
    document.addEventListener('keyup', function(e) {
        this_.changeIfKeyStatus(e.keyCode, false);
    });
};
Keys.prototype.changeIfKeyStatus = function(keyCode, status) {
    switch(keyCode) {
        case 32: this.space = status; this.lastKey = 'space'; break;
        case 37: this.left = status; this.lastKey = 'left'; break;
        case 38: this.up = status; this.lastKey = 'up'; break;
        case 39: this.right = status; this.lastKey = 'right'; break;
        case 40: this.down = status; this.lastKey = 'down'; break;
    }
}