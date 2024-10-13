import { equiposModel } from "../models/equipos.model.js";
import { v4 as uuidv4 } from 'uuid';

class JugadoresRepository {
    constructor() {}

    modelJugadoresEquiposGet = () => {
        return equiposModel.find();
    }

    modelJugadoresFindById = (equipoId) => {
        return equiposModel.findById(equipoId);
    }

    modelJugadoresEdit = (equipoId, equipo) => {
        return equiposModel.findByIdAndUpdate(equipoId, { jugadores: equipo });
    }

    generarNombreCorto =()=>{
        return uuidv4().substr(0, 8); 
    }

    modelOfertasEdit = async (equipoId, jugadorId, ofertas) => {
        const equipo = await equiposModel.findById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugador = equipo.jugadores.find((j) => j._id.toString() === jugadorId);
        if (!jugador) {
            throw new Error(`No se encontró el jugador con el _id ${jugadorId}`);
        }
        jugador.oferta = ofertas;
        await equipo.save();
        return jugador.oferta;
    }
}

export const jugadoresRepository = new JugadoresRepository();