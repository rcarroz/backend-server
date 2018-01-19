// Se crea la conexion con express
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

// Este me permite utilizar las propiedades de usuario, asignandola a Usuario
var Usuario = require('../models/usuario');

// Libreria de Google para la Autentificación
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// Autentificación de Google
app.post('/google', (req, res) => {

    var token = req.body.token || 'XXX';

    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {

            if (e) {

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Token no válido',
                    errors: e
                });

            }

            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            Usuario.findOne({ email: payload.email }, (err, usuario) => {

                if (err) {

                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al buscar usuario - login',
                        errors: err
                    });

                }

                if (usuario) {
                    if (usuario.google === false) {
                        return res.status(400).json({
                            ok: true,
                            mensaje: 'Debe de usuar su autentificación normal'
                        });
                    } else {
                        usuarioDB.password = ':P'; // este es para que no vean el password
                        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

                        // Aqui devuelve un arreglo con los usuarios
                        res.status(200).json({
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id
                        });

                    }
                } else {
                    // Si el usuario no existe por correo
                    var usuario = new Usuario();

                    usuario.nombre = payload.name;
                    usuario.apellido = payload.family_name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {

                        if (err) {

                            return res.status(500).json({
                                ok: true,
                                mensaje: 'Error al crear usuario - google',
                                errors: err
                            });

                        }
                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                        // Aqui devuelve un arreglo con los usuarios
                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        });


                    });

                }
            });

        });

});

// Autentificación Normal
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios!',
                errors: err

            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas!- email',
                errors: err

            });

        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas!- password',
                errors: err

            });

        };

        // Crear un token!!!
        usuarioDB.password = ':P'; // este es para que no vean el password
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        // Aqui devuelve un arreglo con los usuarios
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });
});






// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;