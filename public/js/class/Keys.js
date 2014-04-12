Keys = function() {
    var this_ = this;

    this.space = false;
    this.left = false;
    this.up = false;
    this.right = false;
    this.down = false;

    document.addEventListener('keydown', function(e) {
        this_.changeIfKeyStatus(e.keyCode, true);
    });
    document.addEventListener('keyup', function(e) {
        this_.changeIfKeyStatus(e.keyCode, false);
    });
};
Keys.prototype.changeIfKeyStatus = function(keyCode, status) {
    switch(keyCode) {
        case 32: this.space = status; break;
        case 37: this.left = status; break;
        case 38: this.up = status; break;
        case 39: this.right = status; break;
        case 40: this.down = status; break;
    }
}