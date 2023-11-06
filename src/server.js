const Hapi = require("@hapi/hapi");
const Vision = require("@hapi/vision");
const Inert = require("@hapi/inert");
const HapiAuthCookie = require("hapi-auth-cookie");
require("dotenv").config();
require("./database/database");

const Users = require("./models/User");

const server = new Hapi.Server({
  port: 3000,
  host: "localhost",
});

async function registerPlugins() {
  try {
    await server.register(Inert);
    await server.register(Vision);
    await server.register(HapiAuthCookie);
  } catch (err) {
    console.error("Error al registrar plugins:", err);
    process.exit(1);
  }
}

async function configureServer() {
  server.views({
    engines: {
      hbs: require("handlebars"),
    },
    relativeTo: __dirname,
    path: "views",
    layout: true,
    layoutPath: "views/layouts/",
    partialsPath: "views/partials/",
  });

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: "session",
      password: "tu_contraseña_segura_de_al_menos_32_caracteres",
      isSecure: true, // Cambia a true en producción, false para pruebas locales
      ttl: 24 * 60 * 60 * 1000,
      path: "/", // Ruta base para las cookies
      clearInvalid: false,
      isSameSite: "Lax",
    },
    redirectTo: "/login",
    validateFunc: async (request, session) => {
      if (session && session.user && session.user._id) {
        const user = await Users.findById(session.user._id);
        if (user) {
          return { valid: true, credentials: session.user };
        }
      }

      // La cookie de sesión no es válida
      return { valid: false };
    },
  });

  server.auth.default({
    strategy: "session",
  });

  server.route(require("./routes"));
}

async function startServer() {
  try {
    await server.start();
    console.log(`Servidor Hapi.js en funcionamiento en ${server.info.uri}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function init() {
  await registerPlugins();
  await configureServer();
  await startServer();
}

init();
