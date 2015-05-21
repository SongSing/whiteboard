var mouseDown = false;
var lastPos = undefined;
var socket = new Socket("98.193.176.25", "8080");
var canvas;

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
    
    socket.onMessage = handleMessage;
    socket.onClose = function()
    {
        alert("Connection to the server lost.");  
    };
    socket.connect();
}

function handleMessage(msg)
{
    var data = Socket.unpack(msg);
    
    if (data.command === "draw")
    {
        var p = JSON.parse(data.data);
        
        var color = "black";
        var c = canvas.get(0).getContext("2d");
        c.strokeStyle = color;
        c.fillStyle = color;
        c.lineWidth = 5;

        c.beginPath();
        c.moveTo(p.p1.x, p.p1.y);
        c.lineTo(p.p2.x, p.p2.y);
        c.stroke();
        c.beginPath();
        c.arc(p.p2.x, p.p2.y, 2.5, 0, 2 * Math.PI);
        c.fill();
    }
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
    
    var toSend = { "p1": lastPos, "p2": p };
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