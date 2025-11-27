// model/Pelicula.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const peliculaSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    anio: {
      type: Number,
      required: true,
    },
    duracion: {
      type: Number,
      required: true, // minutos
    },
    generos: {
      type: [String],
      required: true,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    sinopsis: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

// Nombre explícito de la colección: 'peliculas'
module.exports =
  mongoose.models.Pelicula ||
  mongoose.model("Pelicula", peliculaSchema, "peliculas");
