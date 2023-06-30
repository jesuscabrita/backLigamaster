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

        const generarNumeroAleatorio =()=> {
            // Lógica para generar un número aleatorio
            // Puedes usar Math.random() o una biblioteca como 'random' para generar un número aleatorio
            return Math.floor(Math.random() * 1000000); // Genera un número aleatorio entre 0 y 999999
        }

        let newFotoUrl;
        if (dt.foto) {
            const nombreCorto = this.equipos.generarNombreCorto(); // Genera una cadena corta única
            const nombreAleatorio = generarNumeroAleatorio(); // Genera un número aleatorio
            const nombreImagen = `${nombreCorto}_${nombreAleatorio}`;
            const result = await this.equipoCloudinary.claudinaryUploader(dt.foto,nombreImagen);
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
            tarjetas_azul: 0,
            amarilla_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            roja_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            azul_partido:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            figura_partido: [0,0,0,0,0,0,0,0,0,0,0,0,0],
            figura: 0,
            nacionalidad: dt.nacionalidad.trim(),
            instagram: dt.instagram.trim(),
            twitter: "no definido",
            partidos: 0,
            partidos_individual: ['No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No'],
            jornadas_suspendido: 0,
            suspendido_numero: 0,
            suspendido: 'No',
            tarjetas_acumuladas: 0,
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

eliminarImagenCloudinary = async (publicId) => {
    try {
        const result = await this.equipoCloudinary.claudinaryDestroy(publicId);
        console.log('Imagen eliminada:', result.result);
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        throw new Error('Error al eliminar la imagen de Cloudinary');
    }
};

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
        const dtActual = equipo.director_tecnico[dtIndex];
        let fotoChanged = false;

        if (dt.foto && dt.foto !== dtActual.foto) {
            fotoChanged = true;
        }

        let newFotoUrl; // Variable para almacenar la nueva URL de la foto

        if (!dt.foto || dt.foto === dtActual.foto) {
            dt.foto = dtActual.foto;
        } else {
            const obtenerPublicIdDesdeUrl = (url) => {
                // La implementación real dependerá de cómo estés estructurando tus URLs en Cloudinary
                // Aquí se muestra un ejemplo simple de cómo extraer el public_id de una URL
                const publicIdRegex = /\/([^/]+)\.\w+$/;
                const match = url.match(publicIdRegex);
                if (match && match.length >= 2) {
                    return match[1];
                } else {
                    throw new Error("No se pudo extraer el public_id de la URL");
                }
            };

            if (fotoChanged) {
                // Eliminar el logo anterior de Cloudinary
                if (dtActual.foto) {
                    // Utiliza la lógica adecuada para eliminar una imagen de Cloudinary
                    const publicId = obtenerPublicIdDesdeUrl(dtActual.foto);
                    await this.eliminarImagenCloudinary(publicId);
                }
            }

            const generarNumeroAleatorio = () => {
                // Lógica para generar un número aleatorio
                // Puedes usar Math.random() o una biblioteca como 'random' para generar un número aleatorio
                return Math.floor(Math.random() * 1000000); // Genera un número aleatorio entre 0 y 999999
            };

            if (dtActual.foto) {
                // Cargar y actualizar la nueva imagen del logo en Cloudinary
                const nombreCorto = this.equipos.generarNombreCorto();
                const nombreAleatorio = generarNumeroAleatorio();
                const nombreImagen = `${nombreCorto}_${nombreAleatorio}`;
                const result = await this.equipoCloudinary.claudinaryUploader(
                    dt.foto,
                    nombreImagen
                );
                newFotoUrl = result.secure_url; // Asignar la nueva URL de la foto a newFotoUrl
                dt.foto = newFotoUrl;
            }
        }
        const updatedDT = {
            ...equipo.director_tecnico[dtIndex],
            name: dt.name.trim(),
            edad: dt.edad,
            fecha_nacimiento: dt.fecha_nacimiento,
            foto: newFotoUrl || dt.foto,
            nacionalidad: dt.nacionalidad.trim(),
            instagram: dt.instagram.trim(),
            twitter: equipo.director_tecnico[dtIndex].twitter,
            tarjetas_amarillas: equipo.director_tecnico[dtIndex].tarjetas_amarillas,
            tarjetas_rojas: equipo.director_tecnico[dtIndex].tarjetas_rojas,
            tarjetas_azul: equipo.director_tecnico[dtIndex].tarjetas_azul,
            amarilla_partido: equipo.director_tecnico[dtIndex].amarilla_partido,
            roja_partido: equipo.director_tecnico[dtIndex].roja_partido,
            azul_partido: equipo.director_tecnico[dtIndex].azul_partido,
            figura_partido: equipo.director_tecnico[dtIndex].figura_partido,
            figura: equipo.director_tecnico[dtIndex].figura,
            partidos: equipo.director_tecnico[dtIndex].partidos,
            partidos_individual: equipo.director_tecnico[dtIndex].partidos_individual,
            jornadas_suspendido: equipo.director_tecnico[dtIndex].jornadas_suspendido,
            suspendido_numero: equipo.director_tecnico[dtIndex].suspendido_numero,
            suspendido: equipo.director_tecnico[dtIndex].suspendido,
            tarjetas_acumuladas: equipo.director_tecnico[dtIndex].tarjetas_acumuladas,
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

        const dt = equipo.director_tecnico[dtIndex];

        const obtenerPublicIdDesdeUrl = (url) => {
            // La implementación real dependerá de cómo estés estructurando tus URLs en Cloudinary
            // Aquí se muestra un ejemplo simple de cómo extraer el public_id de una URL
            const publicIdRegex = /\/([^/]+)\.\w+$/;
            const match = url.match(publicIdRegex);
            if (match && match.length >= 2) {
                return match[1];
            } else {
                throw new Error("No se pudo extraer el public_id de la URL");
            }
        }
        // Eliminar la foto de Cloudinary si existe
        if (dt.foto) {
            const publicId = obtenerPublicIdDesdeUrl(dt.foto);
            await this.eliminarImagenCloudinary(publicId);
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

editarAmarillaDT = async (equipoId, directorTecnicoId, dt, amarillas, rojas) => {
    const equipo = await this.equipos.modelEquiposGetByID(equipoId);
    if (!equipo) {
        throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
    }
    const dtIndex = equipo.director_tecnico.findIndex((p) => p._id == directorTecnicoId);
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
            tarjetas_amarillas: dt.tarjetas_amarillas,
            amarilla_partido: dt.amarilla_partido,
            tarjetas_rojas: dt.tarjetas_rojas,
            roja_partido: dt.roja_partido,
            suspendido: dt.suspendido,
            suspendido_numero: dt.suspendido_numero,
            tarjetas_acumuladas: dt.tarjetas_acumuladas,
        };
        equipo.director_tecnico[dtIndex].tarjetas_amarillas = updatedDT.tarjetas_amarillas;
        equipo.director_tecnico[dtIndex].amarilla_partido = updatedDT.amarilla_partido;
        equipo.director_tecnico[dtIndex].tarjetas_rojas = updatedDT.tarjetas_rojas;
        equipo.director_tecnico[dtIndex].roja_partido = updatedDT.roja_partido;
        equipo.director_tecnico[dtIndex].suspendido = updatedDT.suspendido;
        equipo.director_tecnico[dtIndex].suspendido_numero = updatedDT.suspendido_numero;
        equipo.director_tecnico[dtIndex].tarjetas_acumuladas = updatedDT.tarjetas_acumuladas;
        equipo.tarjetasAmarillas = amarillas;
        equipo.tarjetasRojas = rojas;
        if (dt.foto) {
            equipo.director_tecnico[dtIndex].foto = newFotoUrl;
        }
        await equipo.save();
        return equipo;
    } catch (err) {
        console.error(err);
        throw new Error("Error al editar director tecnico del equipo");
    }
};

editarRojaDT = async (equipoId, directorTecnicoId, dt, rojas) => {
    const equipo = await this.equipos.modelEquiposGetByID(equipoId);
    if (!equipo) {
        throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
    }
    const dtIndex = equipo.director_tecnico.findIndex((p) => p._id == directorTecnicoId);
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
            roja_partido: dt.roja_partido,
            tarjetas_rojas: dt.tarjetas_rojas,
            suspendido_numero: dt.suspendido_numero,
            suspendido: dt.suspendido,
        };
        equipo.director_tecnico[dtIndex].roja_partido = updatedDT.roja_partido;
        equipo.director_tecnico[dtIndex].tarjetas_rojas = updatedDT.tarjetas_rojas;
        equipo.director_tecnico[dtIndex].suspendido_numero = updatedDT.suspendido_numero;
        equipo.director_tecnico[dtIndex].suspendido = updatedDT.suspendido;
        equipo.tarjetasRojas = rojas;
        if (dt.foto) {
            equipo.director_tecnico[dtIndex].foto = newFotoUrl;
        }
        await equipo.save();
        return equipo;
    } catch (err) {
        console.error(err);
        throw new Error("Error al director tecnico jugador del equipo");
    }
};

