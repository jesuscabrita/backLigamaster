import { equiposRepository } from "../repositories/equipos.repository.js";
import { jugadoresRepository } from "../repositories/jugadores.repository.js";

class JugadoresService {
    constructor() {
        this.jugadores = jugadoresRepository;
        this.equipoCloudinary = equiposRepository;
    }

    validateJugadorData(name, edad, posicion, fecha_nacimiento, nacionalidad, dorsal, instagram) {
        if (!name) {
            throw new Error("El nombre del jugador es requerido");
        }
        if (!edad) {
            throw new Error("La edad del jugador es requerido");
        }
        if (!posicion) {
            throw new Error("La posicion del jugador es requerido");
        }
        if (!fecha_nacimiento) {
            throw new Error("La fecha nacimiento del jugador es requerida");
        }
        if (!nacionalidad) {
            throw new Error("La nacionalidad del jugador es requerida");
        }
        if (!dorsal) {
            throw new Error("El dorsal del jugador es requerido");
        }
        if (!instagram) {
            throw new Error("El instagram del jugador es requerido");
        }
    }

    addJugadorToEquipo = async (equipoId, jugador) => {
        this.validateJugadorData(
            jugador.name,
            jugador.edad,
            jugador.posicion,
            jugador.fecha_nacimiento,
            jugador.nacionalidad,
            jugador.dorsal,
            jugador.instagram
        )
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        if (equipo.jugadores.length >= 4) {
            throw new Error("Ya se han creado 4 jugadores en este equipo es el límite");
        }
        const dorsalExistente = equipo.jugadores.find(j => j.dorsal == jugador.dorsal);
        if (dorsalExistente) {
            throw new Error(`Ya hay un jugador en este equipo con el dorsal ${jugador.dorsal}. El jugador que tiene este dorsal es ${dorsalExistente.name}.`);
        }

        try {
            let newFotoUrl;
            if (jugador.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto);
                newFotoUrl = result.secure_url;
            } else {
                newFotoUrl = '';
            }
            const nuevoJugador = {
                name: jugador.name.trim(),
                edad: jugador.edad,
                capitan: 'No',
                posicion: jugador.posicion.trim(),
                fecha_nacimiento: jugador.fecha_nacimiento,
                goles: 0,
                asistencias: 0,
                tarjetas_amarillas: 0,
                tarjetas_roja: 0,
                lesion: 'No',
                nacionalidad: jugador.nacionalidad.trim(),
                dorsal: jugador.dorsal,
                partidos: 0,
                gol_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                amarilla_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                roja_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                azul_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                jugador_figura: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                figura: 0,
                suspendido: 0,
                instagram: jugador.instagram.trim(),
                twitter: 'No definido',
                equipo: equipo.name,
                logo: equipo.logo,
                foto: newFotoUrl
            }
            equipo.jugadores.push(nuevoJugador);
            await equipo.save();
            return equipo;
        } catch (error) {
            console.error(error);
            throw new Error("Error al agregar jugador al equipo");
        }
    }

    eliminarJugadorDeEquipo = async (equipoId, jugadorId) => {
        try {
            const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
            if (!equipo) {
                throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
            }
            const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
            if (jugadorIndex === -1) {
                throw new Error("El jugador no existe en el equipo");
            }

            equipo.jugadores.splice(jugadorIndex, 1);
            await equipo.save();
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al eliminar jugador del equipo");
        }
    }

    editarJugadorEnEquipo = async (equipoId, jugadorId, jugador) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        const dorsalExistente = equipo.jugadores.find(j => j.dorsal == jugador.dorsal && j._id != jugadorId);
        if (dorsalExistente) {
            throw new Error(`Ya hay un jugador en este equipo con el dorsal ${jugador.dorsal}. El jugador que tiene este dorsal es ${dorsalExistente.name}.`);
        }

        try {
            let newFotoUrl = equipo.jugadores[jugadorIndex].foto;
            if (jugador.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto);
                newFotoUrl = result.secure_url;
            }
            const updatedJugador = {
                name: jugador.name.trim(),
                edad: jugador.edad,
                posicion: jugador.posicion.trim(),
                fecha_nacimiento: jugador.fecha_nacimiento,
                nacionalidad: jugador.nacionalidad.trim(),
                dorsal: jugador.dorsal,
                instagram: jugador.instagram.trim(),
                foto: newFotoUrl
            };

            equipo.jugadores[jugadorIndex] = { ...equipo.jugadores[jugadorIndex], ...updatedJugador };
            await this.jugadores.modelJugadoresEdit(equipoId, equipo.jugadores );
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar jugador del equipo");
        }
    };

    editarGolJugador = async (equipoId, jugadorId, jugador) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        try {
            let newFotoUrl = equipo.jugadores[jugadorIndex].foto;
            if (jugador.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto);
                newFotoUrl = result.secure_url;
            }
            const updatedJugador = {
                gol_partido: jugador.gol_partido
            };
            equipo.jugadores[jugadorIndex].gol_partido = updatedJugador.gol_partido;
            if (jugador.foto) {
                equipo.jugadores[jugadorIndex].foto = newFotoUrl;
            }
            await equipo.save();
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar jugador del equipo");
        }
    };
}

export const jugadoresService = new JugadoresService();