// controllers/pelicula.js
const mongoose = require("mongoose");
const Pelicula = require("./../model/Pelicula");

/**
 * Obtener todas las películas
 */
async function getAll(req, res) {
  try {
    // Consulta optimizada: lean() y orden por fecha de creación
    const peliculas = await Pelicula.find({}).sort({ createdAt: -1 }).lean(); // evita overhead de Mongoose Documents

    return res.status(200).json(peliculas);
  } catch (err) {
    console.error("controllers.pelicula.getAll:", err);
    return res.status(500).json({
      message: "Error al obtener películas",
      error: err.message,
    });
  }
}

/**
 * Obtener película por id
 */
async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const pelicula = await Pelicula.findById(id);
    if (!pelicula)
      return res.status(404).json({ message: "Película no encontrada" });
    return res.json(pelicula);
  } catch (err) {
    console.error(`controllers.pelicula.getById (${id}):`, err);
    return res.status(500).json({ message: "Error al obtener la película" });
  }
}

/**
 * Crear nueva película
 */
async function create(req, res) {
  try {
    const { titulo, anio, duracion, generos, director, sinopsis } = req.body;

    // Validación mínima
    if (!titulo || !anio || !duracion || !generos || !director || !sinopsis) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const pelicula = new Pelicula({
      titulo: String(titulo).trim(),
      anio: Number(anio),
      duracion: Number(duracion),
      generos: Array.isArray(generos)
        ? generos
        : String(generos)
            .split(",")
            .map((g) => g.trim()),
      director: String(director).trim(),
      sinopsis: String(sinopsis).trim(),
    });

    const saved = await pelicula.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("controllers.pelicula.create:", err);
    return res.status(500).json({ message: "Error al crear la película" });
  }
}

/**
 * Actualizar película (envía sólo campos a modificar)
 */
async function update(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const updates = { ...req.body };

    // No permitir actualizar _id
    if (updates._id) delete updates._id;

    if (updates.generos && !Array.isArray(updates.generos)) {
      updates.generos = String(updates.generos)
        .split(",")
        .map((g) => g.trim());
    }

    const updated = await Pelicula.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Película no encontrada" });
    return res.json(updated);
  } catch (err) {
    console.error(`controllers.pelicula.update (${id}):`, err);
    return res.status(500).json({ message: "Error al actualizar la película" });
  }
}

/**
 * Eliminar película
 */
async function remove(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const deleted = await Pelicula.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Película no encontrada" });
    return res.json({
      message: "Película eliminada correctamente",
      id: deleted._id,
    });
  } catch (err) {
    console.error(`controllers.pelicula.remove (${id}):`, err);
    return res.status(500).json({ message: "Error al eliminar la película" });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
