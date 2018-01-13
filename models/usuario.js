// Librerias Requeridas
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

// Crear un esquema o tabla de trabajo
var Schema = mongoose.Schema;

// Crear valores validos para este campo
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

// Definir el esquema o tabla de trabajo del Usuario
var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    apellido: { type: String, required: [true, 'El apellido es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' })

// Exportar el esquema o tabla de Usuario.
module.exports = mongoose.model('Usuario', usuarioSchema);