const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

require("pdfkit-table");

const todimController = require("../controllers/todimController");
const authController = require("../controllers/authController");


router.get("/logout", authController.logout);

// Rutas de login
router.get("/login", authController.formLogin);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Página principal protegida
router.get("/", authController.verificarAutenticacion, (req, res) => {
  res.render("index");
});

// Formulario protegido
router.get("/formulario", authController.verificarAutenticacion, (req, res) => {
  res.render("form");
});

// Historial protegido
router.get("/historial", authController.verificarAutenticacion, (req, res) => {
  const ruta = path.join(__dirname, "..", "historial_evaluaciones");

  let archivos = [];
  try {
    archivos = fs.readdirSync(ruta);
  } catch (error) {
    console.error("Error al leer la carpeta de historial:", error);
    return res.render("historial", { historial: [] });
  }

  const historial = archivos.map(nombre => {
    try {
      const contenido = fs.readFileSync(path.join(ruta, nombre), "utf8");
      const datos = JSON.parse(contenido);

      const proyecto = datos.proyecto || "Sin nombre";
      const mejorAlternativa = datos.resultados?.[0]?.nombre || "No evaluado";
      const puntaje = datos.resultados?.[0]?.total ?? "Sin datos";

      let fecha = "Fecha desconocida";
      if (datos.fecha) {
        const fechaObj = new Date(datos.fecha);
        if (!isNaN(fechaObj.getTime())) {
          fecha = fechaObj.toLocaleString("es-EC", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
          });
        }
      }

      return {
        nombreArchivo: nombre,
        proyecto,
        fecha,
        mejorAlternativa,
        puntaje
      };
    } catch (err) {
      console.warn("Archivo dañado u omitido:", nombre);
      return null;
    }
  }).filter(item => item !== null);

  res.render("historial", { historial });
});

// Evaluación protegida
router.post("/evaluar", authController.verificarAutenticacion, todimController.evaluar);

// Descarga PDF protegida
router.get("/descargar/:nombreArchivo", authController.verificarAutenticacion, (req, res) => {
  const archivo = req.params.nombreArchivo;
  const ruta = path.join(__dirname, "..", "historial_evaluaciones", archivo);

  try {
    const contenido = fs.readFileSync(ruta, "utf8");
    const datos = JSON.parse(contenido);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${archivo.replace(".json", ".pdf")}"`);
    doc.pipe(res);

    doc.font("Times-Bold").fontSize(18).text("Informe de Evaluación TODIM", { align: "center" });
    doc.moveDown();
    doc.font("Times-Roman").fontSize(12);
    doc.text(`Proyecto: ${datos.proyecto || "Sin nombre"}`);

    let fecha = datos.fecha
      ? new Date(datos.fecha).toLocaleString("es-EC", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      : "Fecha no disponible";

    doc.text(`Fecha: ${fecha}`);
    doc.text(`Mejor alternativa: ${datos.resultados?.[0]?.nombre || "No evaluado"}`);
    doc.text(`Puntaje: ${
      datos.resultados?.[0]?.total !== undefined && !isNaN(datos.resultados[0].total)
        ? Number(datos.resultados[0].total).toFixed(2)
        : "Sin datos"
    }`);
    doc.moveDown();

    if (Array.isArray(datos.resultados) && datos.resultados.length > 0) {
      const filas = datos.resultados
        .filter(r => r && typeof r === "object" && r.nombre)
        .map((item, i) => [
          i + 1,
          item.nombre,
          typeof item.total === "number" ? item.total.toFixed(2) : "Sin datos"
        ]);

      if (filas.length > 0) {
        doc.font("Times-Bold").text("Ranking completo:", { underline: true });
        doc.moveDown(0.5);
        doc.table(
          {
            headers: ["#", "Alternativa", "Puntaje"],
            rows: filas,
          },
          {
            prepareHeader: () => doc.font("Times-Bold").fillColor("black"),
            prepareRow: (row, i) => doc.font("Times-Roman").fillColor("black"),
            columnsSize: [40, 300, 100],
          }
        );
      } else {
        doc.font("Times-Italic").text("⚠️ No hay filas válidas para el ranking.");
      }
    } else {
      doc.font("Times-Italic").text("⚠️ No se encontró información del ranking.");
    }

    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).send("Error al generar el PDF");
  }
});

module.exports = router;
