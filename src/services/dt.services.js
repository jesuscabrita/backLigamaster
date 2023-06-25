import { dtRepository } from "../repositories/dt.repository.js";
import { equiposRepository } from "../repositories/equipos.repository.js";

class DTService {
    constructor() {
        this.equipos = dtRepository;
        this.equipoCloudinary = equiposRepository;
    }

    addDT = async (equipoId, dt) => {
        const equipo = await this.equipos.modelEquiposGetByID(equipoId)
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }

        if (equipo.director_tecnico.length > 0) {
            const nombreDTExistente = equipo.director_tecnico[0].name;
            throw new Error(`Ya existe un director técnico (${nombreDTExistente}) en el equipo`);
        }
    try {
        let newFotoUrl;
        if (dt.foto) {
            const result = await this.equipoCloudinary.claudinaryUploader(dt.foto);
            newFotoUrl = result.secure_url;
        } else {
            newFotoUrl = '';
        }

        const nuevoDT = {
            name: dt.name.trim(),
            edad: 0,
            fecha_nacimiento: dt.fecha_nacimiento,
            foto: newFotoUrl,
            tarjetas_amarillas: 0,
            tarjetas_rojas: 0,
            amarilla_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            roja_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            nacionalidad: dt.nacionalidad.trim(),
            instagram: dt.instagram.trim(),
            twitter: "no definido",
            partidos: 0,
            partidos_individual: ['No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No'],
            suspendido_numero: 0,
            suspendido: 'No',
            telefono: dt.telefono,
            logo: equipo.logo,
            equipo: equipo.name
        };

        equipo.director_tecnico.push(nuevoDT);
        await equipo.save();
        return equipo;
    } catch (error) {
        console.error(error);
        throw new Error("Error al agregar el director técnico al equipo");
    }
}

    editarDT = async (equipoId, directorTecnicoId, dt) => {
        const equipo = await this.equipos.modelEquiposGetByID(equipoId)
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }

        const dtIndex = equipo.director_tecnico.findIndex((d) => d._id == directorTecnicoId);
        if (dtIndex === -1) {
            throw new Error("El director tecnico no existe en el equipo");
        }

        try {
            let newFotoUrl = equipo.director_tecnico[dtIndex].foto;
            if (dt.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(dt.foto);
                newFotoUrl = result.secure_url;
            }
            const updatedDT = {
                ...equipo.director_tecnico[dtIndex],
                name: dt.name.trim(),
                edad: dt.edad,
                fecha_nacimiento: dt.fecha_nacimiento,
                foto: newFotoUrl,
                nacionalidad: dt.nacionalidad.trim(),
                instagram: dt.instagram.trim(),
                twitter: equipo.director_tecnico[dtIndex].twitter,
                tarjetas_amarillas: equipo.director_tecnico[dtIndex].tarjetas_amarillas,
                tarjetas_rojas: equipo.director_tecnico[dtIndex].tarjetas_rojas,
                amarilla_partido: equipo.director_tecnico[dtIndex].amarilla_partido,
                roja_partido: equipo.director_tecnico[dtIndex].roja_partido,
                partidos: equipo.director_tecnico[dtIndex].partidos,
                partidos_individual: equipo.director_tecnico[dtIndex].partidos_individual,
                suspendido_numero: equipo.director_tecnico[dtIndex].suspendido_numero,
                suspendido: equipo.director_tecnico[dtIndex].suspendido,
                telefono: dt.telefono,
                logo: equipo.director_tecnico[dtIndex].logo,
                equipo: equipo.director_tecnico[dtIndex].equipo,
                _id: equipo.director_tecnico[dtIndex]._id,
                createdAt: equipo.director_tecnico[dtIndex].createdAt,
                updatedAt: equipo.director_tecnico[dtIndex].updatedAt
            };

            equipo.director_tecnico[dtIndex] = { ...equipo.director_tecnico[dtIndex], ...updatedDT };
            await this.equipos.modelDTEdit(equipoId, equipo.director_tecnico);
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar director tecnico del equipo");
        }
    }

    eliminarDT = async (equipoId, directorTecnicoId)=>{
        try {
            const equipo = await this.equipos.modelEquiposGetByID(equipoId)
            if (!equipo) {
                throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
            }
            const dtIndex = equipo.director_tecnico.findIndex((d) => d._id == directorTecnicoId);
            if (dtIndex === -1) {
                throw new Error("El director tecnico no existe en el equipo");
            }

            equipo.director_tecnico.splice(dtIndex, 1);
            await equipo.save();
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al eliminar director tecnico del equipo");
        }
    }

    editarPartidosDT = async (equipoId, directorTecnicoId, dt ) => {
        const equipo = await this.equipos.modelEquiposGetByID(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const dtIndex = equipo.director_tecnico.findIndex((d) => d._id == directorTecnicoId);
        if (dtIndex === -1) {
            throw new Error("El director tecnico no existe en el equipo");
        }
        try {
            let newFotoUrl = equipo.director_tecnico[dtIndex].foto;
            if (dt.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(dt.foto);
                newFotoUrl = result.secure_url;
            }
            const updatedDT = {
                partidos: dt.partidos,
                partidos_individual: dt.partidos_individual,
            };
            equipo.director_tecnico[dtIndex].partidos = updatedDT.partidos;
            equipo.director_tecnico[dtIndex].partidos_individual = updatedDT.partidos_individual;
            
            if (dt.foto) {
                equipo.director_tecnico[dtIndex].foto = newFotoUrl;
            }
            await equipo.save();
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar jugador del equipo");
        }
    };

}

export const dtService = new DTService();