var mouseDown = false;
var lastPos = undefined;
var socket = new Socket("98.193.176.25", "8080");
var canvas;
var receivedBoard = false;

function init()
{
    canvas = $("canvas");
    
    canvas.mousemove(mouseMoved);
    
    canvas.mousedown(function()
    {
        mouseDown = true;
    });
    
    canvas.mouseup(function()
    {
        mouseDown = false;
        lastPos = undefined;
    });
    
    canvas.mouseleave(function()
    {
        mouseDown = false;
        lastPos = undefined;
    });
    
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
    
    setInterval(function ()
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
}

function clearBoard()
{
    socket.sendCommand("clear", "");
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
        c.getContext("2d").clearRect(0, 0, c.width, c.height);   
    }
    else if (data.command === "requestboard")
    {
        sendBoard();
    }
    else if (data.command === "board")
    {
        var img = new Image;
        
        img.onload = function()
        {
            var c = canvas.get(0).getContext("2d");
            c.drawImage(this, 0, 0);
            receivedBoard = true;
        };
        
        img.src = data.data;
    }
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
	var d = $(el).get(0);
	
    x -= d.offsetLeft;
    y -= d.offsetTop;
	
	return { "x": x, "y": y };
}