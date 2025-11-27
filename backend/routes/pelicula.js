// routes/pelicula.js
const express = require("express");
const router = express.Router();
const peliculaController = require("./../controller/pelicula");

// GET / -> Listar todas las películas
router.get("/", peliculaController.getAll);

// GET /:id -> Obtener película por id
router.get("/:id", peliculaController.getById);

// POST / -> Crear nueva película
router.post("/", peliculaController.create);

// PUT /:id -> Actualizar película
router.put("/:id", peliculaController.update);

// DELETE /:id -> Eliminar película
router.delete("/:id", peliculaController.remove);

module.exports = router;
