import { API_KEY, API_SECRET, CLOUD_NAME, EMAIL_PASSWORD, EMAIL_USERNAME } from "../config.js";
import { equiposModel } from "../models/equipos.model.js";
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

export class EquiposDataBase {
    constructor() { }

    //CONTROLLERS EQUIPOS

    getEquipos = async (limit) => {
        try {
            const data = await equiposModel.find()
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
        const equipo = await equiposModel.findOne({ correo });
        return equipo !== null;
    }

    enviarCorreo = async (equipo) => {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: EMAIL_USERNAME,
                pass: EMAIL_PASSWORD
            },
            tls: { rejectUnauthorized: false }
        });

        // Configurar correo electrónico
        const correo = {
            from: '"La liga 👻" <jesusarnaldo115@gmail.com>',
            to: equipo.correo,
            subject: `¡Bienvenidos a la Liga! "${equipo.name}"`,
            html: `
            <html>
            <head>
                <style>
                        
                </style>
            </head>
            <body>
                <div style="background: white; z-index:9999;">
                <p>Tu equipo fue ingresado en la base de datos de la nueva plataforma</p>
                <p>de torneos online <a href="https://front-deportes.vercel.app/">Laliga.com</a> Seras parte de una experiencias nunca</p>
                <p>antes vista en el mundo de los torneos callejeros de Futbol.</p>
                <p>Para continuar con el proceso de inscripcion, entra en</p>
                <button style="background: rgb(31 41 55); color: #f9f8f8;height: 30px;border-radius: 8px;padding: 8px;cursor: pointer;display: flex;align-items: center;">Ingresar</button>
                <p>Saludos cordiales</p>
                <p style="display:flex, align-items: center;">"${equipo.name}" <img style="height: 20px;" src=${equipo.logo} alt="iconos de La liga" /></p>
                <img style="height:40px;" src="https://logodownload.org/wp-content/uploads/2018/05/laliga-logo-1.png" alt="iconos de La liga"/>
                </div>
            </body>
        </html>
            `
        };


        // Enviar correo electrónico
        try {
            const info = await transporter.sendMail(correo);
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

    addEquipo = async (
        name,
        partidosJugados,
        ganados,
        empates,
        perdidos,
        goles_a_Favor,
        goles_en_Contra,
        diferencia_de_Goles,
        puntos, last5,
        logo,
        puntaje_anterior,
        foto_equipo,
        banco_fondo,
        tarjetasAmarillas,
        tarjetasRojas,
        director_tecnico,
        delegado,
        fecha,
        arbitro,
        estadio,
        gol_partido,
        estado,
        correo,
        categoria,
        instagram,
        jugadores
    ) => {
        this.validateEquiposData(name, correo, instagram);
        if (!this.validarEmail(correo)) {
            throw new Error(`El correo "${correo}" no es válido`);
        }
        const existeEquipoConCorreo = await this.checkEquipoCorreo(correo);
        if (existeEquipoConCorreo) {
            throw new Error(`Ya existe un equipo registrado con el correo "${correo}"`);
        }
        const equipos = await this.getEquipos();
        const nameEquipo = await this.checkEquipoName(name)
        if (nameEquipo) {
            throw new Error(`El equipo "${name}" ya existe`);
        }

        let newLogoUrl;
        if (logo) {
            const result = await cloudinary.uploader.upload(logo);
            newLogoUrl = result.secure_url;
        } else {
            newLogoUrl = '';
        }

        const newEquipo = {
            name: name.trim(),
            partidosJugados: 0,
            ganados: 0,
            empates: 0,
            perdidos: 0,
            goles_a_Favor: 0,
            goles_en_Contra: 0,
            diferencia_de_Goles: 0,
            puntos: 0,
            last5: [
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
                "neutral",
            ],
            logo: newLogoUrl,
            puntaje_anterior: 0,
            foto_equipo: "",
            banco_fondo: 500000,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            director_tecnico: [],
            delegado: {},
            fecha: [
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido"
            ],
            arbitro: [
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido",
                "No definido"
            ],
            estadio: 'No definido',
            gol_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            estado: 'enCola',
            correo: correo.trim(),
            categoria: 'primera',
            instagram: instagram.trim(),
            jugadores: []
        }

        await this.enviarCorreo(newEquipo);

        equipos?.push(newEquipo)
        await equiposModel.create(newEquipo)

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

        await equiposModel.updateOne({ _id: id }, { $set: updatedProduct })

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
            await cloudinary.uploader.destroy(logo.public_id);
        }

        equipos.splice(index, 1);
        await equiposModel.findByIdAndDelete(id);

        return `Se eliminó el equipo con _id : "${id}" correctamente`;
    }

    //CONTROLLERS JUGADORES

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
        const equipo = await equiposModel.findById(equipoId);
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
                const result = await cloudinary.uploader.upload(jugador.foto);
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
            const equipo = await equiposModel.findById(equipoId);
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

        const equipo = await equiposModel.findById(equipoId);
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
                const result = await cloudinary.uploader.upload(jugador.foto);
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
            await equiposModel.findByIdAndUpdate(equipoId, { jugadores: equipo.jugadores });
            return equipo;
        } catch (err) {
            console.error(err);
            throw new Error("Error al editar jugador del equipo");
        }
    };

    editarGolJugador = async (equipoId, jugadorId, jugador) => {
        const equipo = await equiposModel.findById(equipoId);
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
                const result = await cloudinary.uploader.upload(jugador.foto);
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