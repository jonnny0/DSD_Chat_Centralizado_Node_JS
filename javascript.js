var serviceURL = document.URL;
var socket = io.connect(serviceURL);

function conectar(formulario) {
    nombre = formulario.nombre.value;
    socket.emit("conectar", nombre);
}

function enviar_mensaje(formulario) {
    socket.emit("enviar_mensaje", formulario.mensaje.value);
    formulario.mensaje.value = "";
    formulario.mensaje.focus();
}

function activar_chat(nombre_cliente) {
    document.getElementById("title").innerHTML = "USUARIO: " + nombre_cliente;
    document.getElementById("nombre_usuario").hidden = true;
    document.getElementById("chat").hidden = false;
    document.getElementById("mensaje").focus();
}

socket.on("usuario_valido", function (nombre_cliente) {
    activar_chat(nombre_cliente);
});

socket.on("pedir_nuevo_usuario", function () {
    document.getElementById("usuario_ocupado").hidden = false;
    document.getElementById("nombre").value = "";
});

socket.on("difundir_usuarios", function (clientes) {
    var lista_clientes = "";
    for (var i = 0; i < clientes.length; i++) {
        lista_clientes += clientes[i] + "<br>";
    }
    document.getElementById("clientes_conectados").innerHTML = lista_clientes;
});

socket.on("difundir_mensaje", function (mensaje) {
    document.getElementById("lista_mensajes").innerHTML += mensaje + "\n";
    document.getElementById("lista_mensajes").scrollTop = document.getElementById("lista_mensajes").scrollHeight;
});
