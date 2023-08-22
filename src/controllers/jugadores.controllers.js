import { jugadoresService } from "../services/jugadores.services.js";

export const addJugador = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const jugador = req.body;
        const equipo = await jugadoresService.crearJugador(equipoId, jugador);
        return res.status(201).send({ status: 'Succes', message: 'Se ficho el jugador correctamente', jugadores: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const editJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarJugador(equipoId, jugadorId, jugador);
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
        const equipo = await jugadoresService.eliminarJugador(equipoId, jugadorId);
        return res.status(200).send({ status: "Success", message: "El jugador fue eliminado exitosamente", equipo: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const editLesionJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarLesionJugador(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editJornadaJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarJornadaJugador(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editCapitanJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.editarCapitanJugador(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const valorMercaoJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.valorMercadoJugador(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `El jugador se editó correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const renovarJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.renovarJugador(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `Se renovo el jugador correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const listaDeTransferibleJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.listaDeTransferibles(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `Se puso el jugador en lista de transferible correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const recindirJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.recindirJugador(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `Se recindio el contrato del jugador correctamente, y queda libre`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const inscribirJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.inscribirJugador(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `Se inscribio el jugador correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const dorsalJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    const jugador = req.body;
    try {
        const updatedJugador = await jugadoresService.dorsalJugador(equipoId,jugadorId,jugador);
        return res.status(200).send({ status: "OK", message: `Se asigno el dorsal del jugador correctamente`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
}

export const calculoContratoJugador = async (req, res) => {
    const equipoId = req.params.equipoId;
    const jugadorId = req.params.jugadorId;
    try {
        const updatedJugador = await jugadoresService.calculoJugadorContrato(equipoId,jugadorId);
        return res.status(200).send({ status: "OK", message: `Se actualizaron contratos`, updatedJugador });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
}

//OFERTAS

export const addOferta = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const jugadorId = req.params.jugadorId;
        const oferta = req.body;
        const ofertaEquipo = await jugadoresService.crearOferta(equipoId, jugadorId, oferta);
        return res.status(201).send({ status: 'Succes', message: 'Se envio la oferta correctamente', oferta: ofertaEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const editarferta = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const jugadorId = req.params.jugadorId;
        const ofertaId = req.params.ofertaId;
        const oferta = req.body;
        const ofertaEquipo = await jugadoresService.editarOferta(equipoId, jugadorId, ofertaId ,oferta);
        return res.status(201).send({ status: 'Succes', message: 'Se edito la oferta correctamente', oferta: ofertaEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const eliminarOferta = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const jugadorId = req.params.jugadorId;
        const ofertaId = req.params.ofertaId;
        const ofertaEquipo = await jugadoresService.eliminarOferta(equipoId, jugadorId, ofertaId,);
        return res.status(201).send({ status: 'Succes', message: 'Se elimino la oferta correctamente', oferta: ofertaEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const fichaDeJugador = async (req, res) => {
    try {
        const equipoOrigenId = req.params.equipoOrigenId;
        const equipoDestinoId = req.params.equipoDestinoId;
        const jugadorId = req.params.jugadorId;
        const oferta = req.body
        const ofertaEquipo = await jugadoresService.fichaDeJugador(equipoOrigenId, equipoDestinoId, jugadorId,oferta);
        return res.status(201).send({ status: 'Succes', message: 'Se ficho el jugador correctamente', oferta: ofertaEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const prestamoDeJugador = async (req, res) => {
    try {
        const equipoOrigenId = req.params.equipoOrigenId;
        const equipoDestinoId = req.params.equipoDestinoId;
        const jugadorId = req.params.jugadorId;
        const ofertaEquipo = await jugadoresService.prestamoDeJugador(equipoOrigenId, equipoDestinoId, jugadorId);
        return res.status(201).send({ status: 'Succes', message: 'Se presto el jugador correctamente', oferta: ofertaEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const devolverJugadorPrestamo = async (req, res) => {
    try {
        const equipoOrigenId = req.params.equipoOrigenId;
        const jugadorId = req.params.jugadorId;
        const ofertaEquipo = await jugadoresService.devolverJugadorPrestamo(equipoOrigenId, jugadorId);
        return res.status(201).send({ status: 'Succes', message: 'Volvio el jugador correctamente', oferta: ofertaEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};