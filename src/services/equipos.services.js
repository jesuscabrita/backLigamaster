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
            const info = await this.equipos.enviarCorreo(transporter,correo);
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

    addEquipo = async (equipo) => {
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
            const result = await this.equipos.claudinaryUploader(equipo.logo);
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
            last5: ["neutral","neutral","neutral","neutral","neutral","neutral","neutral","neutral","neutral","neutral","neutral","neutral","neutral",],
            logo: newLogoUrl,
            puntaje_anterior: 0,
            foto_equipo: "",
            banco_fondo: 500000,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            director_tecnico: [],
            delegado: {},
            fecha: ["No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido"],
            arbitro: ["No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido","No definido"],
            estadio: 'No definido',
            gol_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            estado: 'enCola',
            correo: equipo.correo.trim(),
            categoria: 'primera',
            instagram: equipo.instagram.trim(),
            jugadores: []
        }
        await this.enviarCorreo(newEquipo);
        equipos?.push(newEquipo)
        await this.equipos.modeEquiposCreate(newEquipo);
        return newEquipo;
    }

    editarEquipo = async (id, changes) => {
        const equipos = await this.getEquipos();
        const equipoIndex = equipos.findIndex((equipo) => equipo._id == id);
        if (equipoIndex === -1) {
            throw new Error(`No se encontró el equipo con ID ${id}`);
        }

        const updatedProduct = {
            ...equipos[equipoIndex],
            ...changes,
        };
        equipos[equipoIndex] = updatedProduct;
        await this.equipos.modelEquiposEdit(id,updatedProduct);
        return updatedProduct;
    }

    eliminarEquipo = async (id) => {
        const equipos = await this.getEquipos();
        const index = equipos.findIndex((equipo) => equipo._id == id);
        if (index === -1) {
            throw new Error(`No se encontró el equipo con ID ${id}`);
        }

        const logo = equipos[index].logo;
        if (logo && logo.public_id) {
            await this.equipos.claudinaryDestroy(logo.public_id);
        }
        equipos.splice(index, 1);
        await this.equipos.modelEquiposDelete(id);
        return `Se eliminó el equipo con _id : "${id}" correctamente`;
    }
}

export const equiposService = new EquiposService();