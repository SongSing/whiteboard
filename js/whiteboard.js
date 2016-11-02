var drawcanvas, canvas, socket;
var size = 5;
var minSize = 1;
var maxSize = 200;
var color = "#000000";
var state = "draw";
var receivedBoard = false;
var resw = 1920 / 2;
var resh = 1080 / 2;
var skip = 1;
var scounter = 0;
var moved = false;
var bgdata = "";
var erasing = false;
var tool_pencil, tool_eraser, tool_drawRect, tool_fillRect, tool_clearRect;
var tool;

function el(id) {
    return document.getElementById(id);
}

function noop() {}

function init() {
    tool_pencil = new PencilTool();
    tool_eraser = new EraserTool();
    tool_drawRect = new DrawRectTool();
    tool_fillRect = new FillRectTool();
    tool_clearRect = new ClearRectTool();

    setToolPencil();

    drawcanvas = new Canvas(el("drawcanvas"));

    canvas = new Canvas(el("canvas"));
    canvas.setMouseDown(mouseDown);
    canvas.setMouseUp(mouseUp);
    canvas.setMouseMove(mouseMoved);

    canvas.resize(resw, resh);
    drawcanvas.resize(resw, resh);

    drawcanvas.setLineCap("round");
    drawcanvas.setLineJoin("round");

    socket = io.connect("http://68.53.99.168:5080");
    socket.on("connect", connected);
    socket.on("disconnect", disconnected);
    socket.on("draw", drawBoard);
    socket.on("erase", eraseBoard);
    socket.on("drawrect", drawRectBoard);
    socket.on("fillrect", fillRectBoard);
    socket.on("clearrect", clearRectBoard);
    socket.on("clear", clearBoard);
    socket.on("requestboard", sendBoard);
    socket.on("board", receiveBoard);
    socket.on("users", displayUsers);
    socket.on("chat", receiveChat);
    socket.on("bg", receiveBackground);

    el("pencil").onclick = setToolPencil;
    el("eraser").onclick = setToolEraser;
    el("drawrect").onclick = setToolDrawRect;
    el("fillrect").onclick = setToolFillRect;
    el("clearrect").onclick = setToolClearRect;

    el("showchat").onclick = toggleChat;
    el("save").onclick = saveBoard;
    el("pickcolor").onclick = pickColor;
    el("picksize").onclick = pickSize;
    el("clear").onclick = sendClearBoard;
    el("sizeok").onclick = sizeOk;
    el("colorok").onclick = colorOk;
    el("setbg").onclick = pickBackground;
    el("clearbg").onclick = clearBackground;
    el("filepicker").onchange = backgroundPicked;
    el("sendMessage").onclick = sendChat;
    el("chatMessage").onkeypress = function(e) {
        if (e.which === 13)
        {
            sendChat();
        }
    };

    el("size").value = size;
    el("color").value = color;

    window.onresize = resized;
    resized();
}

function mouseMoved(x, y, m, px, py, e) {
    e.preventDefault();
    moved = true;

    mouseDown = m;

    tool.clearCursor(x, y, px, py, e);
    tool.mouseMove(x, y, px, py, e);
    tool.drawCursor(x, y, px, py, e);
}

function mouseDown(x, y) {
    moved = false;
    tool.mouseDown(x, y);
}

function mouseUp(x, y, px ,py) {
    tool.mouseUp(x, y, px, py);
}

function connected() {
    console.log("connected");
}

function disconnected() {
    alert("you have been disconnected from the server :~P");
}

function drawBoard(data) {
    drawcanvas.drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
}

function eraseBoard(data) {
    drawcanvas.setComposition("destination-out");
    drawcanvas.drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
    drawcanvas.setComposition("source-over");
}

