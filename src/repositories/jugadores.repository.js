import { equiposModel } from "../models/equipos.model.js";
import { v4 as uuidv4 } from 'uuid';

class JugadoresRepository {
    constructor() {}

    modelJugadoresFindById = (equipoId) => {
        return equiposModel.findById(equipoId);
    }

    modelJugadoresEdit = (equipoId, equipo) => {
        return equiposModel.findByIdAndUpdate(equipoId, { jugadores: equipo });
    }

    generarNombreCorto =()=>{
        return uuidv4().substr(0, 8); 
    }
}

export const jugadoresRepository = new JugadoresRepository();