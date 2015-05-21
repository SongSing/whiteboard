function Socket(ip, port)
{
    this.socket = undefined;
    this.ip = ip;
    this.port = port;
    
    this.onOpen = function()
    {
        console.log("Opened");
    };
    
    this.onMessage = function(msg)
    {
        console.log("Received: " + msg);
    };
    
    this.onClose = function()
    {
        console.log("Closed");
    };
    
    this.onError = function(e)
    {
        console.log("Error: " + e.data);  
    };
}

Socket.prototype.connect = function()
{
    var self = this;
    this.socket = new WebSocket("ws://" + this.ip + ":" + this.port);
    
    this.socket.onmessage = function(e)
    {
        self.onMessage(e.data);
    };
    
    this.socket.onopen = this.onOpen;
    this.socket.onclose = this.onClose;
    this.socket.onerror = this.onError;
}

Socket.prototype.sendRaw = function(data)
{
    this.socket.send(data);
};

Socket.prototype.sendCommand = function(command, data)
{
    var toSend = command + "|" + data;
    this.sendRaw(toSend);
};

Socket.unpack = function(d)
{
    var command, data;
    
    if (d.indexOf("|") === -1)
    {
        command = undefined;
        data = d;
    }
    else
    {
        command = d.substr(0, d.indexOf("|"));
        data = d.substr(d.indexOf("|") + 1);
    }
    
    return { "command": command, "data": data };
};