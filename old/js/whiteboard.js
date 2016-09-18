var mouseDown = false;
var lastPos = undefined;
var socket = new Socket("68.53.99.168", "5080");
var canvas;
var receivedBoard = false;
var mouseCounter = -1;
var mouseBuffer = 1; // increase to reduce strain on server

function fmouseDown()
{
    mouseDown = true;
}

function fmouseUp()
{
    mouseDown = false;
    lastPos = undefined;
}

function fmouseLeave()
{
    mouseDown = false;
    lastPos = undefined;
}

function init()
{
    canvas = $("canvas");

    canvas.get(0).getContext("2d").fillStyle = "white";
    canvas.get(0).getContext("2d").fillRect(0, 0, 800, 600); 
    
    canvas.mousemove(mouseMoved);
    
    canvas.mousedown(function()
    {
        fmouseDown();
    });
    
    canvas.mouseup(function()
    {
        fmouseUp();
    });
    
    canvas.mouseleave(function()
    {
        fmouseLeave();
    });

    $(canvas).get(0).addEventListener("touchstart", fmouseDown, false);
    $(canvas).get(0).addEventListener("touchend", fmouseUp, false);
    $(canvas).get(0).addEventListener("touchcancel", fmouseLeave, false);
    $(canvas).get(0).addEventListener("touchmove", mouseMoved, false);
    
    socket.onMessage = handleMessage;
    socket.onClose = function()
    {
        alert("Connection to the server lost.");  
    };
    socket.connect();
    
    $("#clear").click(clearBoard);
    $("#save").click(function()
    {
        window.open(canvas.get(0).toDataURL(), "_blank");
    });
    
    setInterval(function()
    {
        if (socket.socket.readyState === 1)
        {
            socket.sendCommand("ping", "");
        }
    }, 60000);
    
    window.onbeforeunload = function()
    {
        sendBoard(); 
    };
    
    $("#sendMessage").click(sendMessage);
    
    $("#chatMessage").keypress(function(e)
	{
		if (e.which === 13)
		{
			sendMessage();
		}
	});
}

function clearBoard()
{
    socket.sendCommand("clear", "");
}

function sendMessage()
{
    if ($("#chatMessage").get(0).value.length > 0)
    {    
        socket.sendCommand("chat", $("#chatMessage").get(0).value);
        $("#chatMessage").get(0).value = "";
    }
}

function handleMessage(msg)
{
    var data = Socket.unpack(msg);
    
    if (data.command === "draw")
    {
        var p = JSON.parse(data.data);
        
        var color = p.color;
        var c = canvas.get(0).getContext("2d");
        c.strokeStyle = color;
        c.fillStyle = color;
        c.lineWidth = p.size;

        c.beginPath();
        c.moveTo(p.p1.x, p.p1.y);
        c.lineTo(p.p2.x, p.p2.y);
        c.stroke();
        c.beginPath();
        c.arc(p.p2.x, p.p2.y, p.size / 2, 0, 2 * Math.PI);
        c.fill();
    }
    else if (data.command === "clear")
    {
        var c = canvas.get(0);
        c.getContext("2d").fillStyle = "white";
        c.getContext("2d").fillRect(0, 0, 800, 600);   
    }
    else if (data.command === "requestboard")
    {
        sendBoard();
    }
    else if (data.command === "board")
    {
        var img = new Image;
        
        if (data.data === "")
        {
            receivedBoard = true;   
        }
        
        img.onload = function()
        {
            receivedBoard = true;
            var c = canvas.get(0).getContext("2d");
            c.drawImage(this, 0, 0);
        };
        
        img.src = data.data;
    }
    else if (data.command === "users")
    {
        $("#usersNumber").html(data.data);   
    }
    else if (data.command === "chat")
    {
        var c = document.createElement("div");
        c.className = "chatItem";
        $(c).text(data.data);
        c.innerHTML = "<span style='color:#666666; font-family:Courier New'>" + timestamp() + "</span>&nbsp;" + c.innerHTML;
        $("#chatMessageContainer").append(c);
        var w = $("#chatMessageContainer").get(0);
        w.scrollTop = w.scrollHeight;
    }
}

function timestamp()
{
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

function sendBoard()
{
    if (receivedBoard)
        socket.sendCommand("board", canvas.get(0).toDataURL());   
}

function mouseMoved(e)
{
    if (!mouseDown)
        return;
    
    mouseCounter++;
    mouseCounter %= mouseBuffer;
    
    if (mouseCounter !== 0)
        return;
    
    var p = pos(e, "#canvas");
    
    if (lastPos === undefined)
    {
        lastPos = p;
        return;
    }
    
    var c = $("#color").get(0).value;
    var n = parseInt($("#size").get(0).value);
    
    var toSend = { "p1": lastPos, "p2": p, "color": c, "size": n };
    lastPos = p;
    
    socket.sendCommand("draw", JSON.stringify(toSend));
}

function pos(e, el)
{
	var x = e.clientX;
	var y = e.clientY;

    if (e.changedTouches)
    {
        x = e.changedTouches[0].clientX;
        y = e.changedTouches[0].clientY;
    }

	var d = $(el).get(0);
	
    x -= d.offsetLeft;
    y -= d.offsetTop;
	
	return { "x": x, "y": y };
}