import express from "express";
import { EquiposDataBase } from "../controllers/equipos.js";
import { uploader } from '../utils.js';

const router = express.Router();
const equiposDatabase = new EquiposDataBase()

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit;
        const equipos = await equiposDatabase.getEquipos(limit)
        res.status(200).send({ equipos });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

router.get("/:pid", async (req, res) => {
    const pid = req.params.pid;
    try {
        const equipo = await equiposDatabase.getEquipoById(pid);
        return res.status(200).send({ equipo });
    } catch (error) {
        return res.status(404).send({ error: error.message });
    }
});

router.post("/", uploader.single("logo"), async (req, res) => {
    try {
        const { 
            name,
            partidosJugados,
            ganados, 
            empates, 
            perdidos, 
            goles_a_Favor, 
            goles_en_Contra,
            diferencia_de_Goles,
            puntos,
            last5,
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
            estado,
            correo,
            jugadores
        } = req.body;
        
        const newEquipo = await equiposDatabase.addEquipo(
            name,
            partidosJugados,
            ganados, 
            empates, 
            perdidos, 
            goles_a_Favor, 
            goles_en_Contra,
            diferencia_de_Goles,
            puntos,
            last5,
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
            estado,
            correo,
            jugadores
        );

        return res.status(201).send({ status: 'Succes', message: 'Se creó el equipo correctamente', equipo: newEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message : err.message });
    }
});

router.put("/:id", uploader.single("logo"), async (req, res) => {
    const equipoID = req.params.id;
    const changes = req.body;

    try {
        const updatedEquipo = await equiposDatabase.editarEquipo(equipoID, {...changes });

        return res.status(200).send({ status: "OK", message: `El equipo se edito correctamente`, updatedEquipo });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
})

export default router;