import moment from "moment";
import { equiposRepository } from "../repositories/equipos.repository.js";
import { jugadoresRepository } from "../repositories/jugadores.repository.js";

class JugadoresService {
    constructor() {
        this.jugadores = jugadoresRepository;
        this.equipoCloudinary = equiposRepository;
    }

    validateJugadorData(name, posicion, fecha_nacimiento, nacionalidad, documento) {
        if (!name) {
            throw new Error("El nombre del jugador es requerido");
        }
        if (!documento){
            throw new Error("El DNI/Documento del jugador es requerido");
        }
        if (fecha_nacimiento === 'Invalid date') {
            throw new Error("La fecha de nacimiento del jugador es requerida");
        }
        if (posicion === 'Elija una opción') {
            throw new Error("La posicion del jugador es requerida");
        }
        if (nacionalidad === 'Elija una opción') {
            throw new Error("La nacionalidad del jugador es requerida");
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
            jugador.posicion,
            jugador.fecha_nacimiento,
            jugador.nacionalidad,
            jugador.documento,
        )
        if (jugador.contrato === 'Elija una opción') {
            throw new Error("Debe seleccionar un contrato");
        }
        if (!jugador.sueldo) {
            throw new Error("El sueldo del jugador es requerido");
        }
        if (jugador.sueldo < 500000) {
            throw new Error("El sueldo del jugador debe ser de al menos 500,000");
        }
        if (!jugador.dorsal) {
            throw new Error("El dorsal del jugador es requerido");
        }

        const equipos = await this.jugadores.modelJugadoresEquiposGet();
        const jugadores = equipos?.flatMap(equipo => equipo?.jugadores || []); 
        const jugadorExistente = jugadores?.some(j => j?.documento === jugador?.documento);

        if (jugadorExistente) {
            throw new Error(`Ya xiste un jugador con el documento: ${jugador.documento} en otro equipo.`);
        }

        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        if (equipo.jugadores.length >= 12) {
            throw new Error("Ya se han fichado 12 jugadores en este equipo es el límite");
        }
        const dorsalExistente = equipo.jugadores.find(j => j.dorsal == jugador.dorsal);
        if (dorsalExistente) {
            throw new Error(`Ya hay un jugador en este equipo con el dorsal ${jugador.dorsal}. El jugador que tiene este dorsal es ${dorsalExistente.name}.`);
        }
        
        const sueldoOriginal = jugador.sueldo;  

        if (jugador.contrato === 0.5) {
            jugador.sueldoCalculo = sueldoOriginal / 2;
        } else if (jugador.contrato === 1) {
            jugador.sueldoCalculo = sueldoOriginal;
        } else if (jugador.contrato === 2) {
            jugador.sueldoCalculo = sueldoOriginal * 2;
        } else if (jugador.contrato === 3) {
            jugador.sueldoCalculo = sueldoOriginal * 3;
        } else if (jugador.contrato === 4) {
            jugador.sueldoCalculo = sueldoOriginal * 4;
        }

        jugador.sueldo = jugador.contrato === 0.5 ? sueldoOriginal / 2 : sueldoOriginal;

        const sueldoTotalJugadores = equipo?.jugadores.reduce((totalSueldo, j) => totalSueldo + parseFloat(j.sueldo), 0) + parseFloat(jugador.sueldo);
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
                clausulaAumento = 3; 
            } else if (edadJugador < 20) {
                clausulaAumento = 3; 
            } else if (edadJugador < 22) {
                clausulaAumento = 5; 
            } else if (edadJugador < 24) {
                clausulaAumento = 4; 
            } else if (edadJugador < 26) {
                clausulaAumento = 3; 
            } else if (edadJugador < 28) {
                clausulaAumento = 2; 
            } else if (edadJugador < 30) {
                clausulaAumento = 2; 
            } else if (edadJugador < 32) {
                clausulaAumento = 1.5; 
            } else if (edadJugador < 34) {
                clausulaAumento = 1.5; 
            } else if (edadJugador < 36) {
                clausulaAumento = 1; 
            } else if (edadJugador < 38) {
                clausulaAumento = 0.8; 
            } else if (edadJugador < 40) {
                clausulaAumento = 0.7; 
            } else {
                clausulaAumento = 0.6; 
            }
            
            const nuevaClausula = valorMercado * clausulaAumento;

