// Se crea la conexion con express
var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Busqueda por coleccion

app.get('/coleccion/:tabla/:busqueda', (request, response) => {

    var busqueda = request.params.busqueda;
    var tabla = request.params.tabla;
    var regularExpresion = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regularExpresion)
            break

        case 'medicos':
            promesa = buscarMedicos(busqueda, regularExpresion)
            break

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regularExpresion)
            break

        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                error: { mensaje: 'Tipo de tabla/coleccion no válido' }
            });
    }
    promesa.then(data => {

        response.status(200).json({
            ok: true,
            [tabla]: data
        });

    });
});



// Busqueda General
// abrevviando Ej: app._router('/', (req, res, next)) 
app.get('/todo/:busqueda', (request, response, next) => {

    var busqueda = request.params.busqueda;
    var regularExpresion = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regularExpresion),
            buscarMedicos(busqueda, regularExpresion),
            buscarUsuarios(busqueda, regularExpresion)
        ])
        .then(respuesta => {

            response.status(200).json({
                ok: true,
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2]
            });
        });
});

// Promesa o Funcion ( Hospitales )
function buscarHospitales(busqueda, regularExpresion) {
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regularExpresion })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales)
                }
            });
    });
}

// Promesa o Funcion ( Medicos )
function buscarMedicos(busqueda, regularExpresion) {
    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regularExpresion })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos)
                }
            });
    });
}

// Promesa o Funcion ( Usuarios )
function buscarUsuarios(busqueda, regularExpresion) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regularExpresion },
                { 'email': regularExpresion }
            ])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios)
                }
            });
    });
}

// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;