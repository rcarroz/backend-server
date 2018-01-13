// Se crea la conexion con express
var express = require('express');

var app = express();


// Ruta  (app hace referencia a Express)
// abrevviando Ej: app._router('/', (req, res, next)) 
app.get('/', (request, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;