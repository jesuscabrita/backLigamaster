import { delegadoRepository } from "../repositories/delegado.repsitory.js";

class DelegadoService {
    constructor() {
        this.equipos = delegadoRepository;
    }

    addDelegado = async (equipoId, delegado) => {
        const equipo = await this.equipos.modelEquiposGetByID(equipoId)
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }

        if (equipo.delegado.length > 0) {
            const nombreExistente = equipo.delegado[0].name;
            throw new Error(`Ya existe un delegado (${nombreExistente}) en el equipo`);
        }
    try {

        const capitalizeFirstLetter = (str) => {
            return str.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
                return char.toUpperCase();
            });
        };
        const nombreCompleto = delegado.name.trim().split(' ');
        const nombreCapitalizado = nombreCompleto.map((nombre) => capitalizeFirstLetter(nombre));

        const nuevoDelegado = {
            name: nombreCapitalizado.join(' '),
            telefono: delegado.telefono,
            correo: equipo.correo,
            logo: equipo.logo,
            equipo: equipo.name
        };

        equipo.delegado.push(nuevoDelegado);
        await equipo.save();
        return equipo;
    } catch (error) {
        console.error(error);
        throw new Error("Error al agregar el delegado al equipo");
    }
}

eliminarDelegado = async (equipoId, delegadoId)=>{
    try {
        const equipo = await this.equipos.modelEquiposGetByID(equipoId)
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const dtIndex = equipo.delegado.findIndex((d) => d._id == delegadoId);
        if (dtIndex === -1) {
            throw new Error("El delegado no existe en el equipo");
        }

        equipo.delegado.splice(dtIndex, 1);
        await equipo.save();
        return equipo;
    } catch (err) {
        console.error(err);
        throw new Error("Error al eliminar delegado del equipo");
    }
}

editarDelegado = async (equipoId, delegadoId, delegado) => {
    const equipo = await this.equipos.modelEquiposGetByID(equipoId)
    if (!equipo) {
        throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
    }

    const dtIndex = equipo.delegado.findIndex((d) => d._id == delegadoId);
    if (dtIndex === -1) {
        throw new Error("El elegado no existe en el equipo");
    }

    try {
        const updatedDT = {
            ...equipo.delegado[dtIndex],
            name: delegado.name.trim(),
            telefono: delegado.telefono,
            correo: equipo.delegado[dtIndex].correo,
            logo: equipo.delegado[dtIndex].logo,
            equipo: equipo.delegado[dtIndex].equipo,
            _id: equipo.delegado[dtIndex]._id,
        };

        equipo.delegado[dtIndex] = { ...equipo.delegado[dtIndex], ...updatedDT };
        await this.equipos.modelDelegadoEdit(equipoId, equipo.delegado);
        return equipo;
    } catch (err) {
        console.error(err);
        throw new Error("Error al editar delegado del equipo");
    }
}

}

export const delegadoService = new DelegadoService();