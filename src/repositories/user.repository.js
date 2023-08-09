import { EMAIL_PASSWORD, EMAIL_USERNAME, HOST_EMAIL, PORT_EMAIL } from "../config/config.js";
import { userModel } from "../models/user.model.js";
import nodemailer from 'nodemailer';

class UserRepository {
    constructor() {}

    modelGetUser = () => {
        return userModel.find();
    }

    modelUserCheck = (email) => {
        return userModel.findOne({ email });
    }

    modelUserCreate = (newUser) => {
        return userModel.create(newUser);
    }

    modelRegisterAndLogin = (email) => {
        return userModel.findOne({ email });
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

    correoTextEnCola = (email,resetToken) => {
        const resetLink = `https://front-deportes.vercel.app/reset/${resetToken}`;
        return {
            from: '"La liga 👻" <jesusarnaldo115@gmail.com>',
            to: email,
            subject: `¡Restablecimiento de contraseña!`,
            html: `
            <html>
            <head>
                <style>
                        
                </style>
            </head>
            <body>
                <div style="background: white; z-index:9999;">
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="${resetLink}">${resetLink}</a>
                </div>
            </body>
        </html>
            `
        };
    }

    enviarCorreo = (transporter, correo) => {
        return transporter.sendMail(correo);
    }

    saveResetToken = async (userId, token) => {
        await userModel.updateOne({ _id: userId }, { resetToken: token });
    };

    modelUpdateUserPassword = (email, hashedPassword) => {
        return userModel.updateOne({ email: email }, { password: hashedPassword });
    };

    modelUserEdit = (userId, updatedUser) => {
        return userModel.updateOne({ _id: userId }, { $set: updatedUser });
    };

    modelUserDelete = (userId) => {
        return userModel.findByIdAndDelete(userId);
    };

}

export const userRepository = new UserRepository();