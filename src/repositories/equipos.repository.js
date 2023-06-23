import { API_KEY, API_SECRET, CLOUD_NAME, EMAIL_PASSWORD, EMAIL_USERNAME, HOST_EMAIL, PORT_EMAIL } from "../config.js";
import { equiposModel } from "../models/equipos.model.js";
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

class EquiposRepository {
    constructor() {}

    modelEquiposGet = () => {
        return equiposModel.find();
    }

    modelEquiposCheck = (correo) => {
        return equiposModel.findOne({ correo });
    }

    modeEquiposCreate = (newEquipo) => {
        return equiposModel.create(newEquipo)
    }

    modelEquiposEdit = (id, updatedProduct) => {
        return equiposModel.updateOne({ _id: id }, { $set: updatedProduct })
    }

    modelEquiposDelete = (id) => {
        return equiposModel.findByIdAndDelete(id);
    }

    createTransportCorreo = () => {
        return nodemailer.createTransport({
            host: HOST_EMAIL,
            port: PORT_EMAIL,
            auth: {
                user: EMAIL_USERNAME,
                pass: EMAIL_PASSWORD
            },
            tls: { rejectUnauthorized: false }
        });
    } 

    correoTextEnCola = (equipo) => {
        return {
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
    }

    enviarCorreo = (transporter, correo) => {
        return transporter.sendMail(correo);
    }

    claudinaryUploader = (logo) => {
        return cloudinary.uploader.upload(logo)
    }

    claudinaryDestroy = (logo) => {
        return cloudinary.uploader.destroy(logo);
    }
}

export const equiposRepository = new EquiposRepository();