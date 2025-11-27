// db/conn.js
require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const url = process.env.MONGODB_URL;
    if (!url) {
      console.error(
        "❌ ERROR: MONGODB_URL no está definido en el archivo .env"
      );
      process.exit(1);
    }

    await mongoose.connect(url, {
      // Mongoose 6+ ignora useNewUrlParser/useUnifiedTopology, pero maxPoolSize es útil:
      maxPoolSize: 10,
    });

    console.log("✅ MongoDB conectado correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
