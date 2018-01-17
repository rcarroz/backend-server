// Se crea la conexion con express
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Este me permite utilizar las propiedades de hospital, asignandola a Usuario
var Hospital = require('../models/hospital');


// Obtener todos los hospitales
// abrevviando Ej: app._router('/', (req, res, next)) 
app.get('/', (request, response, next) => {

    // se asigna una variable desde req.query.desde ó 0
    var desde = request.query.desde || 0;
    desde = Number(desde); // convierte a numero la variable desde

    // Este ejecuta una busqueda o SQL de la tabla hospital
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital!',
                        errors: err

                    });
                }

                Hospital.count({}, (err, conteo) => {
                    // Aqui devuelve un arreglo con los hospitales
                    response.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });


});

// token


// ------------------------------------------------
// Actualizar hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    // Busca un Id
    Hospital.findById(id, (err, hospital) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital!',
                errors: err

            });
        }

        // Valida si hospital No Existe!
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el Id: ' + id + ' no existe!',
                errors: { message: 'No existe un hospital con ese Id!' }

            });
        }
        // Asignacion de los datos a la tabla
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        // Actualiza informacion
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital!',
                    errors: err

                });
            }


            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});


// Crear un nuevo hospital
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital!',
                errors: err

            });
        }
        // Aqui devuelve un arreglo con los hospitales
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });
});

//----------------------------
// Eliminar hospital por el Id

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital!',
                errors: err

            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese Id!',
                errors: { message: 'No existe un hospital con ese Id' }

            });
        }

        // Aqui devuelve un arreglo con los hospitales
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;