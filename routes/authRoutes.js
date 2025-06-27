const express = require("express");
const router = express.Router();


const USUARIO = "admin";
const CLAVE = "123456";


router.get("/login", (req, res) => {
  res.render("login");
});


router.post("/login", (req, res) => {
  const { usuario, contrasena } = req.body;

  if (usuario === USUARIO && contrasena === CLAVE) {
    req.session.usuario = usuario;
    return res.redirect("/formulario");
  }

  res.render("login", { error: "❌ Usuario o contraseña incorrectos" });
});


router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
