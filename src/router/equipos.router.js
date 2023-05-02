import express from "express";
import { EquiposDataBase } from "../controllers/equipos.js";
import { uploader } from '../utils.js';

const router = express.Router();
const equiposDatabase = new EquiposDataBase();

// Rutas del los equipos

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
            categoria,
            instagram,
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
            categoria,
            instagram,
            jugadores
        );

        return res.status(201).send({ status: 'Succes', message: 'Se creó el equipo correctamente', equipo: newEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
});

router.put("/:id", uploader.single("logo"), async (req, res) => {
    const equipoID = req.params.id;
    const changes = req.body;

    try {
        const updatedEquipo = await equiposDatabase.editarEquipo(equipoID, { ...changes });

        return res.status(200).send({ status: "OK", message: `El equipo se edito correctamente`, updatedEquipo });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
})

router.delete("/:id", async (req, res) => {
    const equipoID = req.params.id;

    try {
        const message = await equiposDatabase.eliminarEquipo(equipoID);
        return res.status(200).send({ status: "Success", message });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
});

// Rutas del los jugadores

router.post("/:equipoId/jugador", uploader.single("foto"), async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const jugador = req.body;
        const equipo = await equiposDatabase.addJugadorToEquipo(equipoId, jugador);
        return res.status(201).send({ status: 'Succes', message: 'Se creó el jugador correctamente', jugadores: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
});

router.put("/:equipoId/jugador/:jugadorId", uploader.single("foto"), async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;

    try {
        const updatedJugador = await equiposDatabase.editarJugadorEnEquipo(equipoId, jugadorId, jugador);

        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
})

router.put("/:equipoId/goles/:jugadorId", uploader.single("foto"), async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;

    try {
        const updatedJugador = await equiposDatabase.editarGolJugador(equipoId, jugadorId, jugador);

        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
})

router.delete("/:equipoId/jugadores/:jugadorId", async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const jugadorId = req.params.jugadorId;
        const equipo = await equiposDatabase.eliminarJugadorDeEquipo(equipoId, jugadorId);
        return res.status(200).send({ status: "Success", message: "El jugador fue eliminado exitosamente", equipo: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
});

export default router;