editarAzulDT = async (equipoId, directorTecnicoId, dt) => {
    const equipo = await this.equipos.modelEquiposGetByID(equipoId);
    if (!equipo) {
        throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
    }
    const dtIndex = equipo.director_tecnico.findIndex((p) => p._id == directorTecnicoId);
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
            azul_partido: dt.azul_partido,
            tarjetas_azul: dt.tarjetas_azul,
        };
        equipo.director_tecnico[dtIndex].azul_partido = updatedDT.azul_partido;
        equipo.director_tecnico[dtIndex].tarjetas_azul = updatedDT.tarjetas_azul;
        if (dt.foto) {
            equipo.director_tecnico[dtIndex].foto = newFotoUrl;
        }
        await equipo.save();
        return equipo;
    } catch (err) {
        console.error(err);
        throw new Error("Error al editar tecnico del equipo");
    }
};

editarFiguraDT = async (equipoId, directorTecnicoId, dt) => {
    const equipo = await this.equipos.modelEquiposGetByID(equipoId);
    if (!equipo) {
        throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
    }
    const dtIndex = equipo.director_tecnico.findIndex((p) => p._id == directorTecnicoId);
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
            figura_partido: dt.figura_partido,
            figura: dt.figura,
        };
        equipo.director_tecnico[dtIndex].figura_partido = updatedDT.figura_partido;
        equipo.director_tecnico[dtIndex].figura = updatedDT.figura;

        if (dt.foto) {
            equipo.director_tecnico[dtIndex].foto = newFotoUrl;
        }
        await equipo.save();
        return equipo;
    } catch (err) {
        console.error(err);
        throw new Error("Error al editar tecnico del equipo");
    }
};

