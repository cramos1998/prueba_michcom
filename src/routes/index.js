const crypto = require("crypto");
const Joi = require("@hapi/joi");
const Users = require("../models/User");

function encryptPassword(password) {
  const md5 = crypto.createHash("md5");
  md5.update(password);
  return md5.digest("hex");
}

module.exports = [
  {
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return h.view("home", { user: request.auth.credentials });
    },
  },
  {
    method: "GET",
    path: "/users",
    handler: (request, h) => {
        return h.view("users", { user: request.auth.credentials });
    }
  },
  {
    method: "GET",
    path: "/success",
    handler: (request, h) => {
      return h.view("success", { user: request.auth.credentials });
    },
  },
  {
    method: "GET",
    path: "/login",
    handler: (request, h) => {
      if (request.auth.isAuthenticated) {
        // Si el usuario está autenticado, redireccionar a la página de inicio
        return h.redirect("/");
      } else {
        // Si el usuario no está autenticado, muestra la página de inicio de sesión
        return h.view("login", { user: request.auth.credentials });
      }
    },
    options: {
      auth: false, // No es necesario estar autenticado para ver esta página
    },
  },
  {
    method: "POST",
    path: "/login",
    handler: async (request, h) => {
      try {
        const { rut, password } = request.payload;

        // Buscar el usuario en la base de datos
        const user = await Users.findOne({
          rut,
          password: encryptPassword(password),
        });
        if (!user) {
          return h.view("login", { error: "Credenciales incorrectas" });
        }
        request.cookieAuth.set({ user });
        return h.redirect("/");
      } catch (error) {
        // Manejo de errores
        console.error("Error en el inicio de sesión:", error);
        return h.view("login", { error: "Ocurrió un error al iniciar sesión" });
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
            .view("login", {
              error: error.details[0].message,
              rut: request.payload.rut,
            })
            .takeover()
            .code(400);
        },
      },
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/register-user",
    handler: async (request, h) => {
      return h.view("register-user", { user: request.auth.credentials });
    },
  },
  {
    method: "POST",
    path: "/create-user",
    handler: async (request, h) => {
      try {
        const { name, lastname, email, password, rut, scope, status } =
          request.payload;
        // Crear un nuevo usuario con los datos proporcionados
        const newUser = new Users({
          name,
          lastname,
          email,
          password: encryptPassword(password), // Encripta la contraseña
          scope: "admin",
          rut,
          status: "enabled",
        });
        // verificar si el rut ya existe en la base de dato
        const rutExist = await Users.findOne({ rut });
        if (rutExist) {
            return h.view("success", {
                error: "El rut ya se encuentra registrado",
            });
            }
        const userSaved = await newUser.save();
        return h.view("success", { success: "Usuario creado correctamente" });
      } catch (error) {
        // En caso de error, responder con un código de error 500
        return h.response({ error: "Error interno" }).code(500);
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().required(),
          lastname: Joi.string().required(),
          email: Joi.string().required(),
          password: Joi.string().required(),
          rut: Joi.string().required(),
        }),
        failAction: (request, h, error) => {
          // En caso de fallo en la validación, responder con un código de error 400
          return h
            .view("success", {
              error: error.details[0].message,
              name: request.payload.name,
              lastname: request.payload.lastname,
              email: request.payload.email,
              rut: request.payload.rut,
            })
            .takeover()
            .code(400);
        },
      },
    },
  },
  {
    method: "GET",
    path: "/get-users",
    handler: async (request, h) => {
        try{
            const users = await Users.find({}, { _id: 0, __v: 0, password: 0 });
            return h.response(users); 
        } catch (error) {
            return h.response({ error: "Error interno" }).code(500);
        }
    },
  },
  {
    method: "GET",
    path: "/logout",
    handler: (request, h) => {
      // Terminar la sesión y redirigir al inicio de sesión
      request.cookieAuth.clear();
      return h.redirect("/login");
    },
  },
];
