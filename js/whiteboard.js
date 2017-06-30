var socket;
var resX, resY;
var canvas_bottom, canvas_main, canvas_top, canvas_fx;
var receivedBoard = false;
var tools = {};
var settings = {
    server: "",
    room: "",
    color: "#000000",
    size: 5
};
var currentTool;
var mouseIsDown = false;
var workingImg;

var handlers = {
    connect: function(data) {
        document.getElementById("container").style.display = "none";
        document.getElementById("container-landing").style.display = "none";
    },
    disconnect: function(data) {
        goto_landing();
    },
    welcome: function(data) {
        socket.emit("join", { room: settings.room });
    },
    init: function(data) {
        resX = data.res[0];
        resY = data.res[1];

        applyToCanvas(function(canvas) {
            canvas.resize(resX, resY, false);
        });

        goto_board();
        drawBoard(data);
        canvas_main.setLineCap("round");
        canvas_main.setLineJoin("round");

        setInterval(function() {
            sendBoard();
        }, 10000);
    },
    draw: function(data) {
        canvas_main.drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
    },
    clear: function(data) {
        clearBoard();
    },
    erase: function(data) {
        canvas_main.setComposition("destination-out");
        canvas_main.drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
        canvas_main.setComposition("source-over");
    },
    chat: function(data) {
        printMessage(data.message);
    },
    requestboard: function(data) {
        sendBoard();
    },
    drawrect: function(data) {
        canvas_main.setLineCap("square");
        canvas_main.setLineJoin("miter");
        canvas_main.drawRectPts(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
        canvas_main.setLineCap("round");
        canvas_main.setLineJoin("round");
    },
    drawcircle: function(data) {
        canvas_main.drawCircleInPts(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
    },
    img: function(data) {
        canvas_main.drawDataURL(data.data, data.x, data.y, data.width, data.height);
    }
};

function applyToCanvas(fn) {
    fn(canvas_bottom);
    fn(canvas_main);
    fn(canvas_top);
    fn(canvas_fx);
};

function init() {
    goto_landing();
    document.getElementById("connect").addEventListener("click", connectToServer);
    canvas_bottom = new Canvas(document.getElementById("canvas-bottom"), Canvas.flags.useDeepCalc);
    canvas_top = new Canvas(document.getElementById("canvas-top"), Canvas.flags.useDeepCalc);
    canvas_fx = new Canvas(document.getElementById("canvas-fx"), Canvas.flags.useDeepCalc);
    canvas_main = new Canvas(document.getElementById("canvas-main"), Canvas.flags.useDeepCalc);

    settings.server = document.getElementById("server").value;
    settings.room = document.getElementById("server-room").value;

    var t = document.getElementsByClassName("tool");
    for (var i = 0; i < t.length; i++) {
        t[i].style["background-image"] = "url('" + t[i].getAttribute("src") + "')";
    }

    var colors = document.getElementsByClassName("color");
    for (var i = 0; i < colors.length; i++) {
        colors[i].style.background = colors[i].getAttribute("color");
        colors[i].addEventListener("click", function() {
            setColor(this.getAttribute("color"));
        })
    }

    canvas_fx.setMouseMove(function(x, y, md, lx, ly, e) {
        currentTool.mouseMove(x, y, lx, ly, e);
    });

    canvas_fx.setMouseDown(function(x, y, e) {
        if (e.button === 0 || e.changedTouches) {
            mouseIsDown = true;
        }

        currentTool.mouseDown(x, y, e);
        toggleTools(false);
        toggleSize(false);
        toggleMenu(false);
    });

    /*canvas_fx.setMouseUp(function(x, y, e) {
        mouseIsDown = false;
        currentTool.mouseUp(x, y, e);
    });*/

    document.body.addEventListener("mouseup", function(e) {
        if (!receivedBoard) return;
        e.pageX += canvas_fx.canvas.offsetLeft;
        e.pageY += canvas_fx.canvas.offsetTop;

        if (e.changedTouches) {
            e.changedTouches[0].pageX += canvas_fx.canvas.offsetLeft;
            e.changedTouches[0].pageY += canvas_fx.canvas.offsetTop;
        }

        var p = canvas_fx.pos(e);
        mouseIsDown = false;
        if (canvas_fx.lastPos === undefined) canvas_fx.lastPos = p;
        currentTool.mouseUp(p.x, p.y, canvas_fx.lastPos.x, canvas_fx.lastPos.y, e);
        canvas_fx.lastPos = p;
    });

    initTools();
    setCurrentTool(tools.pencil);
    setSize(5);

    document.getElementById("tool-tool").addEventListener("click", toggleTools);
    document.getElementById("tool-size").addEventListener("click", toggleSize);
    document.getElementById("tool-menu").addEventListener("click", toggleMenu);
    document.getElementById("chat-send").addEventListener("click", sendMessage);
    document.getElementById("menu-save").addEventListener("click", function() {
        var c = new Canvas(document.createElement("canvas"));
        c.resize(resX, resY);
        c.fill("white");
        c.drawImage(canvas_bottom.canvas, 0, 0, resX, resY);
        c.drawImage(canvas_main.canvas, 0, 0, resX, resY);
        window.open(c.toDataURL(), "_blank");
        toggleMenu(false);
    });
    document.getElementById("menu-clear").addEventListener("click", function() {
        socket.emit("clear");
        toggleMenu(false);
    });
    document.getElementById("chat-input").addEventListener("keydown", function(e) {
        if (e.which === 13)
        {
            sendMessage();
        }
    });
    document.getElementById("input-size").addEventListener("input", function() {
        var s = document.getElementById("input-size").value;
        canvas_fx.clear();
        canvas_fx.drawCircle(canvas_fx.cx(), canvas_fx.cy(), s / 2, "white", 1);
        canvas_fx.fillCircle(canvas_fx.cx(), canvas_fx.cy(), s / 2, "black");
        setSize(s);
    });
    document.getElementById("input-size").addEventListener("change", function() {
        canvas_fx.clear();
    });
    document.getElementById("tool-img").addEventListener("change", function() {
        if (!this.files[0]) return;
        document.getElementById("tool-img-label").style.display = "none";
        document.getElementById("tool-confirm").style.display = "inline-block";
        var file = this.files[0];

        Canvas.fileToImage(file, function(img) {
            var src = img.src;
            workingImg = img;
            var w = img.width;
            var h = img.height;

            while (w > canvas_main.canvas.offsetWidth || h > canvas_main.canvas.offsetHeight) {
                w /= 2;
                h /= 2;
            }

            var $d = document.createElement("div");
            $d.className = "img";
            $d.style["background-image"] = "url('" + src + "')";
            $d.style["background-size"] = "100% 100%";
            $d.style.resize = "both";
            $d.style.position = "absolute";
            $d.style.left = "0px";
            $d.style.top = "0px";
            $d.style.width = w + "px";
            $d.style.height = h + "px";
            $d.style["z-index"] = "900";
            $d.style.overflow = "auto";

            $d.addEventListener("mousedown", function(e) {
                var r = this.getBoundingClientRect();
                var _x = e.clientX - r.left;
                var _y = e.clientY - r.top;
                if (this.offsetWidth - _x < 20 && this.offsetHeight - _y < 20) {
                    return;
                }

                this.ox = e.clientX;
                this.oy = e.clientY;
                this.sx = getComputedStyle(this).left;
                this.sy = getComputedStyle(this).top;
                this.sx = parseInt(this.sx.substr(0, this.sx.length - 2));
                this.sy = parseInt(this.sy.substr(0, this.sy.length - 2));
                this.down = true;
            });

            $d.addEventListener("mousemove", function(e) {
                if (this.down) {
                    var dx = e.clientX - this.ox;
                    var dy = e.clientY - this.oy;
                    this.style.left = this.sx + dx + "px";
                    this.style.top = this.sy + dy + "px";
                }
            });

            $d.addEventListener("mouseup", function(e) {
                this.down = false;
            });

            document.getElementById("container-board").appendChild($d);
            this.value = "";
        });
    });
    document.getElementById("tool-confirm").addEventListener("click", function() {
        document.getElementById("tool-img-label").style.display = "inline-block";
        document.getElementById("tool-confirm").style.display = "none";
        var $i = document.getElementsByClassName("img")[0];
        var r = $i.getBoundingClientRect();

        var scale = canvas_main.width() / canvas_main.canvas.offsetWidth;
        var w = r.width * scale;
        var h = r.height * scale;
        var x = r.x * scale;
        var y = (r.y - 64) * scale;

        var c = new Canvas(document.createElement("canvas"));
        c.resize(w, h, false);
        c.drawImage(workingImg, 0, 0, w, h);
        socket.emit("img", {
            data: c.toDataURL(),
            x: x,
            y: y,
            width: w,
            height: h
        });

        document.getElementById("container-board").removeChild($i);
    });


    toggleTools(false);
    toggleSize(false);
    toggleMenu(false);

    window.addEventListener("resize", resized);
    resized();
}

function toggleTools(z) {
    var $t = document.getElementById("container-tools");
    var visible = getComputedStyle($t).display !== "none";
    if (z === true || z === false) visible = !z;
    if (visible) {
        $t.style.display = "none";
    } else {
        $t.style.display = "inline-block";
        toggleSize(false);
        toggleMenu(false);
    }
}

function toggleSize(z) {
    var $t = document.getElementById("container-size");
    var visible = getComputedStyle($t).display !== "none";
    if (z === true || z === false) visible = !z;
    if (visible) {
        $t.style.display = "none";
    } else {
        $t.style.display = "inline-block";
        toggleTools(false);
        toggleMenu(false);
    }
}

function toggleMenu(z) {
    var $t = document.getElementById("container-menu");
    var visible = getComputedStyle($t).display !== "none";
    if (z === true || z === false) visible = !z;
    if (visible) {
        $t.style.display = "none";
    } else {
        $t.style.display = "inline-block";
        toggleTools(false);
        toggleSize(false);
    }
}

function toggleChat(z) {
    var $t = document.getElementById("container-chat");
    var visible = getComputedStyle($t).display !== "none";
    if (z === true || z === false) visible = !z;
    if (visible) {
        $t.style.display = "none";
    } else {
        $t.style.display = "inline-block";
    }
}

function setSize(size) {
    document.getElementById("tool-size").innerText = size;
    document.getElementById("input-size").value = size;
    settings.size = size;
}

function setColor(c) {
    settings.color = c;
    document.getElementById("color-mycolor").setAttribute("color", c);
    document.getElementById("color-mycolor").style.background = c;
}

function setCurrentTool(t) {
    currentTool = t;
    document.getElementById("tool-tool").style["background-image"] = "url('" + t.src + "')";
}

function printMessage(message) {
    var $container = document.getElementById("container-chat-items");
    var $c = document.createElement("div");
    $c.className = "chat-item light";
    $c.innerText = message;
    $c.innerHTML = "<span class='timestamp'>" + timestamp() + "</span>&nbsp;" + $c.innerHTML;
    $container.appendChild($c);
    $container.scrollTop = $container.scrollHeight;
}

function sendMessage() {
    var $i = document.getElementById("chat-input");
    var c = $i.value.trim();

    if (c.length > 0) {
        socket.emit("chat", {message:c});
        $i.value = "";
    }
}

function connectToServer() {
    if (!socket || !socket.socket.connected) {
        settings.server = document.getElementById("server").value;
        settings.room = document.getElementById("server-room").value;
        socket = new Socket(settings.server);
        socket.connect();
        initSocket();
    }
}

function initSocket() {
    var r = function(key) {
        socket.on(key, handlers[key]);
    };

    for (var handler in handlers) {
        r(handler);
    }
}

function goto_board() {
    document.getElementById("container").style.display = "block";
    document.getElementById("container-landing").style.display = "none";
    resized();
}

function goto_landing() {
    document.getElementById("container").style.display = "none";
    document.getElementById("container-landing").style.display = "block";
}

function drawBoard(data) {
    if (!data.board) {
        if (!receivedBoard) {
            receivedBoard = true;
            window.addEventListener("beforeunload", sendBoard);
        }
        clearBoard();
    } else {
        canvas_main.drawDataURL(data.board, 0,  0, resX, resY, function() {
            if (!receivedBoard) {
                receivedBoard = true;
                window.addEventListener("beforeunload", sendBoard);
            }
        });
    }

    if (!data.background) {
        clearBackground();
    } else {
        canvas_bottom.drawDataURL(data.background, 0, 0, resX, resY);
    }
}

function sendBoard() {
    if (receivedBoard) {
        socket.emit("board", {board:canvas_main.toDataURL(),background:canvas_bottom.toDataURL()});
    }
}

function clearBoard() {
    canvas_main.clear();
}

function clearBackground() {
    canvas_bottom.clear();
}

function resized() {
    var $e = document.getElementById("container-board");
    var canvas = canvas_main;
    var visible = getComputedStyle(document.getElementById("container-chat")).display !== "none";

    var minChatWidth = 300;

    if (!visible) minChatWidth = 0;

    var workingWidth = document.body.clientWidth - minChatWidth;
    var workingHeight = $e.offsetHeight;

    var aspectRatio = canvas.width() / canvas.height();
    var workingAspectRatio = workingWidth / workingHeight;

    var left = document.body.clientWidth - minChatWidth;

    // greater means wider

    if (workingAspectRatio > aspectRatio) {
        canvas_main.canvas.style.height = workingHeight + "px";
        canvas_main.canvas.style.width = "auto";
        canvas_bottom.canvas.style.height = workingHeight + "px";
        canvas_bottom.canvas.style.width = "auto";
        canvas_top.canvas.style.height = workingHeight + "px";
        canvas_top.canvas.style.width = "auto";
        canvas_fx.canvas.style.height = workingHeight + "px";
        canvas_fx.canvas.style.width = "auto";
        left = Math.floor(aspectRatio * workingHeight);
    } else {
        canvas_main.canvas.style.width = workingWidth + "px";
        canvas_main.canvas.style.height = "auto";
        canvas_bottom.canvas.style.width = workingWidth + "px";
        canvas_bottom.canvas.style.height = "auto";
        canvas_top.canvas.style.width = workingWidth + "px";
        canvas_top.canvas.style.height = "auto";
        canvas_fx.canvas.style.width = workingWidth + "px";
        canvas_fx.canvas.style.height = "auto";
    }

    document.getElementById("container-chat").style.left = left + "px";
    document.getElementById("container-boardarea").style.width = left + "px";

    applyToCanvas(function(cc) {
        cc.deepCalcPosition();
    });
}

window.addEventListener("load", init);

function timestamp()
{
    var time = new Date();
    var h = time.getHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    var d = time.getDate();
    var mo = parseInt(time.getMonth() + 1);
    var y = time.getFullYear();
    var date = mo + "/" + d + "/" + y;
    m = (m < 10 ? "0" + m : m);
    s = (s < 10 ? "0" + s : s);
    var timestamp = "(" + (h < 10 ? "0" + h : h) + ":" + m + ":" + s + ")";
    return timestamp;
}