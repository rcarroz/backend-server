// Se crea la conexion con express
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Este me permite utilizar las propiedades de usuario, asignandola a Usuario
var Usuario = require('../models/usuario');


// Obtener todos los usuarios
// abrevviando Ej: app._router('/', (req, res, next)) 
app.get('/', (request, response, next) => {

    // Este ejecuta una busqueda
    Usuario.find({}, 'nombre apellido email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario!',
                        errors: err

                    });
                }
                // Aqui devuelve un arreglo con los usuarios
                response.status(200).json({
                    ok: true,
                    usuarios: usuarios
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
                usuario: usuarioGuardado,
                usuariotoken: req.usuario
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
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
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
            usuario: usuarioBorrado,
            usuariotoken: req.usuario
        });

    });

});

// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;