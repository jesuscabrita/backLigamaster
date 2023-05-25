import { equiposModel } from "../models/equipos.model.js";

class JugadoresRepository {
    constructor() {}

    modelJugadoresFindById = (equipoId) => {
        return equiposModel.findById(equipoId);
    }

    modelJugadoresEdit = (equipoId, equipo) => {
        return equiposModel.findByIdAndUpdate(equipoId, { jugadores: equipo });
    }
}

export const jugadoresRepository = new JugadoresRepository();