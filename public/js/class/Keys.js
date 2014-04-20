Keys = function() {
    var this_ = this;

    this.keys = [];

    this.keys[32] = "space";
    this.keys[37] = "left";
    this.keys[38] = "up";
    this.keys[39] = "right";
    this.keys[40] = "down";

    for(var i in this.keys) {
        this[this.keys[i]] = false;
    }

    this.lastKeyDown = null;
    this.lastKeyUp = null;

    document.addEventListener('keydown', function(e) {
        if (this_.keys[e.keyCode]) {
            this_[this_.keys[e.keyCode]] = true;
            this_.lastKeyDown = this_.keys[e.keyCode];
        }
    });
    document.addEventListener('keyup', function(e) {
        if (this_.keys[e.keyCode]) {
            this_[this_.keys[e.keyCode]] = false;
            this_.lastKeyUp = this_.keys[e.keyCode];
        }
    });
};
