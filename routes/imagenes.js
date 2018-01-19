// Se crea la conexion con express
var express = require('express');
var fs = require('fs'); // fs = file system 

var app = express();


// Ruta  (app hace referencia a Express)
// abrevviando Ej: app._router('/', (req, res, next)) 
app.get('/:tipo/:img', (request, response, next) => {

    var tipo = request.params.tipo;
    var img = request.params.img;

    var path = `./uploads/${ tipo }/${ img }`;

    fs.exists(path, existe => {

        if (!existe) {
            path = './assets/no-img.jpg';
        }

        response.sendfile(path);
    });

});

// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;