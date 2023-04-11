import mongoose from "mongoose";
import { MONGODB } from "../config.js";

export const connectToDatabase = async () => {
    console.log(`⚛️ Conectando a la base de datos...`);
    try {
        await mongoose.connect(MONGODB);
        console.log(`✅ Conectado a la base de datos: ${MONGODB}`);
    } catch (err) {
        console.error(`❌ Error al conectar a la base de datos: ${MONGODB}`, err);
    }
};