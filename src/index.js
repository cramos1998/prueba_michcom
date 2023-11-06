const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Handlebars = require('handlebars');
require('dotenv').config();
require('./database/database');
const crypto = require('crypto');
const User = require('./models/User');


const init = async () => {
    const server = new Hapi.Server({
        port: 3000,
        host: 'localhost'
    });

    await server.register(Vision);

    server.views({
        engines: {
            hbs: Handlebars,
        },
        relativeTo: __dirname,
        path: 'views',
        layout: true,
        layoutPath: 'views/layouts',
    });

    //Funcion para encriptar contraseña
    function encryptPassword(password) {
        const md5 = crypto.createHash('md5');
        md5.update(password);
        return md5.digest('hex');
    }

    //Ruta para creacrion de usuario
    server.route({
        method: 'POST',
        path: '/create-user',
        handler: async (request, h) => {
            try {
                const { name, lastname, email, password, scope, rut, status } = request.payload;
                const newUser = new User({
                    name,
                    lastname,
                    email,
                    password: encryptPassword(password),
                    scope,
                    rut,
                    status
                });
                const userSaved = await newUser.save();
                return h.response(userSaved).code(200);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    })
    //Ruta de vista login
    server.route({
        method: 'GET',
        path: '/login',
        handler: (request, h) => {
            return h.view('login');
        }
    })
    // Ruta para obtener todos los usuarios sin mostrar las constraseñas
    server.route({
        method: 'GET',
        path: '/users',
        handler: async (request, h) => {
            try {
                const users = await User.find({}, { password: 0 });
                return h.response(users).code(200);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    })
    //Ruta para obtener un usuario por id
    server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: async (request, h) => {
            try {
             const users = await User.findById(request.params.id, { password: 0 });
             return h.response(users).code(200);
            } catch (error) {
             return h.response(error).code(500);   
            }
    }
})
    //Ruta para actualizar un usuario por id 
    server.route({
        method: 'PUT',
        path: '/users/{id}',
        handler: async (request, h) => {
            try {
                const userUpdated = await User.findByIdAndUpdate(request.params.id, request.payload, { new: true });
                return h.response(userUpdated).code(200);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    })

    //Ruta para eliminar un usuario por id
    server.route({
        method: 'DELETE',
        path: '/users/{id}',
        handler: async (request, h) => {
            try {
                const userDeleted = await User.findByIdAndDelete(request.params.id);
                return h.response(userDeleted).code(200);
            } catch (error) {
                return h.response(error).code(500);
            }
        }
    })

    await server.start()
    console.log(`Server running on port ${server.info.uri}`);
}

init();