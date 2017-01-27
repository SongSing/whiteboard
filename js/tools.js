function PencilTool() {
    size = 5;
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

PencilTool.prototype.mouseUp = function(x, y, px, py, e) {
    if (receivedBoard && !moved && (e.button === 0 || e.changedTouches)) {
        socket.emit("draw", { x1: x, x2: px, y1: y, y2: py, size: size, color: color });
    }
};

PencilTool.prototype.drawCursor = function(x, y, px, py) {
    canvas.drawCircleInSquare(x - size / 2, y - size / 2, size, color, 1);
};

PencilTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clear();
};


function EraserTool() {
    size = 5;
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
        socket.emit("erase", { x1: x, x2: px, y1: y, y2: py, size: size, color: color });
    }
};

EraserTool.prototype.drawCursor = function(x, y, px, py) {
    canvas.fillCircleInSquare(x - size / 2, y - size / 2, size, "white", 1);
    canvas.drawCircleInSquare(x - size / 2, y - size / 2, size, "black", 1);
};

EraserTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clear();
};

function DrawRectTool() {
    size = 5;
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
        canvas.drawRectPts(x, y, this.ox, this.oy, color, size);
    }
};

DrawRectTool.prototype.mouseUp = function(x, y) {
    if (receivedBoard && this.active) {
        socket.emit("drawrect", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: size, color: color });
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
    size = 5;
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
        socket.emit("fillrect", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: size, color: color });
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
    size = 5;
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
        socket.emit("clearrect", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: size, color: color });
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

function DrawCircleTool() {
    size = 5;
    this.active = false;
    this.w = 2;
    this.s = 10;
}

DrawCircleTool.prototype.mouseDown = function(x, y) {
    this.ox = x;
    this.oy = y;
    this.active = true;
};

DrawCircleTool.prototype.mouseMove = function(x, y, px, py, e) {
    if (receivedBoard && mouseDown && (e.button === 0 || e.changedTouches)) {
        canvas.drawCircleInPts(x, y, this.ox, this.oy, color, size);
    }
};

DrawCircleTool.prototype.mouseUp = function(x, y) {
    if (receivedBoard && this.active) {
        socket.emit("drawcircle", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: size, color: color });
    }

    this.active = false;
};

DrawCircleTool.prototype.drawCursor = function(x, y) {

    canvas.fillRect(x - this.s / 2, y - this.w / 2, this.s, this.w, color);
    canvas.fillRect(x - this.w / 2, y - this.s / 2, this.w, this.s, color);
};

DrawCircleTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clear();
};

function FillCircleTool() {
    size = 5;
    this.active = false;
    this.w = 2;
    this.s = 10;
}

FillCircleTool.prototype.mouseDown = function(x, y) {
    this.ox = x;
    this.oy = y;
    this.active = true;
};

FillCircleTool.prototype.mouseMove = function(x, y, px, py, e) {
    if (receivedBoard && mouseDown && (e.button === 0 || e.changedTouches)) {
        canvas.fillCircleInPts(x, y, this.ox, this.oy, color);
    }
};

FillCircleTool.prototype.mouseUp = function(x, y) {
    if (receivedBoard && this.active) {
        socket.emit("fillcircle", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: size, color: color });
    }

    this.active = false;
};

FillCircleTool.prototype.drawCursor = function(x, y) {

    canvas.fillRect(x - this.s / 2, y - this.w / 2, this.s, this.w, color);
    canvas.fillRect(x - this.w / 2, y - this.s / 2, this.w, this.s, color);
};

FillCircleTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clear();
};

function ClearCircleTool() {
    size = 5;
    this.active = false;
    this.w = 2;
    this.s = 10;
}

ClearCircleTool.prototype.mouseDown = function(x, y) {
    this.ox = x;
    this.oy = y;
    this.active = true;
};

ClearCircleTool.prototype.mouseMove = function(x, y, px, py, e) {
    if (receivedBoard && mouseDown && (e.button === 0 || e.changedTouches)) {
        canvas.fillCircleInPts(x, y, this.ox, this.oy, "white");
    }
};

ClearCircleTool.prototype.mouseUp = function(x, y) {
    if (receivedBoard && this.active) {
        socket.emit("clearcircle", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: size, color: color });
    }

    this.active = false;
};

ClearCircleTool.prototype.drawCursor = function(x, y) {
    canvas.fillRect(x - this.s / 2, y - this.w / 2, this.s, this.w, "black");
    canvas.fillRect(x - this.w / 2, y - this.s / 2, this.w, this.s, "black");
};

ClearCircleTool.prototype.clearCursor = function(x, y, px, py) {
    canvas.clear();
};