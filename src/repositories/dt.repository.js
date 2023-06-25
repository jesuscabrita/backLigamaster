import { equiposModel } from "../models/equipos.model.js";

class DTRepository {
    constructor() {}

    modelEquiposGetByID = (equipoId) => {
        return equiposModel.findById(equipoId);
    }

    modelDTEdit = (equipoId, equipo) => {
        return equiposModel.findByIdAndUpdate(equipoId, { director_tecnico: equipo });
    }

}

export const dtRepository = new DTRepository();