            const nuevoJugador = {
                name: nombreCapitalizado.join(' '),
                documento: jugador.documento,
                edad: edadJugador,
                capitan: 'No',
                posicion: jugador.posicion,
                fecha_nacimiento: jugador.fecha_nacimiento,
                goles: 0,
                asistencias: 0,
                tarjetas_amarillas: 0,
                tarjetas_roja: 0,
                tarjetas_azul: 0,
                lesion: 'No',
                nacionalidad: jugador.nacionalidad,
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
                instagram: jugador.instagram,
                twitter: 'No definido',
                equipo: equipo.name,
                logo: equipo.logo,
                foto: newFotoUrl,
                sueldo: jugador.sueldo,
                sueldoCalculo: jugador.sueldoCalculo,
                sueldoProximo: sueldoOriginal, 
                contrato: jugador.contrato,
                valor_mercado: valorMercado,
                fecha_inicio: new Date(),
                fecha_fichaje:'No definido',
                clausula: nuevaClausula,
                indemnizacion:jugador.sueldoCalculo,
                oferta: [],
                transferible:'No',
                libre:'No',
                status: 'Nuevo',
                id_equipo_anterior:'No',
                inscrito: 'No',
                jugador_statusPlayOff: "No definido",
                jugador_gol_partido_playOff: [0, 0, 0, 0],
                jugador_asistencia_partido_playOff: [0, 0, 0, 0],
                jugador_amarilla_partido_playOff: [0, 0, 0, 0],
                jugador_roja_partido_playOff: [0, 0, 0, 0],
                jugador_azul_partido_playOff: [0, 0, 0, 0],
                jugador_figura_partido_playOff: [0, 0, 0, 0],
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
        if (!jugador.name) {
            throw new Error("El nombre del jugador es requerido");
        }
        if (jugador.fecha_nacimiento === 'Invalid date') {
            throw new Error("La fecha de nacimiento del jugador es requerida");
        }
        if (jugador.posicion === 'Elija una opción') {
            throw new Error("La posicion del jugador es requerida");
        }
        if (jugador.nacionalidad === 'Elija una opción') {
            throw new Error("La nacionalidad del jugador es requerida");
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

            const capitalizeFirstLetter = (str) => {
                return str.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
                    return char.toUpperCase();
                });
            };
            const nombreCompleto = jugador.name.trim().split(' ');
            const nombreCapitalizado = nombreCompleto.map((nombre) => capitalizeFirstLetter(nombre));

