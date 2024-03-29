import { equiposRepository } from "../repositories/equipos.repository.js";

class EquiposService {
    constructor() {
        this.equipos = equiposRepository;
    }

    getEquipos = async (limit) => {
        try {
            const data = await this.equipos.modelEquiposGet();
            const equipos = data.map(equipos => equipos.toObject());
            return limit ? equipos.slice(0, limit) : equipos;
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener los equipos");
        }
    }

    getEquipoById = async (id) => {
        const equipos = await this.getEquipos();
        const equipo = equipos.find((equipo) => equipo._id == id);
        if (!equipo) {
            throw new Error('No se encontró el equipo seleccionado');
        }
        return equipo;
    }

    checkEquipoName = async (name) => {
        const equipos = await this.getEquipos();
        const nameEquipo = equipos.some(equipo => equipo.name === name);
        return nameEquipo;
    }

    validarEmail(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    }

    checkEquipoCorreo = async (correo) => {
        const equipo = await this.equipos.modelEquiposCheck(correo);
        return equipo !== null;
    }

    enviarCorreo = async (equipo) => {
        const transporter = this.equipos.createTransportCorreo();
        const correo = this.equipos.correoTextEnCola(equipo);
        try {
            const info = await this.equipos.enviarCorreo(transporter, correo);
            console.log(`Correo electrónico enviado: ${info.messageId}`);
        } catch (error) {
            console.error(error);
        }
    };

    validateEquiposData(name, correo, instagram) {
        if (!name) {
            throw new Error("El nombre del equipo es requerido");
        }
        if (!correo) {
            throw new Error("El correo del equipo es requerido");
        }
        if (!instagram) {
            throw new Error("El instagram del equipo es requerido");
        }
    }

    eliminarImagenCloudinary = async (publicId) => {
        try {
            const result = await this.equipos.claudinaryDestroy(publicId);
            console.log('Imagen eliminada:', result.result);
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            throw new Error('Error al eliminar la imagen de Cloudinary');
        }
    };

    generarNumeroAleatorio =()=> {
        return Math.floor(Math.random() * 1000000);
    }

    obtenerPublicIdDesdeUrl = (url) => {
        const publicIdRegex = /\/([^/]+)\.\w+$/;
        const match = url.match(publicIdRegex);
        if (match && match.length >= 2) {
            return match[1];
        } else {
            throw new Error('No se pudo extraer el public_id de la URL');
        }
    };

    crearEquipo = async (equipo) => {
        this.validateEquiposData(equipo.name, equipo.correo, equipo.instagram);
        if (!this.validarEmail(equipo.correo)) {
            throw new Error(`El correo "${equipo.correo}" no es válido`);
        }
        const existeEquipoConCorreo = await this.checkEquipoCorreo(equipo.correo);
        if (existeEquipoConCorreo) {
            throw new Error(`Ya existe un equipo registrado con el correo "${equipo.correo}"`);
        }
        const equipos = await this.getEquipos();
        const nameEquipo = await this.checkEquipoName(equipo.name)
        if (nameEquipo) {
            throw new Error(`El equipo "${equipo.name}" ya existe`);
        }

        let newLogoUrl;
        if (equipo.logo) {
            const nombreCorto = this.equipos.generarNombreCorto();
            const nombreAleatorio = this.generarNumeroAleatorio(); 
            const nombreImagen = `${nombreCorto}_${nombreAleatorio}`;
            const result = await this.equipos.claudinaryUploader(equipo.logo, nombreImagen);
            newLogoUrl = result.secure_url;
        } else {
            newLogoUrl = '';
        }

        const newEquipo = {
            name: equipo.name.trim(),
            partidosJugados: 0,
            ganados: 0,
            empates: 0,
            perdidos: 0,
            goles_a_Favor: 0,
            goles_en_Contra: 0,
            diferencia_de_Goles: 0,
            puntos: 0,
            last5: ["neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral",],
            logo: newLogoUrl,
            puntaje_anterior: 0,
            foto_equipo: "",
            banco_fondo: 10000000,
            fair_play:"Aprobado",
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            director_tecnico: [],
            delegado: [],
            fecha: ["No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido"],
            arbitro: ["No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido"],
            estadio: 'No definido',
            gol_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            autogol_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            estado: 'enCola',
            correo: equipo.correo.trim(),
            categoria: 'Primera',
            instagram: equipo.instagram.trim(),
            jugadores: [],
            statusPlayOff: "No definido",
            gol_partido_playOff: 0,
            asistencia_partido_playOff: 0,
            amarilla_partido_playOff: 0,
            roja_partido_playOff: 0,
            azul_partido_playOff: 0,
            figura_partido_playOff: 0,
        }
        await this.enviarCorreo(newEquipo);
        equipos?.push(newEquipo)
        const equipoCreao = await this.equipos.modeEquiposCreate(newEquipo);
        return equipoCreao;
    }

