const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser'); // 🍪 Para leer cookies

const app = express();

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // ⬅️ Importante para leer el token JWT

// Rutas
const mainRoutes = require('./routes/mainRoutes');
app.use('/', mainRoutes);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
