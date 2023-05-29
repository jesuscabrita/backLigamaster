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
    const golPartido = req.body.gol_partido;
    const golAFavor = req.body.goles_a_Favor;
    try {
        const updatedJugador = await jugadoresService.editarGolJugador(equipoId, jugadorId, jugador, golPartido, golAFavor);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editAmarillaJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    const amarillas = req.body.tarjetasAmarillas;
    const rojas = req.body.tarjetasRojas;
    try {
        const updatedJugador = await jugadoresService.editarAmarillaJugador(equipoId, jugadorId, jugador, amarillas, rojas);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editRojaJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    const rojas = req.body.tarjetasRojas;
    try {
        const updatedJugador = await jugadoresService.editarRojaJugador(equipoId, jugadorId, jugador, rojas);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editAzulJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarAzulJugador(equipoId, jugadorId, jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editAsistenciaJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarAsistenciaJugador(equipoId, jugadorId, jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editFiguraJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarFiguraJugador(equipoId, jugadorId, jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editSuspencionJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarSuspencionJugador(equipoId, jugadorId, jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editPartidosJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarPartidosJugador(equipoId, jugadorId, jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editAutoGol = async (req, res) => {
    const equipoId = req.params.equipoId;
    const equipo = req.body;
    try {
        const updatedEquipo = await jugadoresService.editAutoGol(equipoId, equipo);
        return res.status(200).send({ status: "OK", message: `Se actualizaron los datos del partido correctamente`, updatedEquipo });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editCalculoPartido = async (req, res) => {
    const equipoId = req.params.equipoId;
    const equipo = req.body;
    try {
        const updatedEquipo = await jugadoresService.editCalcularDatosPartido(equipoId, equipo);
        return res.status(200).send({ status: "OK", message: `Se actualizaron los datos del partido correctamente`, updatedEquipo });
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