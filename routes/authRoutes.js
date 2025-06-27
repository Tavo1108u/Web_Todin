const express = require("express");
const router = express.Router();

// Usuario demo
const USUARIO = "admin";
const CLAVE = "123456";

// GET login
router.get("/login", (req, res) => {
  res.render("login");
});

// POST login
router.post("/login", (req, res) => {
  const { usuario, contrasena } = req.body;

  if (usuario === USUARIO && contrasena === CLAVE) {
    req.session.usuario = usuario;
    return res.redirect("/formulario");
  }

  res.render("login", { error: "❌ Usuario o contraseña incorrectos" });
});

// GET logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
