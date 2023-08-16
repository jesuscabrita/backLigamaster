import moment from "moment";
import { equiposRepository } from "../repositories/equipos.repository.js";
import { jugadoresRepository } from "../repositories/jugadores.repository.js";

class JugadoresService {
    constructor() {
        this.jugadores = jugadoresRepository;
        this.equipoCloudinary = equiposRepository;
    }

    validateJugadorData(name, sueldo, posicion, fecha_nacimiento, nacionalidad, dorsal, instagram) {
        if (!name) {
            throw new Error("El nombre del jugador es requerido");
        }
        if (!sueldo) {
            throw new Error("El sueldo del jugador es requerido");
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

    calculateAge = (fecha_nacimiento) => {
        const today = moment();
        const birthDate = moment(fecha_nacimiento, 'YYYY-MM-DD');
        const age = today.diff(birthDate, 'years');
        return age.toString();
    }

    crearJugador = async (equipoId, jugador) => {
        this.validateJugadorData(
            jugador.name,
            jugador.sueldo,
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
        if (equipo.jugadores.length >= 10) {
            throw new Error("Ya se han fichado 10 jugadores en este equipo es el límite");
        }
        const dorsalExistente = equipo.jugadores.find(j => j.dorsal == jugador.dorsal);
        if (dorsalExistente) {
            throw new Error(`Ya hay un jugador en este equipo con el dorsal ${jugador.dorsal}. El jugador que tiene este dorsal es ${dorsalExistente.name}.`);
        }
        if (jugador.nacionalidad === 'Seleccionar') {
            throw new Error("La nacinalidad del jugador es requerida");
        }
        if (jugador.contrato === 'Seleccionar') {
            throw new Error("El contrato del jugador es requerido");
        }
        if (jugador.sueldo < 500000) {
            throw new Error("El sueldo del jugador debe ser de al menos 500,000");
        }
        if (jugador.contrato === 0.5) {
            jugador.sueldo = jugador.sueldo / 2;
        } else if (jugador.contrato === 1) {
            jugador.sueldo = jugador.sueldo;
        }else if (jugador.contrato === 2) {
            jugador.sueldo = jugador.sueldo * 2;
        }else if (jugador.contrato === 3) {
            jugador.sueldo = jugador.sueldo * 3;
        }else if (jugador.contrato === 4) {
            jugador.sueldo = jugador.sueldo * 4;
        }
        const sueldoTotalJugadores = equipo.jugadores.reduce((totalSueldo, j) => totalSueldo + parseFloat(j.sueldo), 0) + parseFloat(jugador.sueldo);
        if (sueldoTotalJugadores > equipo.banco_fondo) {
            throw new Error("Excediste el límite salarial, no cumples con el Fair play financiero");
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

            let clausulaAumento = 0;
            const edadJugador = this.calculateAge(jugador.fecha_nacimiento);
            const valorMercado = edadJugador > 40 ? 500000 :1000000;
            
            if (edadJugador < 18) {
                clausulaAumento = 0.65;
            } else if (edadJugador < 20) {
                clausulaAumento = 0.75;
            } else if (edadJugador < 22) {
                clausulaAumento = 0.85;
            } else if (edadJugador < 24) {
                clausulaAumento = 1;
            } else if (edadJugador < 26) {
                clausulaAumento = 1.2;
            } else if (edadJugador < 28) {
                clausulaAumento = 0.8;
            } else if (edadJugador < 30) {
                clausulaAumento = 0.7;
            } else if (edadJugador < 32) {
                clausulaAumento = 0.6;
            } else if (edadJugador < 34) {
                clausulaAumento = 0.5;
            } else if (edadJugador < 36) {
                clausulaAumento = 0.4;
            } else if (edadJugador < 38) {
                clausulaAumento = 0.2;
            } else if (edadJugador < 40) {
                clausulaAumento = 0;
            } else {
                clausulaAumento = 1;
            }
            const nuevaClausula = edadJugador > 40 ? 500000 : valorMercado * (1 + clausulaAumento)

            const nuevoJugador = {
                name: nombreCapitalizado.join(' '),
                edad: edadJugador,
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
                foto: newFotoUrl,
                sueldo: jugador.sueldo,
                sueldoCalculo:jugador.sueldo,
                contrato: jugador.contrato,
                valor_mercado: valorMercado,
                fecha_inicio: new Date(),
                fecha_fichaje:'No definido',
                clausula: nuevaClausula,
                indemnizacion:jugador.sueldo / 2,
                oferta: [],
                transferible:'No',
            }
            const jugadorNuevo = equipo.jugadores.push(nuevoJugador);
            await equipo.save();
            return jugadorNuevo;
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
        if (jugador.nacionalidad === 'Seleccionar') {
            throw new Error("La nacinalidad del jugador es requerida");
        }
        if (jugador.contrato === 'Seleccionar') {
            throw new Error("El contrato del jugador es requerido");
        }
        if (jugador.sueldo < 500000) {
            throw new Error("El sueldo del jugador debe ser de al menos 500,000");
        }
        if (jugador.contrato === 0.5) {
            jugador.sueldo = jugador.sueldo / 2;
        } else if (jugador.contrato === 1) {
            jugador.sueldo = jugador.sueldo;
        }else if (jugador.contrato === 2) {
            jugador.sueldo = jugador.sueldo * 2;
        }else if (jugador.contrato === 3) {
            jugador.sueldo = jugador.sueldo * 3;
        }else if (jugador.contrato === 4) {
            jugador.sueldo = jugador.sueldo * 4;
        }

        const jugadorActual = equipo.jugadores[jugadorIndex];
        let sueldoTotalJugadores = 0;
        for (const j of equipo.jugadores) {
            if (j._id !== jugadorId) {
                sueldoTotalJugadores += parseFloat(j.sueldo);
            }
        }
        if (equipo.jugadores[jugadorIndex].sueldo !== jugador.sueldo) {
            sueldoTotalJugadores += parseFloat(jugador.sueldo) - parseFloat(jugadorActual.sueldo);
        }
        if (sueldoTotalJugadores > equipo.banco_fondo) {
            throw new Error("Excediste el límite salarial, no cumples con el Fair play financiero");
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
                edad: this.calculateAge(jugador.fecha_nacimiento),
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
                sueldo: jugador.sueldo,
                sueldoCalculo: jugador.sueldo,
                contrato: jugador.contrato,
                valor_mercado: equipo.jugadores[jugadorIndex].valor_mercado,
                fecha_inicio: equipo.jugadores[jugadorIndex].fecha_inicio,
                fecha_fichaje: equipo.jugadores[jugadorIndex].fecha_fichaje,
                clausula: equipo.jugadores[jugadorIndex].clausula,
                indemnizacion: jugador.sueldo / 2,
                oferta: equipo.jugadores[jugadorIndex].oferta,
                transferible: equipo.jugadores[jugadorIndex].transferible,
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

    valorMercadoJugador = async (equipoId, jugadorId, jugador) => {
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
                valor_mercado: jugador.valor_mercado,
                sueldoCalculo: jugador.sueldoCalculo,
                clausula: jugador.clausula,
            };
            equipo.jugadores[jugadorIndex].valor_mercado = updatedJugador.valor_mercado;
            equipo.jugadores[jugadorIndex].sueldoCalculo = updatedJugador.sueldoCalculo;
            equipo.jugadores[jugadorIndex].clausula = updatedJugador.clausula;
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

    renovarJugador = async (equipoId, jugadorId, jugador) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        if (jugador.contrato === 'Seleccionar') {
            throw new Error("El contrato del jugador es requerido");
        }
        if (jugador.sueldo < equipo.jugadores[jugadorIndex].sueldoCalculo) {
            throw new Error(`El sueldo del jugador debe ser mayor o igual a ${equipo.jugadores[jugadorIndex].sueldoCalculo}`);
        }
        if (jugador.contrato === 0.5) {
            jugador.sueldo = jugador.sueldo / 2;
        } else if (jugador.contrato === 1) {
            jugador.sueldo = jugador.sueldo;
        }else if (jugador.contrato === 2) {
            jugador.sueldo = jugador.sueldo * 2;
        }else if (jugador.contrato === 3) {
            jugador.sueldo = jugador.sueldo * 3;
        }else if (jugador.contrato === 4) {
            jugador.sueldo = jugador.sueldo * 4;
        }
        const sueldoAnterior = equipo.jugadores[jugadorIndex].sueldo;
        equipo.banco_fondo -= sueldoAnterior;

        const jugadorActual = equipo.jugadores[jugadorIndex];
        let sueldoTotalJugadores = 0;
        for (const j of equipo.jugadores) {
            if (j._id !== jugadorId) {
                sueldoTotalJugadores += parseFloat(j.sueldo);
            }
        }
        if (equipo.jugadores[jugadorIndex].sueldo !== jugador.sueldo) {
            sueldoTotalJugadores += parseFloat(jugador.sueldo) - parseFloat(jugadorActual.sueldo);
        }
        if (sueldoTotalJugadores > equipo.banco_fondo) {
            throw new Error("Excediste el límite salarial, no cumples con el Fair play financiero");
        }

        try {
            let newFotoUrl = equipo.jugadores[jugadorIndex].foto;
            if (jugador.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto);
                newFotoUrl = result.secure_url;
            }
            const updatedJugador = {
                sueldo: jugador.sueldo,
                contrato: jugador.contrato,
            };
            equipo.jugadores[jugadorIndex].sueldo = updatedJugador.sueldo;
            equipo.jugadores[jugadorIndex].contrato = updatedJugador.contrato;
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

    listaDeTransferibles = async (equipoId, jugadorId, jugador) => {
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
                transferible: jugador.transferible,
            };
            equipo.jugadores[jugadorIndex].transferible = updatedJugador.transferible;
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