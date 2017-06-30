function initTools() {
    tools.pencil = {
        count: 0,
        name: "Pencil",
        src: "img/paintbrush.png",
        mouseMove: function(x, y, lx, ly, e) {
            this.count++;
            var r = settings.size / 2;
            if (this.count === 100) {
                canvas_fx.clear();
                this.count = 0;
            } else {
                canvas_fx.clearRect(lx - settings.size - 4, ly - settings.size - 4, settings.size * 2 + 8, settings.size * 2 + 8);
            }

            canvas_fx.drawCircle(x, y, r, settings.color, 2);
            canvas_fx.drawCircle(x, y, r, "black", 1);
            canvas_fx.setLineDash([2]);
            canvas_fx.drawCircle(x, y, r, "white", 1);
            canvas_fx.setLineDash([]);

            if (receivedBoard && mouseIsDown && (e.button === 0 || e.changedTouches)) {
                socket.emit("draw", { x1: lx, x2: x, y1: ly, y2: y, size: settings.size, color: settings.color });
            }
        },
        mouseDown: function(x, y, e) {

        },
        mouseUp: function(x, y, e) {

        }
    };

    tools.eraser = {
        name: "Eraser",
        src: "img/eraser.png",
        mouseMove: function(x, y, lx, ly, e) {
            canvas_fx.clear();
            canvas_fx.drawCircle(x, y, settings.size / 2, "black", 2);
            canvas_fx.drawCircle(x, y, settings.size / 2, "white", 1);

            if (receivedBoard && mouseIsDown && (e.button === 0 || e.changedTouches)) {
                socket.emit("erase", { x1: lx, x2: x, y1: ly, y2: y, size: settings.size, color: settings.color });
            }
        },
        mouseDown: function(x, y, e) {

        },
        mouseUp: function(x, y, e) {

        }
    };

    tools.drawRect = {
        name: "Draw Rectangle",
        src: "img/rect.png",
        ox: 0,
        oy: 0,
        active: false,
        w: 2,
        s: 10,
        mouseMove: function(x, y, lx, ly, e) {
            canvas_fx.clear();
            if (receivedBoard && mouseIsDown && (e.button === 0 || e.touchedChanges)) {
                canvas_fx.drawRectPts(x, y, this.ox, this.oy, settings.color, settings.size);
            }

            canvas_fx.fillRect(x - this.s / 2, y - this.w / 2, this.s, this.w, settings.color);
            canvas_fx.fillRect(x - this.w / 2, y - this.s / 2, this.w, this.s, settings.color);
        },
        mouseDown: function(x, y, e) {
            if (receivedBoard  && (e.button === 0 || e.touchedChanges)) {
                this.ox = x;
                this.oy = y;
                this.active = true;
            }
        },
        mouseUp: function(x, y, e) {
            if (receivedBoard && this.active) {
                this.active = false;
                socket.emit("drawrect", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: settings.size, color: settings.color });
            }
        }

    };



    tools.drawCircle = {
        name: "Draw Circle",
        src: "img/circle.png",
        ox: 0,
        oy: 0,
        active: false,
        w: 2,
        s: 10,
        mouseMove: function(x, y, lx, ly, e) {
            canvas_fx.clear();
            if (receivedBoard && mouseIsDown && (e.button === 0 || e.touchedChanges)) {
                canvas_fx.drawCircleInPts(x, y, this.ox, this.oy, settings.color, settings.size);
            }

            canvas_fx.fillRect(x - this.s / 2, y - this.w / 2, this.s, this.w, settings.color);
            canvas_fx.fillRect(x - this.w / 2, y - this.s / 2, this.w, this.s, settings.color);
        },
        mouseDown: function(x, y, e) {
            if (receivedBoard  && (e.button === 0 || e.touchedChanges)) {
                this.ox = x;
                this.oy = y;
                this.active = true;
            }
        },
        mouseUp: function(x, y, e) {
            if (receivedBoard && this.active) {
                this.active = false;
                socket.emit("drawcircle", { x1: this.ox, y1: this.oy, x2: x, y2: y, size: settings.size, color: settings.color });
            }
        }

    };



    for (var tool in tools) {
        var $t = document.createElement("div");
        $t.className = "tool";
        $t.style["background-image"] = "url('" + tools[tool].src + "')";
        $t.tool = tools[tool];
        $t.setAttribute("aria-label", tools[tool].name);
        $t.setAttribute("title", tools[tool].name);
        $t.addEventListener("click", (function() {
            setCurrentTool(this.tool);
            toggleTools();
        }).bind($t));
        document.getElementById("container-tools").appendChild($t);
    }
};