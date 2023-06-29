import { equiposModel } from "../models/equipos.model.js";

class DTDelegado {
    constructor() {}

    modelEquiposGetByID = (equipoId) => {
        return equiposModel.findById(equipoId);
    }

    modelDelegadoEdit = (equipoId, equipo) => {
        return equiposModel.findByIdAndUpdate(equipoId, { delegado: equipo });
    }


}

export const delegadoRepository = new DTDelegado();