// Se crea la conexion con express
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Este me permite utilizar las propiedades de usuario, asignandola a Usuario (Modelo)
var Usuario = require('../models/usuario');


// Obtener todos los usuarios
// abrevviando Ej: app._router('/', (req, res, next)) 
app.get('/', (request, response, next) => {

    // se asigna una variable desde req.query.desde ó 0
    var desde = request.query.desde || 0;
    desde = Number(desde); // convierte a numero la variable desde

    // Este ejecuta una busqueda
    Usuario.find({}, 'nombre apellido email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario!',
                        errors: err

                    });
                }

                // Aqui se genera un query para contar cuantos registro ha en la tabla
                Usuario.count({}, (err, conteo) => {

                    // Aqui devuelve un arreglo con los usuarios
                    response.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });
            });


});

// token


// ------------------------------------------------
// Actualizar usuario
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    // Busca un Id
    Usuario.findById(id, (err, usuario) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario!',
                errors: err

            });
        }

        // Valida si usuario No Existe!
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el Id: ' + id + ' no existe!',
                errors: { message: 'No existe un usuario con ese Id!' }

            });
        }

        usuario.nombre = body.nombre;
        usuario.apellido = body.apellido;
        usuario.email = body.email;
        usuario.role = body.role;

        // Actualiza informacion
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario!',
                    errors: err

                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});


// Crear un nuevo usuario
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = Usuario({
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario!',
                errors: err

            });
        }
        // Aqui devuelve un arreglo con los usuarios
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });

    });
});

//----------------------------
// Eliminar usuario por el Id

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar usuario!',
                errors: err

            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese Id!',
                errors: { message: 'No existe un usuario con ese Id' }

            });
        }

        // Aqui devuelve un arreglo con los usuarios
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;