    editarEquipo = async (id, changes) => {
        const equipos = await this.getEquipos();
        const equipoIndex = equipos.findIndex((equipo) => equipo._id == id);
        if (equipoIndex === -1) {
            throw new Error(`No se encontró el equipo con ID ${id}`);
        }
        const equipoActual = equipos[equipoIndex];
        let logoChanged = false;

        if (changes.logo && changes.logo !== equipoActual.logo) {
            logoChanged = true;
        }

        if (!changes.logo || changes.logo === equipoActual.logo) {
            delete changes.logo;
        }

        if (logoChanged) {
            if (equipoActual.logo) {
                const publicId = this.obtenerPublicIdDesdeUrl(equipoActual.logo);
                await this.eliminarImagenCloudinary(publicId);
            }
        }

        if (changes.logo) {
            const nombreCorto = this.equipos.generarNombreCorto();
            const nombreAleatorio = this.generarNumeroAleatorio();
            const nombreImagen = `${nombreCorto}_${nombreAleatorio}`;
            const result = await this.equipos.claudinaryUploader(changes.logo, nombreImagen);
            changes.logo = result.secure_url;
        }

        const updatedProduct = {
            ...equipos[equipoIndex],
            ...changes,
        };
        equipos[equipoIndex] = updatedProduct;
        await this.equipos.modelEquiposEdit(id, updatedProduct);
        return updatedProduct;
    }

    eliminarEquipo = async (id) => {
        const equipos = await this.getEquipos();
        const index = equipos.findIndex((equipo) => equipo._id == id);
        if (index === -1) {
            throw new Error(`No se encontró el equipo con ID ${id}`);
        }

        const logo = equipos[index].logo;

        if (logo) {
            const publicId = this.obtenerPublicIdDesdeUrl(logo);
            await this.eliminarImagenCloudinary(publicId);
        }
        equipos.splice(index, 1);
        await this.equipos.modelEquiposDelete(id);
        return `Se eliminó el equipo con _id : "${id}" correctamente`;
    }

    resetEquipoJugador = async (equipoID) => {
        try {
            const equipos = await this.getEquipos();
            const equipoIndex = equipos.findIndex((equipo) => equipo._id == equipoID);
            if (equipoIndex === -1) {
                throw new Error(`No se encontró el equipo con ID ${equipoID}`);
            }
            const equipoActual = equipos[equipoIndex];

            const updatedequipoJugador = {
                ...equipoActual,
                partidosJugados: 0,
                ganados: 0,
                empates: 0,
                perdidos: 0,
                goles_a_Favor: 0,
                goles_en_Contra: 0,
                diferencia_de_Goles: 0,
                puntos: 0,
                last5: ["neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral", "neutral"],
                puntaje_anterior: 0,
                foto_equipo: "",
                tarjetasAmarillas: 0,
                tarjetasRojas: 0,
                director_tecnico: equipoActual.director_tecnico.map((dt) =>{
                    return{
                        ...dt,
                        tarjetas_amarillas: 0,
                        tarjetas_rojas: 0,
                        tarjetas_azul: 0,
                        amarilla_partido: [0,0,0,0,0,0,0,0,0,0,0,0,0],
                        roja_partido: [0,0,0,0,0,0,0,0,0,0,0,0,0],
                        azul_partido: [0,0,0,0,0,0,0,0,0,0,0,0,0],
                        figura_partido: [0,0,0,0,0,0,0,0,0,0,0,0,0],
                        figura: 0,
                        partidos: 0,
                        partidos_individual: ["No","No","No","No","No","No","No","No","No","No","No","No","No"],
                        jornadas_suspendido:0,
                        suspendido_numero: 0,
                        suspendido: "No",
                        tarjetas_acumuladas: 0
                    }
                }),
                fecha: ["No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido"],
                arbitro: ["No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido", "No definido"],
                gol_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                autogol_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                jugadores: equipoActual.jugadores.map((jug) => {
                    return {
                        ...jug,
                        goles: 0,
                        asistencias: 0,
                        tarjetas_amarillas: 0,
                        tarjetas_roja: 0,
                        tarjetas_azul: 0,
                        lesion: "No",
                        partidos: 0,
                        partidos_individual: ["No", "No", "No", "No", "No", "No", "No", "No", "No", "No", "No", "No", "No"],
                        gol_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        amarilla_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        roja_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        azul_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        asistencia_partido_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        jugador_figura_individual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        figura: 0,
                        suspendido_numero: 0,
                        suspendido: "No",
                        jornadas_suspendido: 0,
                        tarjetas_acumuladas: 0,
                        jugador_statusPlayOff: "No definido",
                        jugador_gol_partido_playOff: [0, 0, 0, 0],
                        jugador_asistencia_partido_playOff: [0, 0, 0, 0],
                        jugador_amarilla_partido_playOff: [0, 0, 0, 0],
                        jugador_roja_partido_playOff: [0, 0, 0, 0],
                        jugador_azul_partido_playOff: [0, 0, 0, 0],
                        jugador_figura_partido_playOff: [0, 0, 0, 0],
                    };
                }),
                statusPlayOff: "No definido",
                gol_partido_playOff: 0,
                asistencia_partido_playOff: 0,
                amarilla_partido_playOff: 0,
                roja_partido_playOff: 0,
                azul_partido_playOff: 0,
                figura_partido_playOff: 0,
            };
            equipos[equipoIndex] = updatedequipoJugador;
            await this.equipos.modelEquipoReset(equipoID,updatedequipoJugador);
            return updatedequipoJugador;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar jugadores de los equipos");
        }
    };
}

export const equiposService = new EquiposService();