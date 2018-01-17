// Se crea o se importa la libreria para la conexion con express
var express = require('express');

// se importa la libreria externa
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// Importar los modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

// Ruta  (app hace referencia a Express)
// abrevviando Ej: app._router('/', (req, res, next)) 
app.put('/:tipo/:id', (request, response, next) => {

    var tipo = request.params.tipo;
    var id = request.params.id;

    // Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return response.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válido',
            errors: { message: 'Tipo de colección no es válido' }

        });

    }

    if (!request.files) {
        return response.status(500).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen!' }

        });
    }

    // Obtener nombre del archivo
    var archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones Validas aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return response.status(400).json({
            ok: false,
            mensaje: 'Extension del archivo, no es válido',
            errors: { message: 'Las extensiones váalidas son: ' + extensionesValidas.join(', ') }

        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err

            });
        }

        // Llamada al metodo
        subirPoTipo(tipo, id, nombreArchivo, response);

        // response.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido exitosamente!',
        //     extensionArchivo: extensionArchivo
        // });

    })
});

// Metodo o funcion para subir las imagenes
function subirPoTipo(tipo, id, nombreArchivo, response) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {

                return response.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe!',
                    errors: { message: 'Usuario no existe' }
                });

            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada!',
                    usuario: usuarioActualizado
                });

            })
        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {

                return response.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe!',
                    errors: { message: 'Medico no existe' }
                });

            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del médico actualizada!',
                    medico: medicoActualizado
                });

            })
        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {

                return response.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe!',
                    errors: { message: 'Hospital no existe' }
                });

            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada!',
                    hospital: hospitalActualizado
                });

            })
        });

    }

}


// Aqui se exporta el app o la ruta fuera de este archivo
module.exports = app;