            const updatedJugador = {
                ...equipo.jugadores[jugadorIndex],
                name: nombreCapitalizado.join(' '),
                documento: equipo.jugadores[jugadorIndex].documento,
                edad: this.calculateAge(jugador.fecha_nacimiento),
                capitan: equipo.jugadores[jugadorIndex].capitan,
                posicion: jugador.posicion,
                fecha_nacimiento: jugador.fecha_nacimiento,
                goles: equipo.jugadores[jugadorIndex].goles,
                asistencias: equipo.jugadores[jugadorIndex].asistencias,
                tarjetas_amarillas: equipo.jugadores[jugadorIndex].tarjetas_amarillas,
                tarjetas_roja: equipo.jugadores[jugadorIndex].tarjetas_roja,
                tarjetas_azul: equipo.jugadores[jugadorIndex].tarjetas_azul,
                lesion: equipo.jugadores[jugadorIndex].lesion,
                nacionalidad: jugador.nacionalidad,
                dorsal: equipo.jugadores[jugadorIndex].dorsal,
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
                instagram: jugador.instagram,
                twitter: equipo.jugadores[jugadorIndex].twitter,
                equipo: equipo.jugadores[jugadorIndex].equipo,
                logo: equipo.jugadores[jugadorIndex].logo,
                foto: newFotoUrl || jugador.foto,
                sueldo: equipo.jugadores[jugadorIndex].sueldo,
                sueldoCalculo: equipo.jugadores[jugadorIndex].sueldoCalculo,
                contrato: equipo.jugadores[jugadorIndex].contrato,
                valor_mercado: equipo.jugadores[jugadorIndex].valor_mercado,
                fecha_inicio: equipo.jugadores[jugadorIndex].fecha_inicio,
                fecha_fichaje: equipo.jugadores[jugadorIndex].fecha_fichaje,
                clausula: equipo.jugadores[jugadorIndex].clausula,
                indemnizacion: equipo.jugadores[jugadorIndex].indemnizacion,
                oferta: equipo.jugadores[jugadorIndex].oferta,
                transferible: equipo.jugadores[jugadorIndex].transferible,
                libre: equipo.jugadores[jugadorIndex].libre,
                status: equipo.jugadores[jugadorIndex].status,
                id_equipo_anterior: equipo.jugadores[jugadorIndex].id_equipo_anterior,
                inscrito: equipo.jugadores[jugadorIndex].inscrito,
                jugador_statusPlayOff: equipo.jugadores[jugadorIndex].jugador_statusPlayOff,
                jugador_gol_partido_playOff: equipo.jugadores[jugadorIndex].jugador_gol_partido_playOff,
                jugador_asistencia_partido_playOff: equipo.jugadores[jugadorIndex].jugador_asistencia_partido_playOff,
                jugador_amarilla_partido_playOff: equipo.jugadores[jugadorIndex].jugador_amarilla_partido_playOff,
                jugador_roja_partido_playOff: equipo.jugadores[jugadorIndex].jugador_roja_partido_playOff,
                jugador_azul_partido_playOff: equipo.jugadores[jugadorIndex].jugador_azul_partido_playOff,
                jugador_figura_partido_playOff: equipo.jugadores[jugadorIndex].jugador_figura_partido_playOff,
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
        if (!jugador.sueldo) {
            throw new Error("El sueldo del jugador es requerido");
        }
        if (jugador.contrato === 'Elija una opción') {
            throw new Error("El contrato del jugador es requerido");
        }
        if (jugador.sueldo < equipo.jugadores[jugadorIndex].sueldoProximo) {
            throw new Error(`El sueldo del jugador debe ser mayor o igual a $${equipo.jugadores[jugadorIndex].sueldoProximo}`);
        }

        const sueldoOriginal = jugador.sueldo;
        const contratoAnterior = equipo.jugadores[jugadorIndex].contrato;
        jugador.contrato += contratoAnterior;
    
        switch (jugador.contrato) {
            case 0.5:
                jugador.sueldoCalculo = sueldoOriginal / 2;
                break;
            case 1:
                jugador.sueldoCalculo = sueldoOriginal;
                break;
            case 2:
                jugador.sueldoCalculo = sueldoOriginal * 2;
                break;
            case 3:
                jugador.sueldoCalculo = sueldoOriginal * 3;
                break;
            case 4:
                jugador.sueldoCalculo = sueldoOriginal * 4;
                break;
            default:
                jugador.sueldoCalculo = sueldoOriginal; 
                break;
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
        
        if (jugadorActual.sueldo !== jugador.sueldo) {
            sueldoTotalJugadores += parseFloat(jugador.sueldo) - parseFloat(jugadorActual.sueldo);
        }
        
        if (sueldoTotalJugadores > equipo.banco_fondo) {
            throw new Error("Excediste el límite salarial, no cumples con el Fair play financiero");
        }

        try {
            const updatedJugador = {
                sueldo: jugador.sueldo,
                contrato: jugador.contrato,
                sueldoCalculo: jugador.sueldoCalculo,
                sueldoProximo: sueldoOriginal, 
            };
            equipo.jugadores[jugadorIndex].sueldo = updatedJugador.sueldo;
            equipo.jugadores[jugadorIndex].contrato = updatedJugador.contrato;
            equipo.jugadores[jugadorIndex].sueldoCalculo = updatedJugador.sueldoCalculo;
            equipo.jugadores[jugadorIndex].sueldoProximo = updatedJugador.sueldoProximo;
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

    recindirJugador = async (equipoId, jugadorId, jugador) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        const sueldoAnterior = equipo.jugadores[jugadorIndex].sueldo;
        const indemnizacion = equipo.jugadores[jugadorIndex].indemnizacion;
        equipo.banco_fondo -= (sueldoAnterior + indemnizacion);
        try {
            let newFotoUrl = equipo.jugadores[jugadorIndex].foto;
            if (jugador.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto);
                newFotoUrl = result.secure_url;
            }
            const updatedJugador = {
                libre: jugador.libre,
            };
            equipo.jugadores[jugadorIndex].libre = updatedJugador.libre;
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
    
    inscribirJugador = async (equipoId, jugadorId, jugador) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
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
            throw new Error("Excediste el límite salarial, no cumples con el Fair play financiero, no lo puedes inscribir, regula tus finanzas");
        }
        if(equipo.jugadores[jugadorIndex].dorsal === null){
            throw new Error("Define el dorsal del jugador primero antes de inscribir");
        }

        try {
            let newFotoUrl = equipo.jugadores[jugadorIndex].foto;
            if (jugador.foto) {
                const result = await this.equipoCloudinary.claudinaryUploader(jugador.foto);
                newFotoUrl = result.secure_url;
            }
            const updatedJugador = {
                inscrito: jugador.inscrito,
            };
            equipo.jugadores[jugadorIndex].inscrito = updatedJugador.inscrito;
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

    dorsalJugador = async (equipoId, jugadorId, jugador) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        if(!jugador.dorsal){
            throw new Error("El dorsal del jugador es requerido");
        }
        const dorsalExistente = equipo.jugadores.find(j => j.dorsal == jugador.dorsal);
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
                dorsal: jugador.dorsal,
            };
            equipo.jugadores[jugadorIndex].dorsal = updatedJugador.dorsal;
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

    calculoJugadorContrato = async (equipoId, jugadorId ) => {
        try {
            const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
            if (!equipo) {
                throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
            }
            
            const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
            if (jugadorIndex === -1) {
                throw new Error("El jugador no existe en el equipo");
            }
            
            const contratoActual = equipo.jugadores[jugadorIndex].contrato;
            let nuevoContrato = 0;
            let libre = "No"; 
        
            if (contratoActual === 0) {
                nuevoContrato = 0;
                libre = "Si";
                const sueldoJugador = equipo.jugadores[jugadorIndex].sueldo;
                equipo.banco_fondo -= sueldoJugador;
            } else if (contratoActual === 0.5) {
                nuevoContrato = 0;
                libre = "Si";
                const sueldoJugador = equipo.jugadores[jugadorIndex].sueldo;
                equipo.banco_fondo -= sueldoJugador;
            } else if (contratoActual === 1) {
                nuevoContrato = 0.5;
            } else if (contratoActual === 1.5) {
                nuevoContrato = 1;
            } else if (contratoActual === 2) {
                nuevoContrato = 1.5;
            } else if (contratoActual === 2.5) {
                nuevoContrato = 2;
            } else if (contratoActual === 3) {
                nuevoContrato = 2.5;
            } else if (contratoActual === 3.5) {
                nuevoContrato = 3;
            } else if (contratoActual === 4) {
                nuevoContrato = 3.5;
            }

            equipo.jugadores[jugadorIndex].contrato = nuevoContrato;
            equipo.jugadores[jugadorIndex].libre = libre;

            const ganados = equipo.ganados;
            const empates = equipo.empates; 
            const incrementoPorPartido = 1000000; 
            const incrementoPorEmpate = 500000;
            equipo.banco_fondo += (ganados * incrementoPorPartido) + (empates * incrementoPorEmpate);
            
            await equipo.save();
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar jugador del equipo");
        }
    };

    //OFERTAS   

    crearOferta = async (equipoId, jugadorId, oferta) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        const jugador = equipo.jugadores[jugadorIndex];
        if (!oferta.sueldo) {
            throw new Error("El sueldo del jugador es requerido");
        }
        if (oferta.sueldo < jugador.sueldoProximo) {
            throw new Error(`El sueldo propuesto debe ser mayor o igual a ${jugador.sueldoProximo}`);
        }
        if (oferta.contrato === 'Elija una opción') {
            throw new Error("El contrato del jugador es requerido");
        }
        if (!oferta.precio) {
            throw new Error("La oferta del jugador es requerida");
        }
        if (oferta.precio < equipo.jugadores[jugadorIndex].valor_mercado) {
            throw new Error(`El precio del jugador debe ser mayor o igual a ${equipo.jugadores[jugadorIndex].valor_mercado} que es su valor en el mercado`);
        }
        try{
            const nuevaOferta = {
                equipo: oferta.equipo,
                logo: oferta.logo,
                precio: oferta.precio,
                contrato: oferta.contrato,
                tipo: oferta.tipo,
                fecha_oferta: new Date(),
                sueldo: oferta.sueldo,
                respuesta: oferta.respuesta,
                comentario: oferta.comentario,
                email: oferta.email,
                id_equipo_destino: oferta.id_equipo_destino,
            }
            const ofertaNueva = equipo.jugadores[jugadorIndex].oferta.push(nuevaOferta);
            await equipo.save();
            return ofertaNueva;
        } catch (error) {
            console.error(error);
            throw new Error("Error al crear una oferta");
        }
    }

    editarOferta = async (equipoId, jugadorId, ofertaId, oferta) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        const ofertaIndex = equipo.jugadores[jugadorIndex].oferta.findIndex((p) => p._id == ofertaId);
        if (ofertaIndex === -1) {
            throw new Error("La oferta no existe en el jugador");
        }
        if(!oferta.precio && oferta.respuesta !== 'Rechazar_oferta' && oferta.respuesta !== 'Rechazar_prestamo'){
            throw new Error("La oferta del jugador es requerida");
        }
        if(oferta.contrato === 'Elija una opción'){
            throw new Error("El contrato del jugador es requerido");
        }
        const updatedOferta = {
            ...equipo.jugadores[jugadorIndex].oferta[ofertaIndex],
            ...oferta,
        };
        const nuevasOfertas = [...equipo.jugadores[jugadorIndex].oferta];
        nuevasOfertas[ofertaIndex] = updatedOferta;

        const result = await this.jugadores.modelOfertasEdit(equipoId, jugadorId, nuevasOfertas);
        return result;
    }

