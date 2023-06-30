import { equiposModel } from "../models/equipos.model.js";
import { v4 as uuidv4 } from 'uuid';

class DTRepository {
    constructor() {}

    modelEquiposGetByID = (equipoId) => {
        return equiposModel.findById(equipoId);
    }

    modelDTEdit = (equipoId, equipo) => {
        return equiposModel.findByIdAndUpdate(equipoId, { director_tecnico: equipo });
    }

    generarNombreCorto =()=>{
        return uuidv4().substr(0, 8); 
    }

}

export const dtRepository = new DTRepository();