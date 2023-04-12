import { API_KEY, API_SECRET, CLOUD_NAME } from "../config.js";
import { equiposModel } from "../models/equipos.model.js";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

export class EquiposDataBase {
    constructor() {}

    getEquipos = async (limit) => {
        try {
            const data = await equiposModel.find()
            const equipos = data.map(equipos => equipos.toObject());
            return limit ? equipos.slice(0, limit) : equipos;
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener los equipos");
        }
    }

    getEquipoById = async (id) => {
        const equipos = await this.getEquipos();
        const equipo = equipos.find((equipo) => equipo._id == id);
        if (!equipo) {
            throw new Error('No se encontró el equipo seleccionado');
        }
        return equipo;
    }

    checkEquipoName = async (name) => {
        const equipos = await this.getEquipos();
        const nameEquipo = equipos.some(equipo => equipo.name === name);
        return nameEquipo;
    }

    validateEquiposData(name) {
        if (!name) {
            throw new Error("El nombre del equipo es requerido");
        }
    }

    addEquipo = async (
        name, 
        partidosJugados, 
        ganados, 
        empates, 
        perdidos, 
        goles_a_Favor, 
        goles_en_Contra, 
        diferencia_de_Goles, 
        puntos, last5, 
        logo, 
        puntaje_anterior, 
        foto_equipo, 
        banco_fondo, 
        tarjetasAmarillas, 
        tarjetasRojas, 
        director_tecnico, 
        delegado, 
        fecha, 
        arbitro, 
        estadio, 
        gol_partido, 
        jugadores
        ) => {
        this.validateEquiposData(name);
        const equipos = await this.getEquipos();
        const nameEquipo = await this.checkEquipoName(name)
        if (nameEquipo) {
            throw new Error(`El equipo "${name}" ya existe`);
        }
        
        let newLogoUrl;
        if (logo) {
        const result = await cloudinary.uploader.upload(logo);
        newLogoUrl = result.secure_url;
        } else {
        newLogoUrl = '';
        }

        const newEquipo = {
            name: name.trim(),
            partidosJugados: 0,
            ganados: 0, 
            empates: 0, 
            perdidos: 0, 
            goles_a_Favor: 0, 
            goles_en_Contra: 0,
            diferencia_de_Goles: 0,
            puntos: 0,
            last5: ["neutral","neutral","neutral","neutral","neutral"],
            logo: newLogoUrl,
            puntaje_anterior: 0,
            foto_equipo: "",
            banco_fondo: 500000,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            director_tecnico: [],
            delegado:{},
            fecha: ["No definido",
                    "No definido", 
                    "No definido",
                    "No definido",
                    "No definido",
                    "No definido",
                    "No definido",
                    "No definido",
                    "No definido",
                    "No definido",
                    "No definido",
                    "No definido",
                    "No definido"
                ],
            arbitro:'',
            estadio:'',
            gol_partido: [0,0,0,0,0,0,0,0,0,0,0,0,0],
            jugadores:[]
        }

        equipos?.push(newEquipo)
        await equiposModel.create(newEquipo)

        return newEquipo;
    }
}