    eliminarOferta = async (equipoId, jugadorId, ofertaId) => {
        const equipo = await this.jugadores.modelJugadoresFindById(equipoId);
        if (!equipo) {
            throw new Error(`No se encontró el equipo con el _id ${equipoId}`);
        }
        const jugadorIndex = equipo.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo");
        }
        const ofertaIndex = equipo.jugadores[jugadorIndex].oferta.findIndex((p) => p._id == ofertaId);
        if (ofertaIndex === -1) {
            throw new Error("La oferta no existe en el jugador");
        }
        equipo.jugadores[jugadorIndex].oferta.splice(ofertaIndex, 1);
        await equipo.save();
        return equipo;
    }

    //TRASPASOSS

    fichaDeJugador = async (equipoOrigenId, equipoDestinoId, jugadorId,oferta) => {
            const equipoOrigen = await this.jugadores.modelJugadoresFindById(equipoOrigenId);
            const equipoDestino = await this.jugadores.modelJugadoresFindById(equipoDestinoId);
            
            if (!equipoOrigen) {
                throw new Error("No se encontró el equipo origen");
            }
            if (!equipoDestino) {
                throw new Error("No se encontró el equipo destino");
            }
    
            const jugadorIndex = equipoOrigen.jugadores.findIndex((p) => p._id == jugadorId);
            if (jugadorIndex === -1) {
                throw new Error("El jugador no existe en el equipo de origen");
            }
    
            const jugadorTransferido = equipoOrigen.jugadores[jugadorIndex];

            if (jugadorTransferido.contrato === 0.5) {
                jugadorTransferido.sueldo = jugadorTransferido.sueldo / 2;
            } else if (jugadorTransferido.contrato === 1) {
                jugadorTransferido.sueldo = jugadorTransferido.sueldo;
            }else if (jugadorTransferido.contrato === 2) {
                jugadorTransferido.sueldo = jugadorTransferido.sueldo * 2;
            }else if (jugadorTransferido.contrato === 3) {
                jugadorTransferido.sueldo = jugadorTransferido.sueldo * 3;
            }else if (jugadorTransferido.contrato === 4) {
                jugadorTransferido.sueldo = jugadorTransferido.sueldo * 4;
            }

            const jugadorActual = equipoOrigen.jugadores[jugadorIndex];
            let sueldoTotalJugadores = 0;
            for (const j of equipoOrigen.jugadores) {
                if (j._id !== jugadorId) {
                    sueldoTotalJugadores += parseFloat(j.sueldo);
                }
            }
            if ((sueldoTotalJugadores += parseFloat(jugadorActual.sueldo)) > equipoOrigen.banco_fondo) {
                throw new Error("Excediste el límite salarial, no cumples con el Fair play financiero");
            }
            try {
            jugadorTransferido.dorsal = null;
            jugadorTransferido.logo = equipoDestino.logo;
            jugadorTransferido.equipo = equipoDestino.name;
            jugadorTransferido.fecha_fichaje = new Date();
            jugadorTransferido.oferta = []; 
            jugadorTransferido.status = 'Fichado';
            jugadorTransferido.id_equipo_anterior = equipoOrigen._id;
            jugadorTransferido.inscrito = 'No';
            jugadorTransferido.sueldo = oferta.sueldo;
            jugadorTransferido.contrato = oferta.contrato;

            equipoDestino.jugadores.addToSet(jugadorTransferido);
            equipoOrigen.jugadores.pull(jugadorId);

            equipoDestino.banco_fondo -= oferta.precio;
            equipoOrigen.banco_fondo += oferta.precio;
    
            await equipoOrigen.save();
            await equipoDestino.save();
    
            return jugadorTransferido;
        } catch (error) {
            console.error(error);
            throw new Error("Error al transferir al jugador");
        }
    }

    prestamoDeJugador = async (equipoOrigenId, equipoDestinoId, jugadorId) => {
        const equipoOrigen = await this.jugadores.modelJugadoresFindById(equipoOrigenId);
        const equipoDestino = await this.jugadores.modelJugadoresFindById(equipoDestinoId);
        
        if (!equipoOrigen) {
            throw new Error("No se encontró el equipo origen");
        }
        if (!equipoDestino) {
            throw new Error("No se encontró el equipo destino");
        }

        const jugadorIndex = equipoOrigen.jugadores.findIndex((p) => p._id == jugadorId);
        if (jugadorIndex === -1) {
            throw new Error("El jugador no existe en el equipo de origen");
        }

        const jugadorTransferido = equipoOrigen.jugadores[jugadorIndex];

        const jugadorActual = equipoOrigen.jugadores[jugadorIndex];
        let sueldoTotalJugadores = 0;
        for (const j of equipoOrigen.jugadores) {
            if (j._id !== jugadorId) {
                sueldoTotalJugadores += parseFloat(j.sueldo);
            }
        }
        if ((sueldoTotalJugadores += parseFloat(jugadorActual.sueldo)) > equipoDestino.banco_fondo) {
            throw new Error("Excediste el límite salarial, no cumples con el Fair play financiero");
        }
        try {
        jugadorTransferido.dorsal = null;
        jugadorTransferido.logo = equipoDestino.logo;
        jugadorTransferido.oferta = []; 
        jugadorTransferido.status = 'Prestamo';
        jugadorTransferido.inscrito = 'No';
        jugadorTransferido.id_equipo_anterior = equipoOrigen._id;

        equipoDestino.jugadores.addToSet(jugadorTransferido);
        equipoOrigen.jugadores.pull(jugadorId);

        await equipoOrigen.save();
        await equipoDestino.save();

        return jugadorTransferido;
    } catch (error) {
        console.error(error);
        throw new Error("Error al transferir al jugador");
    }
    }

    devolverJugadorPrestamo = async (equipoOrigenId, jugadorId) => {
    const equipoOrigen = await this.jugadores.modelJugadoresFindById(equipoOrigenId);
    if (!equipoOrigen) {
        throw new Error("No se encontró el equipo origen");
    }
    const jugadorIndex = equipoOrigen.jugadores.findIndex((p) => p._id == jugadorId);
    if (jugadorIndex === -1) {
        throw new Error("El jugador no existe en el equipo de origen");
    }
    
    const jugadorTransferido = equipoOrigen.jugadores[jugadorIndex];

    if (jugadorTransferido.status !== 'Prestamo') {
        return null;
    }

    const equipoDestino = await this.jugadores.modelJugadoresFindById(jugadorTransferido.id_equipo_anterior);
    
    if (!equipoDestino) {
        throw new Error("No se encontró el equipo destino");
    }

    try {
        jugadorTransferido.dorsal = null;
        jugadorTransferido.logo = equipoDestino.logo;
        jugadorTransferido.fecha_fichaje = new Date();
        jugadorTransferido.oferta = []; 
        jugadorTransferido.status = 'Nuevo';
        jugadorTransferido.id_equipo_anterior = 'No';
        jugadorTransferido.inscrito = 'No';

        equipoDestino.jugadores.addToSet(jugadorTransferido);
        equipoOrigen.jugadores.pull(jugadorId);

        await equipoOrigen.save();
        await equipoDestino.save();

        return jugadorTransferido
    } catch (error) {
        console.error(error);
        throw new Error("Error al transferir al jugador");
    }
    }
}

export const jugadoresService = new JugadoresService();