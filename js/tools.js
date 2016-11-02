function PencilTool() {
    this.size = 5;
    this.scounter = 0;
}

PencilTool.prototype.mouseDown = function(x, y) {
    //
};

PencilTool.prototype.mouseMove = function(x, y, px, py, e) {
    if (receivedBoard && mouseDown && (e.button === 0 || e.changedTouches)) {
        if (/*scounter === 0*/true) {
            socket.emit("draw", { x1: x, x2: px, y1: y, y2: py, size: size, color: color });
        } else {
            canvas.pastPos = { x: px, y: py };
            return false;
        }
    }
};

PencilTool.prototype.mouseUp = function(x, y, px, py) {
    if (receivedBoard && !moved) {
        socket.emit("draw", { x1: x, x2: px, y1: y, y2: py, size: this.size, color: color });
    }
};

PencilTool.prototype.drawCursor = function(x, y, px, py) {
    canvas.drawCircleInSquare(x - this.size / 2, y - this.size / 2, this.size, color, 1);
};

PencilTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clearRect(px - this.size / 2 - 1, py - this.size / 2 - 1, this.size + 2, this.size + 2);
};


function EraserTool() {
    this.size = 5;
};

EraserTool.prototype.mouseDown = function(x, y) {
    //
};

EraserTool.prototype.mouseMove = function(x, y, px, py, e) {
    if (receivedBoard && mouseDown && (e.button === 0 || e.changedTouches)) {
        if (/*scounter === 0*/true) {
            socket.emit("erase", { x1: x, x2: px, y1: y, y2: py, size: size, color: color });
        } else {
            canvas.pastPos = { x: px, y: py };
            return false;
        }
    }
};

EraserTool.prototype.mouseUp = function(x, y, px, py) {
    if (receivedBoard && !moved) {
        socket.emit("erase", { x1: x, x2: px, y1: y, y2: py, size: this.size, color: color });
    }
};

EraserTool.prototype.drawCursor = function(x, y, px, py) {
    canvas.fillCircleInSquare(x - this.size / 2, y - this.size / 2, this.size, "white", 1);
    canvas.drawCircleInSquare(x - this.size / 2, y - this.size / 2, this.size, "black", 1);
};

EraserTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clearRect(px - this.size / 2 - 1, py - this.size / 2 - 1, this.size + 2, this.size + 2);
};

function DrawRectTool() {
    this.size = 5;
    this.active = false;
    this.w = 2;
    this.s = 10;
}

DrawRectTool.prototype.mouseDown = function(x, y) {
    this.ox = x;
    this.oy = y;
    this.active = true;
};

DrawRectTool.prototype.mouseMove = function(x, y, px, py, e) {
    if (receivedBoard && mouseDown && (e.button === 0 || e.changedTouches)) {
        canvas.drawRectPts(x, y, this.ox, this.oy, color, this.size);
    }
};

DrawRectTool.prototype.mouseUp = function(x, y) {
    if (receivedBoard && this.active) {
        socket.emit("drawrect", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: this.size, color: color });
    }

    this.active = false;
};

DrawRectTool.prototype.drawCursor = function(x, y) {

    canvas.fillRect(x - this.s / 2, y - this.w / 2, this.s, this.w, color);
    canvas.fillRect(x - this.w / 2, y - this.s / 2, this.w, this.s, color);
};

DrawRectTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clear();
};

function FillRectTool() {
    this.size = 5;
    this.active = false;
    this.w = 2;
    this.s = 10;
}

FillRectTool.prototype.mouseDown = function(x, y) {
    this.ox = x;
    this.oy = y;
    this.active = true;
};

FillRectTool.prototype.mouseMove = function(x, y, px, py, e) {
    if (receivedBoard && mouseDown && (e.button === 0 || e.changedTouches)) {
        canvas.fillRectPts(x, y, this.ox, this.oy, color);
    }
};

FillRectTool.prototype.mouseUp = function(x, y) {
    if (receivedBoard && this.active) {
        socket.emit("fillrect", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: this.size, color: color });
    }

    this.active = false;
};

FillRectTool.prototype.drawCursor = function(x, y) {

    canvas.fillRect(x - this.s / 2, y - this.w / 2, this.s, this.w, color);
    canvas.fillRect(x - this.w / 2, y - this.s / 2, this.w, this.s, color);
};

FillRectTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clear();
};

function ClearRectTool() {
    this.size = 5;
    this.active = false;
    this.w = 2;
    this.s = 10;
}

ClearRectTool.prototype.mouseDown = function(x, y) {
    this.ox = x;
    this.oy = y;
    this.active = true;
};

ClearRectTool.prototype.mouseMove = function(x, y, px, py, e) {
    if (receivedBoard && mouseDown && (e.button === 0 || e.changedTouches)) {
        canvas.fillRectPts(x, y, this.ox, this.oy, "white");
    }
};

ClearRectTool.prototype.mouseUp = function(x, y) {
    if (receivedBoard && this.active) {
        socket.emit("clearrect", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: this.size, color: color });
    }

    this.active = false;
};

ClearRectTool.prototype.drawCursor = function(x, y) {
    canvas.fillRect(x - this.s / 2, y - this.w / 2, this.s, this.w, "black");
    canvas.fillRect(x - this.w / 2, y - this.s / 2, this.w, this.s, "black");
};

ClearRectTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clear();
};