function drawRectBoard(data) {
    drawcanvas.setLineCap("square");
    drawcanvas.setLineJoin("miter");
    drawcanvas.drawRectPts(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
    drawcanvas.setLineCap("round");
    drawcanvas.setLineJoin("round");
};

function fillRectBoard(data) {
    drawcanvas.fillRectPts(data.x1, data.y1, data.x2, data.y2, data.color);
};

function clearRectBoard(data) {
    drawcanvas.setComposition("destination-out");
    drawcanvas.fillRectPts(data.x1, data.y1, data.x2, data.y2, data.color);
    drawcanvas.setComposition("source-over");
};

function clearBoard() {
    drawcanvas.clear();
}

function sendBoard() {
    if (receivedBoard) socket.emit("board", drawcanvas.toDataURL());
}

function receiveBoard(data) {
    data = typeof(data) === "string" ? data : new TextDecoder("utf8").decode(data);
    drawcanvas.drawDataURL(data, 0, 0, resw, resh, function() {
        receivedBoard = true;

        window.onbeforeunload = function() {
            sendBoard(); 
        };
    });
}

function displayUsers(users) {
    el("users").textContent = users;
}

function sendChat() {
    var $i = el("chatMessage");
    var c = $i.value.trim();

    if (c.length > 0) {
        socket.emit("chat", c);
        $i.value = "";
    }
}

function receiveChat(data) {
    var $container = el("chatMessageContainer");
    var $c = document.createElement("div");
    $c.className = "chatItem";
    $c.textContent = data;
    $c.innerHTML = "<span style='color:#666666; font-family:Courier New'>" + timestamp() + "</span>&nbsp;" + $c.innerHTML;
    $container.appendChild($c);
    $container.scrollTop = $container.scrollHeight;
}

function pickBackground() {
    el("filepicker").click();
}

function backgroundPicked() {
    var file = this.files[0];
    var mb = file.size / 1024 / 1024;

    var shrinkage = mb * 2 + 1;
    console.log(shrinkage);

    Canvas.fileToImage(file, function(img) {
        var durl = Canvas.imageToDataURL(img, shrinkage);
        socket.emit("bg", durl);
    });
}

function receiveBackground(data) {
    if (data === "") {
        el("drawcanvas").style["background-image"] = "";
    } else {
        el("drawcanvas").style["background-image"] = "url(" + data + ")";
    }

    bgdata = data;
}

function clearBackground() {
    socket.emit("bg", "");
}

function toggleChat() {
    var $e = el("chat");
    var $c = el("canvasArea");

    if (getComputedStyle($e).getPropertyValue("display") === "none") {
        $e.style.display = "block";
        $c.style.left = getComputedStyle($e).getPropertyValue("width");
    } else {
        $e.style.display = "none";
        $c.style.left = "0";
    }

    resized();
    canvas.deepCalcPosition();
    drawcanvas.deepCalcPosition();
}

function pickSize() {
    state = "size";
    el("over").style.display = "block";
    el("sizePicker").style.display = "block";
    canvas.clear();
    el("canvasArea").style.cursor = "default";
}

function pickColor() {
    state = "color";
    el("over").style.display = "block";
    el("colorPicker").style.display = "block";
    canvas.clear();
    el("canvasArea").style.cursor = "default";
}

function sizeOk() {
    size = el("size").value;
    el("sizePicker").style.display = "none";
    el("over").style.display = "none";
    state = "draw";
    //el("canvasArea").style.cursor = "none";
}

function colorOk() {
    color = el("color").value;
    color = color[0] === '#' ? color : "#" + color;
    el("colorPicker").style.display = "none";
    el("over").style.display = "none";
    state = "draw";
    //el("canvasArea").style.cursor = "none";
}

function setToolPencil() {
    tool = tool_pencil;
    var t = document.getElementsByClassName("tool");

    for (var i = 0; i < t.length; i++) {
        t[i].setAttribute("toggled", false);
    }

    el("pencil").setAttribute("toggled", true);
}

function setToolEraser() {
    tool = tool_eraser;
    var t = document.getElementsByClassName("tool");

    for (var i = 0; i < t.length; i++) {
        t[i].setAttribute("toggled", false);
    }
    el("eraser").setAttribute("toggled", true);
}

function setToolDrawRect() {
    tool = tool_drawRect;
    var t = document.getElementsByClassName("tool");

    for (var i = 0; i < t.length; i++) {
        t[i].setAttribute("toggled", false);
    }
    el("drawrect").setAttribute("toggled", true);
}

function setToolFillRect() {
    tool = tool_fillRect;
    var t = document.getElementsByClassName("tool");

    for (var i = 0; i < t.length; i++) {
        t[i].setAttribute("toggled", false);
    }
    el("fillrect").setAttribute("toggled", true);
}

function setToolClearRect() {
    tool = tool_clearRect;
    var t = document.getElementsByClassName("tool");

    for (var i = 0; i < t.length; i++) {
        t[i].setAttribute("toggled", false);
    }
    el("clearrect").setAttribute("toggled", true);
}

function sendClearBoard() {
    if (receivedBoard) {
        socket.emit("clear");
    }
}

function saveBoard() {
    var c = new Canvas(document.createElement("canvas"));
    c.resize(resw, resh);

    if (bgdata !== "") { // if there is a background
        c.drawDataURL(bgdata, 0, 0, resw, resh, function() {
            console.log("1");
            drawcanvas.getImage(function(img) {
                c.drawImage(img, 0, 0);
                window.open(c.toDataURL(), "_blank");
            });

        })
    } else {
        c.fill("white");
        drawcanvas.getImage(function(img) {
            c.drawImage(img, 0, 0);
            window.open(c.toDataURL(), "_blank");
        });
    }

}

function resized() {
    var $e = el("canvasArea");
    var ar = $e.offsetWidth / $e.offsetHeight;
    var car = canvas.width() / canvas.height();

    if (ar < car) {
        canvas.canvas.style.width = drawcanvas.canvas.style.width = "100%";
        canvas.canvas.style.height = drawcanvas.canvas.style.height = "auto";
    } else {
        canvas.canvas.style.width = drawcanvas.canvas.style.width = "auto";
        canvas.canvas.style.height = drawcanvas.canvas.style.height = "100%";
    }
}

window.onload = function() {
    init();
};

function timestamp() {
    var time = new Date();
    var h = time.getHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    var d = time.getDate();
    var mo = parseInt(time.getMonth() + 1);
    var y = time.getFullYear();
    var date = d + "-" + mo + "-" + y;
    m = (m < 10 ? "0" + m : m);
    s = (s < 10 ? "0" + s : s);
    var timestamp = "(" + (h < 10 ? "0" + h : h) + ":" + m + ":" + s + ")";
    return timestamp;
}