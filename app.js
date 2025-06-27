const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser'); 

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); 


const mainRoutes = require('./routes/mainRoutes');
app.use('/', mainRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
