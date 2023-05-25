import { jugadoresService } from "../services/jugadores.services.js";

export const addJugador = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const jugador = req.body;
        const equipo = await jugadoresService.addJugadorToEquipo(equipoId, jugador);
        return res.status(201).send({ status: 'Succes', message: 'Se creó el jugador correctamente', jugadores: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const editJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarJugadorEnEquipo(equipoId, jugadorId, jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editGolJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarGolJugador(equipoId, jugadorId, jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const deleteJugador = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const jugadorId = req.params.jugadorId;
        const equipo = await jugadoresService.eliminarJugadorDeEquipo(equipoId, jugadorId);
        return res.status(200).send({ status: "Success", message: "El jugador fue eliminado exitosamente", equipo: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};