import { model, Schema } from "mongoose";

const userCollection = "user";

const userSchema = new Schema(
    {
        nombre: { type: String },
        apellido: { type: String },
        email: { type: String, unique: true, match: /^\S+@\S+\.\S+$/ },
        fecha_de_nacimiento: { type: String },
        edad: { type: Number },
        role: { type: String },
        password: { type: String },
        equipo: { type: String },
        categoria: { type: String },
        subCategoria: { type: String },
        foto: { type: String },
        tipo: { type: String },
        last_connection: { type: Date },
    },
    { timestamps: true }
);

export const userModel = model(userCollection, userSchema);
