/**
 * =========================================================================
 * SERVIDOR BACKEND - DISCOGRAFÍA BTS (Node.js + Express + MySQL)
 * =========================================================================
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

// Permite peticiones desde cualquier puerto local de Live Server
app.use(cors());
app.use(express.json());

// Pool de conexiones a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ruta de verificación de estado del servidor
app.get("/", (req, res) => {
  res.send("API de Discografía BTS funcionando correctamente.");
});

// Endpoint principal: obtiene álbumes unidos con su era conceptual mediante INNER JOIN
app.get("/api/albumes", async (req, res) => {
  try {
    const consultaSQL = `
      SELECT
        a.album_id,
        a.titulo,
        a.anio_lanzamiento,
        a.cancion_principal,
        a.tipo_lanzamiento,
        a.precio_clp,
        a.descripcion,
        a.color_acento,
        e.nombre_era AS era,
        e.descripcion_era
      FROM albumes AS a
      INNER JOIN eras_conceptuales AS e
        ON a.era_id = e.era_id
      ORDER BY a.anio_lanzamiento ASC, a.album_id ASC;
    `;

    const [filas] = await pool.query(consultaSQL);
    res.json(filas);
  } catch (error) {
    console.error("Error al consultar álbumes en MySQL:", error.message);
    res.status(500).json({
      mensaje: "Error interno al obtener los álbumes desde la base de datos."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor BTS escuchando en http://localhost:${PORT}`);
});