editarSuspencionDT = async (equipoId, directorTecnicoId, dt) => {
    const equipo = await this.equipos.modelEquiposGetByID(equipoId);
    if (!equipo) {
        throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
    }
    const dtIndex = equipo.director_tecnico.findIndex((p) => p._id == directorTecnicoId);
    if (dtIndex === -1) {
        throw new Error("El director tecnico no existe en el equipo");
    }
    try {
        const updatedDT = {
            jornadas_suspendido: dt.jornadas_suspendido,
            suspendido: dt.suspendido,
            tarjetas_acumuladas: dt.tarjetas_acumuladas,
        };

        let newFotoUrl = equipo.director_tecnico[dtIndex].foto;
        if (dt.foto) {
            const result = await this.equipoCloudinary.claudinaryUploader(dt.foto);
            newFotoUrl = result.secure_url;
        }

        const updatedEquipo = await this.equipos.modelEquiposGetByID(equipoId);
        if (!updatedEquipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }

        updatedEquipo.director_tecnico[dtIndex].jornadas_suspendido = updatedDT.jornadas_suspendido;
        updatedEquipo.director_tecnico[dtIndex].suspendido = updatedDT.suspendido;
        updatedEquipo.director_tecnico[dtIndex].tarjetas_acumuladas = updatedDT.tarjetas_acumuladas;

        if (dt.foto) {
            updatedEquipo.director_tecnico[dtIndex].foto = newFotoUrl;
        }

        await updatedEquipo.save();
        return updatedEquipo;
    } catch (err) {
        console.error(err);
        throw new Error("Error al editar jugador del equipo");
    }
};

editarJornadaDT = async (equipoId, directorTecnicoId, dt) => {
    const equipo = await this.equipos.modelEquiposGetByID(equipoId);
    if (!equipo) {
        throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
    }
    const dtIndex = equipo.director_tecnico.findIndex((p) => p._id == directorTecnicoId);
    if (dtIndex === -1) {
        throw new Error("El director tecnico no existe en el equipo");
    }

    let newFotoUrl = equipo.director_tecnico[dtIndex].foto;
        if (dt.foto) {
            const result = await this.equipoCloudinary.claudinaryUploader(dt.foto);
            newFotoUrl = result.secure_url;
        }
    try {
        const updatedDT = {
            jornadas_suspendido: dt.jornadas_suspendido,
        };

        equipo.director_tecnico[dtIndex].jornadas_suspendido = updatedDT.jornadas_suspendido;
        if (dt.foto) {
            equipo.director_tecnico[dtIndex].foto = newFotoUrl;
        }
        await equipo.save();
        return equipo;
    } catch (err) {
        console.error(err);
        throw new Error("Error al editar director tecnico del equipo");
    }
};

}

export const dtService = new DTService();