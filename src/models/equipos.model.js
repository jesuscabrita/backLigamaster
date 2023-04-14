import { model, Schema } from "mongoose";

const equiposCollection = "equipos";

const jugadorSchema = new Schema(
    {
        name: { type: String },
        edad: { type: Number },
        posicion: { type: String },
        fecha_nacimiento: { type: String },
        goles: { type: Number },
        asistencias: { type: Number },
        tarjetas_amarillas: { type: Number },
        tarjetas_roja: { type: Number },
        lesion: { type: String },
        nacionalidad: { type: String },
        dorsal: { type: Number },
        partidos: { type: Number },
        gol_partido: { type: [Number] },
        amarilla_partido: { type: [Number] },
        roja_partido: { type: [Number] },
        azul_partido: { type: [Number] },
        jugador_figura: { type: [Number] },
        figura: { type: Number },
        suspendido: { type: Number },
        instagram: { type: String },
        twitter: { type: String },
        equipo: { type: String },
        logo: { type: String },
        foto: { type: String }
    },
    { timestamps: true }
);

const directorTecnicoSchema = new Schema(
    {
        name: { type: String },
        edad: { type: Number },
        fecha_nacimiento: { type: String },
        foto: { type: String },
        tarjetas_amarillas: { type: Number },
        tarjetas_rojas: { type: Number },
        amarilla_partido: { type: [Number] },
        roja_partido: { type: [Number] },
        instagram: { type: String },
        twitter: { type: String },
        partidos: { type: Number },
        suspendido: { type: Number },
        telefono: { type: String },
        logo: { type: String },
        equipo: { type: String }
    },
    { timestamps: true }
);

const delegadoSchema = new Schema(
    {
        name: { type: String },
        telefono: { type: String }
    },
    { timestamps: true }
);

const equiposSchema = new Schema(
    {
        name: { type: String },
        partidosJugados: { type: Number },
        ganados: { type: Number },
        empates: { type: Number },
        perdidos: { type: Number },
        goles_a_Favor: { type: Number },
        goles_en_Contra: { type: Number },
        diferencia_de_Goles: { type: Number },
        puntos: { type: Number },
        last5: { type: [String] },
        logo: { type: String },
        puntaje_anterior: { type: Number },
        foto_equipo: { type: String },
        banco_fondo: { type: Number },
        tarjetasAmarillas: { type: Number },
        tarjetasRojas: { type: Number },
        director_tecnico: [directorTecnicoSchema],
        delegado: delegadoSchema,
        fecha: { type: [String] },
        arbitro: { type: String },
        estadio: { type: String },
        gol_partido: [Number],
        estado: { type: String },
        jugadores: [jugadorSchema]
    },
    { timestamps: true }
);

export const equiposModel = model(equiposCollection, equiposSchema);