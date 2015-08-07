var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var socketio = require("socket.io");
var mimeTypes = {"html": "text/html", "jpeg": "image/jpeg", "jpg": "image/jpeg", "png": "image/png", "js": "text/javascript", "css": "text/css", "swf": "application/x-shockwave-flash"};

var httpServer = http.createServer(
        function (request, response) {
            var uri = url.parse(request.url).pathname;
            if (uri == "/")
                uri = "/index.html";
            var fname = path.join(process.cwd(), uri);
            fs.exists(fname, function (exists) {
                if (exists) {
                    fs.readFile(fname, function (err, data) {
                        if (!err) {
                            var extension = path.extname(fname).split(".")[1];
                            var mimeType = mimeTypes[extension];
                            response.writeHead(200, mimeType);
                            response.write(data);
                            response.end();
                        }
                        else {
                            response.writeHead(200, {"Content-Type": "text/plain"});
                            response.write('Error de lectura en el fichero: ' + uri);
                            response.end();
                        }
                    });
                }
                else {
                    console.log("Peticion invalida: " + uri);
                    response.writeHead(200, {"Content-Type": "text/plain"});
                    response.write('404 Not Found\n');
                    response.end();
                }
            });
        }
);
httpServer.listen(8080);
var io = socketio.listen(httpServer);

var allClients = new Array();
io.sockets.on('connection',
        function (client) {
            var nombre_cliente = "";
            client.on('disconnect', function () {
                var index = allClients.indexOf(nombre_cliente);
                if (index != -1) {
                    allClients.splice(index, 1);
                    io.sockets.emit('difundir_usuarios', allClients);
                }
                io.sockets.emit("difundir_mensaje", "<<" + nombre_cliente + ">> " + "SE HA DESCONECTADO DEL CHAT");
            });
            client.on("conectar", function (nombre) {
                var existe = false;
                for (var i = 0; i < allClients.length; i++) {
                    if (allClients[i] == nombre) {
                        existe = true;
                    }
                }
                if (!existe) {
                    nombre_cliente = nombre;
                    allClients.push(nombre_cliente);
                    client.emit("usuario_valido", nombre_cliente);
                    io.sockets.emit("difundir_usuarios", allClients);
                    io.sockets.emit("difundir_mensaje", "<<" + nombre_cliente + ">> " + "SE HA CONECTADO AL CHAT");
                } else {
                    client.emit("pedir_nuevo_usuario");
                }
            });
            client.on("enviar_mensaje", function (mensaje) {
                io.sockets.emit("difundir_mensaje", "[" + nombre_cliente + "] " + mensaje);
            });
        }
);

console.log("Servicio Socket.io iniciado");
