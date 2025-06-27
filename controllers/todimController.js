const fs = require("fs");
const path = require("path");

exports.evaluar = (req, res) => {
  const { proyecto, alternativas, criterios, tipos, pesos, calificaciones } = req.body;

  const numAlternativas = alternativas.length;
  const numCriterios = criterios.length;
  const pesosNumericos = pesos.map(p => parseFloat(p));

  const matriz = [];
  let k = 0;
  for (let i = 0; i < numAlternativas; i++) {
    matriz[i] = [];
    for (let j = 0; j < numCriterios; j++) {
      let valor = parseFloat(calificaciones[k]);
      if (tipos[j] === 'costo') {
        valor = 11 - valor;
      }
      matriz[i][j] = valor;
      k++;
    }
  }

  const resultados = alternativas.map((nombre, i) => {
    let total = 0;
    for (let j = 0; j < numCriterios; j++) {
      total += matriz[i][j] * (pesosNumericos[j] / 100);
    }
    return { nombre, total: parseFloat(total.toFixed(2)) };
  });

  resultados.sort((a, b) => b.total - a.total);

  // 🟢 Ajuste importante: guardar fecha real ISO
  const resultadoFinal = {
    proyecto: proyecto || "Sin nombre",
    fecha: new Date().toISOString(),
    resultados
  };

  const nombreArchivo = `evaluacion_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const rutaArchivo = path.join(__dirname, "..", "historial_evaluaciones", nombreArchivo);
  fs.writeFileSync(rutaArchivo, JSON.stringify(resultadoFinal, null, 2));

  res.render("result", {
    proyecto: resultadoFinal.proyecto,
    resultados
  });
};
