const crypto = require('crypto');
const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const Users = require('../models/User');

function encryptPassword(password) {
    const md5 = crypto.createHash('md5');
    md5.update(password);
    return md5.digest('hex');
}

module.exports = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return h.view('home', { user: request.auth.credentials });
        },
    },
    {
        method: 'GET',
        path: '/login',
        handler: (request, h) => {
            if (request.auth.isAuthenticated) {
                // Si el usuario está autenticado, redireccionar a la página de inicio
                return h.redirect('/');
            } else {
                // Si el usuario no está autenticado, muestra la página de inicio de sesión
                return h.view('login', { user: request.auth.credentials });
            }
        },
        options: {
            auth: false, // No es necesario estar autenticado para ver esta página
        },  
    },
    {
        method: 'POST',
        path: '/login',
        handler: async (request, h) => {
            try {
                const { rut, password } = request.payload;

                // Buscar el usuario en la base de datos
                const user = await Users.findOne({ rut, password: encryptPassword(password) });
                if (!user) {
                    return h.response('Credenciales incorrectas').code(401);                    
                }
                request.cookieAuth.set({ user });
                return h.redirect('/');
            } catch (error) {
                // Manejo de errores
                console.error('Error en el inicio de sesión:', error);
                return h.view('login', { error: 'Ocurrió un error al iniciar sesión' });
            }
        },
        options: {
            validate: {
                payload: Joi.object({
                    rut: Joi.string().required(),
                    password: Joi.string().required(),
                }),
                failAction: (request, h, error) => {
                    // Redireccionar al formulario con los errores
                    return h
                        .view('login', {
                            error: error.details[0].message,
                            rut: request.payload.rut,
                        })
                        .takeover()
                        .code(400);
                }
            },
            auth: false,
        },
    },
    {
        method: 'GET',
        path: '/register-user',
        handler: async (request, h) => {
            return h.view('register-user', { user: request.auth.credentials });
        }
    },
    {
        method: 'GET',
        path: '/logout',
        handler: (request, h) => {
            // Terminar la sesión y redirigir al inicio de sesión
            request.cookieAuth.clear();
            return h.redirect('/login');
        }
    },
];
