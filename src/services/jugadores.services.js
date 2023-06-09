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

    eliminarImagenCloudinary = async (publicId) => {
        try {
            const result = await this.equipoCloudinary.claudinaryDestroy(publicId);
            console.log('Imagen eliminada:', result.result);
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            throw new Error('Error al eliminar la imagen de Cloudinary');
        }
    };

    generarNumeroAleatorio = () => {
        return Math.floor(Math.random() * 1000000);
    }

    obtenerPublicIdDesdeUrl = (url) => {
        const publicIdRegex = /\/([^/]+)\.\w+$/;
        const match = url.match(publicIdRegex);
        if (match && match.length >= 2) {
            return match[1];
        } else {
            throw new Error("No se pudo extraer el public_id de la URL");
        }
    }

    crearJugador = async (equipoId, jugador) => {
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
                const nombreCorto = this.jugadores.generarNombreCorto();
                const nombreAleatorio = this.generarNumeroAleatorio();
                const nombreImagen = `${nombreCorto}_${nombreAleatorio}`;
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto, nombreImagen);
                newFotoUrl = result.secure_url;
            } else {
                newFotoUrl = '';
            }

            const capitalizeFirstLetter = (str) => {
                return str.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
                    return char.toUpperCase();
                });
            };
            const nombreCompleto = jugador.name.trim().split(' ');
            const nombreCapitalizado = nombreCompleto.map((nombre) => capitalizeFirstLetter(nombre));

            const nuevoJugador = {
                name: nombreCapitalizado.join(' '),
                edad: jugador.edad,
                capitan: 'No',
                posicion: jugador.posicion.trim(),
                fecha_nacimiento: jugador.fecha_nacimiento,
                goles: 0,
                asistencias: 0,
                tarjetas_amarillas: 0,
                tarjetas_roja: 0,
                tarjetas_azul: 0,
                lesion: 'No',
                nacionalidad: jugador.nacionalidad.trim(),
                dorsal: jugador.dorsal,
                partidos: 0,
                partidos_individual: ['No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No'],
                gol_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                amarilla_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                roja_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                asistencia_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                azul_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                jugador_figura_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                figura: 0,
                suspendido_numero: 0,
                suspendido: 'No',
                jornadas_suspendido: 0,
                tarjetas_acumuladas: 0,
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

    eliminarJugador = async (equipoId, jugadorId) => {
        try {
            const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
            if (!equipo) {
                throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
            }
            const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
            if (jugadorIndex === -1) {
                throw new Error("El jugador no existe en el equipo");
            }

            const jugador = equipo.jugadores[jugadorIndex];

            if (jugador.foto) {
                const publicId = this.obtenerPublicIdDesdeUrl(jugador.foto);
                await this.eliminarImagenCloudinary(publicId);
            }

            equipo.jugadores.splice(jugadorIndex, 1);
            await equipo.save();
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al eliminar jugador del equipo");
        }
    }

    editarJugador = async (equipoId, jugadorId, jugador) => {
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
            const jugadorActual = equipo.jugadores[jugadorIndex];
            let fotoChanged = false;

            if (jugador.foto && jugador.foto !== jugadorActual.foto) {
                fotoChanged = true;
            }

            let newFotoUrl; 
            if (!jugador.foto || jugador.foto === jugadorActual.foto) {
                jugador.foto = jugadorActual.foto;
            } else {

            if (fotoChanged) {
                if (jugadorActual.foto) {
                    const publicId = this.obtenerPublicIdDesdeUrl(jugadorActual.foto);
                    await this.eliminarImagenCloudinary(publicId);
                }
            }

                if (jugador.foto) {
                    const nombreCorto = this.jugadores.generarNombreCorto();
                    const nombreAleatorio = this.generarNumeroAleatorio();
                    const nombreImagen = `${nombreCorto}_${nombreAleatorio}`;
                    const result = await this.equipoCloudinary.claudinaryUploader(
                        jugador.foto,
                        nombreImagen
                    );
                    newFotoUrl = result.secure_url;
                    jugador.foto = newFotoUrl;
                }
            }

            const updatedJugador = {
                ...equipo.jugadores[jugadorIndex],
                name: jugador.name.trim(),
                edad: jugador.edad,
                capitan: equipo.jugadores[jugadorIndex].capitan,
                posicion: jugador.posicion.trim(),
                fecha_nacimiento: jugador.fecha_nacimiento,
                goles: equipo.jugadores[jugadorIndex].goles,
                asistencias: equipo.jugadores[jugadorIndex].asistencias,
                tarjetas_amarillas: equipo.jugadores[jugadorIndex].tarjetas_amarillas,
                tarjetas_roja: equipo.jugadores[jugadorIndex].tarjetas_roja,
                tarjetas_azul: equipo.jugadores[jugadorIndex].tarjetas_azul,
                lesion: equipo.jugadores[jugadorIndex].lesion,
                nacionalidad: jugador.nacionalidad.trim(),
                dorsal: jugador.dorsal,
                partidos: equipo.jugadores[jugadorIndex].partidos,
                partidos_individual: equipo.jugadores[jugadorIndex].partidos_individual,
                gol_partido_individual: equipo.jugadores[jugadorIndex].gol_partido_individual,
                amarilla_partido_individual: equipo.jugadores[jugadorIndex].amarilla_partido_individual,
                roja_partido_individual: equipo.jugadores[jugadorIndex].roja_partido_individual,
                azul_partido_individual: equipo.jugadores[jugadorIndex].azul_partido_individual,
                asistencia_partido_individual: equipo.jugadores[jugadorIndex].asistencia_partido_individual,
                jugador_figura_individual: equipo.jugadores[jugadorIndex].jugador_figura_individual,
                figura: equipo.jugadores[jugadorIndex].figura,
                suspendido_numero: equipo.jugadores[jugadorIndex].suspendido_numero,
                suspendido: equipo.jugadores[jugadorIndex].suspendido,
                jornadas_suspendido: equipo.jugadores[jugadorIndex].jornadas_suspendido,
                tarjetas_acumuladas: equipo.jugadores[jugadorIndex].tarjetas_acumuladas,
                instagram: jugador.instagram.trim(),
                twitter: equipo.jugadores[jugadorIndex].twitter,
                equipo: equipo.jugadores[jugadorIndex].equipo,
                logo: equipo.jugadores[jugadorIndex].logo,
                foto: newFotoUrl || jugador.foto,
                _id: equipo.jugadores[jugadorIndex]._id,
                createdAt: equipo.jugadores[jugadorIndex].createdAt,
                updatedAt: equipo.jugadores[jugadorIndex].updatedAt
            };

            equipo.jugadores[jugadorIndex] = { ...equipo.jugadores[jugadorIndex], ...updatedJugador };
            await this.jugadores.modelJugadoresEdit(equipoId, equipo.jugadores);
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar jugador del equipo");
        }
    };

    editarGolJugador = async (equipoId, jugadorId, jugador, golPartido, golAFavor) => {
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
                gol_partido_individual: jugador.gol_partido_individual,
                goles: jugador.goles,
            };
            equipo.jugadores[jugadorIndex].gol_partido_individual = updatedJugador.gol_partido_individual;
            equipo.jugadores[jugadorIndex].goles = updatedJugador.goles;
            equipo.gol_partido = golPartido;
            equipo.goles_a_Favor = golAFavor;
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

    editarAmarillaJugador = async (equipoId, jugadorId, jugador, amarillas, rojas) => {
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
                amarilla_partido_individual: jugador.amarilla_partido_individual,
                tarjetas_amarillas: jugador.tarjetas_amarillas,
                roja_partido_individual: jugador.roja_partido_individual,
                tarjetas_roja: jugador.tarjetas_roja,
                suspendido_numero: jugador.suspendido_numero,
                suspendido: jugador.suspendido,
                tarjetas_acumuladas: jugador.tarjetas_acumuladas,
            };
            equipo.jugadores[jugadorIndex].amarilla_partido_individual = updatedJugador.amarilla_partido_individual;
            equipo.jugadores[jugadorIndex].roja_partido_individual = updatedJugador.roja_partido_individual;
            equipo.jugadores[jugadorIndex].tarjetas_amarillas = updatedJugador.tarjetas_amarillas;
            equipo.jugadores[jugadorIndex].tarjetas_roja = updatedJugador.tarjetas_roja;
            equipo.jugadores[jugadorIndex].suspendido_numero = updatedJugador.suspendido_numero;
            equipo.jugadores[jugadorIndex].suspendido = updatedJugador.suspendido;
            equipo.jugadores[jugadorIndex].tarjetas_acumuladas = updatedJugador.tarjetas_acumuladas;
            equipo.tarjetasAmarillas = amarillas;
            equipo.tarjetasRojas = rojas;
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

    editarRojaJugador = async (equipoId, jugadorId, jugador, rojas) => {
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
                roja_partido_individual: jugador.roja_partido_individual,
                tarjetas_roja: jugador.tarjetas_roja,
                suspendido_numero: jugador.suspendido_numero,
                suspendido: jugador.suspendido,
            };
            equipo.jugadores[jugadorIndex].roja_partido_individual = updatedJugador.roja_partido_individual;
            equipo.jugadores[jugadorIndex].tarjetas_roja = updatedJugador.tarjetas_roja;
            equipo.jugadores[jugadorIndex].suspendido_numero = updatedJugador.suspendido_numero;
            equipo.jugadores[jugadorIndex].suspendido = updatedJugador.suspendido;
            equipo.tarjetasRojas = rojas;
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

    editarAzulJugador = async (equipoId, jugadorId, jugador) => {
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
                azul_partido_individual: jugador.azul_partido_individual,
                tarjetas_azul: jugador.tarjetas_azul,
            };
            equipo.jugadores[jugadorIndex].azul_partido_individual = updatedJugador.azul_partido_individual;
            equipo.jugadores[jugadorIndex].tarjetas_azul = updatedJugador.tarjetas_azul;
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

    editarAsistenciaJugador = async (equipoId, jugadorId, jugador) => {
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
                asistencia_partido_individual: jugador.asistencia_partido_individual,
                asistencias: jugador.asistencias,
            };
            equipo.jugadores[jugadorIndex].asistencia_partido_individual = updatedJugador.asistencia_partido_individual;
            equipo.jugadores[jugadorIndex].asistencias = updatedJugador.asistencias;

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

    editarFiguraJugador = async (equipoId, jugadorId, jugador) => {
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
                jugador_figura_individual: jugador.jugador_figura_individual,
                figura: jugador.figura,
            };
            equipo.jugadores[jugadorIndex].jugador_figura_individual = updatedJugador.jugador_figura_individual;
            equipo.jugadores[jugadorIndex].figura = updatedJugador.figura;

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

    editarPartidosJugador = async (equipoId, jugadorId, jugador) => {
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
                partidos: jugador.partidos,
                partidos_individual: jugador.partidos_individual,
            };
            equipo.jugadores[jugadorIndex].partidos = updatedJugador.partidos;
            equipo.jugadores[jugadorIndex].partidos_individual = updatedJugador.partidos_individual;

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

    editarSuspencionJugador = async (equipoId, jugadorId, jugador) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        try {
            const updatedJugador = {
                jornadas_suspendido: jugador.jornadas_suspendido,
                suspendido: jugador.suspendido,
                tarjetas_acumuladas: jugador.tarjetas_acumuladas,
            };

            let newFotoUrl = equipo.jugadores[jugadorIndex].foto;
            if (jugador.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto);
                newFotoUrl = result.secure_url;
            }

            const updatedEquipo = await this.jugadores.modelJugadoresFindById(equipoId);
            if (!updatedEquipo) {
                throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
            }

            updatedEquipo.jugadores[jugadorIndex].jornadas_suspendido = updatedJugador.jornadas_suspendido;
            updatedEquipo.jugadores[jugadorIndex].suspendido = updatedJugador.suspendido;
            updatedEquipo.jugadores[jugadorIndex].tarjetas_acumuladas = updatedJugador.tarjetas_acumuladas;

            if (jugador.foto) {
                updatedEquipo.jugadores[jugadorIndex].foto = newFotoUrl;
            }

            await updatedEquipo.save();
            return updatedEquipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar jugador del equipo");
        }
    };

    editAutoGol = async (equipoId, equipos) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        try {
            equipo.goles_a_Favor = equipos.goles_a_Favor;
            equipo.gol_partido = equipos.gol_partido;
            equipo.autogol_partido = equipos.autogol_partido;
            await equipo.save();
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar el equipo");
        }
    }

    editCalcularDatosPartido = async (equipoId, equipos) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        try {
            equipo.goles_en_Contra = equipos.goles_en_Contra;
            equipo.diferencia_de_Goles = equipos.diferencia_de_Goles;
            equipo.puntos = equipos.puntos;
            equipo.partidosJugados = equipos.partidosJugados;
            equipo.ganados = equipos.ganados
            equipo.empates = equipos.empates
            equipo.perdidos = equipos.perdidos
            equipo.last5 = equipos.last5
            equipo.puntaje_anterior = equipos.puntaje_anterior
            await equipo.save();
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar el equipo");
        }
    }

    editarLesionJugador = async (equipoId, jugadorId, jugador) => {
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
                lesion: jugador.lesion,
            };
            equipo.jugadores[jugadorIndex].lesion = updatedJugador.lesion;
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

    editarJornadaJugador = async (equipoId, jugadorId, jugador) => {
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
                jornadas_suspendido: jugador.jornadas_suspendido,
            };
            equipo.jugadores[jugadorIndex].jornadas_suspendido = updatedJugador.jornadas_suspendido;
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

    editarCapitanJugador = async (equipoId, jugadorId, jugador) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        const existeCapitan = equipo.jugadores.find((p) => p.capitan === 'Si');
        if (existeCapitan && jugador.capitan === 'Si') {
            const nombreCapitan = existeCapitan.name;
            throw new Error(`Ya hay un jugador designado como capitán en el equipo: ${nombreCapitan}`);
        }
        try {
            let newFotoUrl = equipo.jugadores[jugadorIndex].foto;
            if (jugador.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto);
                newFotoUrl = result.secure_url;
            }
            const updatedJugador = {
                capitan: jugador.capitan,
            };
            equipo.jugadores[jugadorIndex].capitan = updatedJugador.capitan;
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