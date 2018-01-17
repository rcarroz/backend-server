// Se crea la conexion con express
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Este me permite utilizar las propiedades de Medico, asignandola a Usuario
var Medico = require('../models/medico');


// Obtener todos los medicos
// abrevviando Ej: app._router('/', (req, res, next)) 
app.get('/', (request, response, next) => {

    // se asigna una variable desde req.query.desde ó 0
    var desde = request.query.desde || 0;
    desde = Number(desde); // convierte a numero la variable desde

    // Este ejecuta una busqueda o SQL de la tabla medico
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico!',
                        errors: err

                    });
                }

                Medico.count({}, (err, conteo) => {

                    // Aqui devuelve un arreglo con los medicos
                    response.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
            });


});

// token


// ------------------------------------------------
// Actualizar medico
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    // Busca un Id
    Medico.findById(id, (err, medico) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico!',
                errors: err

            });
        }

        // Valida si medico No Existe!
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el Id: ' + id + ' no existe!',
                errors: { message: 'No existe un medico con ese Id!' }

            });
        }
        // Asignacion de los datos a la tabla
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        // Actualiza informacion
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico!',
                    errors: err

                });
            }


            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});


// Crear un nuevo medico
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico!',
                errors: err

            });
        }
        // Aqui devuelve un arreglo con los medicos
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });
});

//----------------------------
// Eliminar medico por el Id

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico!',
                errors: err

            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese Id!',
                errors: { message: 'No existe un medico con ese Id' }

            });
        }

        // Aqui devuelve un arreglo con los medicos
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;