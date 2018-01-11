// Librerias Requeridas
var express = require('express');
var mongoose = require('mongoose');

// Inicializar EXPRESS variables
var app = express();

// Conexion a la base de datos MongoDB
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
})

// Ruta  (app hace referencia a Express)
// abrevviando Ej: app._router('/', (req, res, next)) 
app.get('/', (request, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});