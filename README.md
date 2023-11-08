Configuraciones antes de iniciar el proyecto.

1. Para la conexion a la base de datos yo estoy ocupando MongoDBCompass, si ocupas Mongo atlas deberas remplazar toda la ruta del archivo database por tu ruta de atlas, o una base local que tengas
2. Dentro del Archivo .env deben ir las siguientes variables:
   NAMESECRET = Esta corresponde a la contraseña del server de cookies de Hapi, esta contraseña debe tener 32 caracteres como minimo y puede ser caracteres ramdon
   DB_USERNAME = Esta variable hace referencia a nombre de usuario de la base de datos
   DB_PASSWORD = Esta variable hace referencia a la contraseña del usuario de la base de datos
   DB_DATABASE = Esta variable hace referencia a el nombre de la base de datos
3. Si configuras un localhost con un puerto distinto deberas cambiar la configuracion del server.js en el puerto y el archivo users.hbs ya que contienen la ruta con el puerto 3000
