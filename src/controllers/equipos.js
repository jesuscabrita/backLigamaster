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
            subject: `Nuevo equipo : "${equipo.name}"`,
            html: `
                <html>
                    <head>
                        <style>
                            /* Agrega estilos CSS aquí */
                        </style>
                    </head>
                    <body>
                        <p>Estimados miembros del equipo,</p>
                        <p>Es un placer darles la bienvenida a nuestro torneo de fútbol. Hemos recibido su solicitud para participar y nos complace informarles que su equipo ha sido registrado para el torneo.</p>
                        <p>Sin embargo, antes de confirmar su inscripción, necesitamos verificar algunos detalles adicionales. Por favor, asegúrese de que toda la información proporcionada sea correcta. Una vez que hayamos verificado la información, le confirmaremos la inscripción de su equipo.</p>
                        <p>Mientras tanto, nos gustaría compartir con ustedes nuestro logotipo y algunos iconos para su uso en sus correos electrónicos. Por favor, no dude en contactarnos si tiene alguna pregunta o preocupación.</p>
                        <p>¡Gracias por unirse a nosotros y esperamos tener una temporada emocionante juntos!</p>
                        <p>Saludos cordiales,</p>
                        <p style="display:flex; alignItems:center";>"${equipo.name}" <img style="height: 20px" src=${equipo.logo} alt="iconos de La liga"></p>
                        <img style="height: 40px" src="https://logodownload.org/wp-content/uploads/2018/05/laliga-logo-1.png" alt="iconos de La liga">
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
    
    validateEquiposData(name, correo) {
        if (!name) {
            throw new Error("El nombre del equipo es requerido");
        }
        if (!correo) {
            throw new Error("El correo del equipo es requerido");
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
        jugadores
    ) => {
        this.validateEquiposData(name, correo);
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
            last5: ["neutral", "neutral", "neutral", "neutral", "neutral"],
            logo: newLogoUrl,
            puntaje_anterior: 0,
            foto_equipo: "",
            banco_fondo: 500000,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            director_tecnico: [],
            delegado: {},
            fecha: ["No definido",
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
            arbitro: '',
            estadio: '',
            gol_partido: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            estado: 'enCola',
            correo: correo.trim(),
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
            // partidosJugados: parseFloat(changes.partidosJugados),
            // ganados: parseInt(changes.ganados),
            // empates: parseInt(changes.empates),
            // perdidos: parseInt(changes.perdidos),
            // goles_a_Favor: parseInt(changes.goles_a_Favor),
            // goles_en_Contra: parseInt(changes.goles_en_Contra),
            // diferencia_de_Goles: parseInt(changes.diferencia_de_Goles),
            // puntos: parseInt(changes.puntos),
            // puntaje_anterior: parseInt(changes.puntaje_anterior),
            // banco_fondo: parseInt(changes. banco_fondo),
            // tarjetasAmarillas: parseInt(changes.tarjetasAmarillas),
            // tarjetasRojas: parseInt(changes.tarjetasRojas),
            // gol_partido: changes.gol_partido.map((gol) => parseInt(gol)),
        };

        // if (Object.keys(changes).length === 1 && changes.estado) {
        //     return "Se cambió el estado exitosamente";
        // }

        equipos[equipoIndex] = updatedProduct;

        await equiposModel.updateOne({ _id: id }, { $set: updatedProduct })

        return updatedProduct;
    }
}