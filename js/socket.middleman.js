function Socket(url) {
    this.url = url;
    this.socket = undefined;
}

Socket.prototype.connect = function() {
    this.socket = io(this.url, {
        reconnection: false
    });
};

Socket.prototype.emit = function(key, data) {
    this.socket.emit(key, data);
};

Socket.prototype.on = function(key, cb) {
    this.socket.on(key, cb);
};

Socket.prototype.onMessage = function(cb) {
      // cb accepts (key, data)

};

Socket.prototype.disconnect = function() {
    this.socket.disconnect();
};