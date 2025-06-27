const jwt = require("jsonwebtoken");
const secret = "clave_secreta_jwt";

// Mostrar formulario de login
exports.formLogin = (req, res) => {
  res.render("login", { error: null }); // <- evita cuadro rojo al cargar
};

// Procesar login
exports.login = (req, res) => {
  const { usuario, contrasena } = req.body;

  const userDemo = {
    usuario: "admin",
    contrasena: "123456",
    nombre: "Administrador"
  };

  if (usuario === userDemo.usuario && contrasena === userDemo.contrasena) {
    const token = jwt.sign({ nombre: userDemo.nombre }, secret, { expiresIn: "2h" });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/");
  } else {
    res.render("login", { error: "Credenciales incorrectas" });
  }
};

// Cerrar sesión
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};

// Middleware para proteger rutas
exports.verificarAutenticacion = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.redirect("/login");

  try {
    jwt.verify(token, secret);
    next();
  } catch (err) {
    res.redirect("/login");
  }
};
