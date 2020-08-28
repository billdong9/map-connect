var dgram = require('dgram');
var net = require('net');
var _addr, _port, client;

exports.init = function(success, error, end) {
    try {
        var s = dgram.createSocket('udp4');
        s.on('message', function(msg, rinfo) {
            var response = JSON.parse(msg.toString());
            if (response.Addresses != null && response.Port != null) {
                _addr = null;
                for (i = 0; i < response.Addresses.length; i++) {
                    const regexp = new RegExp('(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)');
                    if (response.Addresses[i].match(regexp) != null) {
                        _addr = response.Addresses[i];
                        break;
                    }
                }
                _port = 10111;
                s.close();
                client = new net.Socket();
                client.connect(parseInt(_port), _addr);
                client.on('end', end);
                console.log("Connected to Infinite Flight at " + _addr + ':' + _port);
                success();
            }
        });
        s.bind(15000);
    } catch {
        error();
    }
}

exports.sendCmd = function(cmd, params) {
    try {
        var jsonStr = JSON.stringify({
            "Command": cmd,
            "Parameters": params
        });
        var data = new Uint8Array(jsonStr.length + 4);
        data[0] = jsonStr.length;

        for (var i = 0; i < jsonStr.length; i++) {
            data[i + 4] = jsonStr.charCodeAt(i);
        }

        var buffer = Buffer.from(data);
        client.write(buffer);
        return true;
    } catch {
        return false;
    }
}

exports.onMessage = function(callback) {
    client.on('data', function(chunk) {
        callback(chunk.toString());
    });
}
