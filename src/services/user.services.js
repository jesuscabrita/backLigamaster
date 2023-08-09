import moment from "moment";
import { createHash, isValidPassword } from "../middlewares/hash.js";
import { userRepository } from "../repositories/user.repository.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";

class UserService {
    constructor() {
        this.user = userRepository;
        this.usedTokens = [];
    }

    generateToken = (userId, expiresIn) => {
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn });
        return token;
    };

    isValidResetToken = async (token) => {
        try {
            const decodedToken = jwt.verify(token, JWT_SECRET);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const isTokenExpired = decodedToken.exp < currentTimestamp;
            if (isTokenExpired) {
                return false;
            }
            const tokenHasBeenUsed = this.usedTokens.includes(token);
            if (tokenHasBeenUsed) {
                return false;
            }
            const validTokens = [decodedToken.userId];
            const isTokenValid = validTokens.includes(decodedToken.userId);
            return isTokenValid;
        } catch (error) {
            return false;
        }
    };

    markTokenAsUsed = (token) => {
        this.usedTokens.push(token);
    };

    getUsers = async (limit) => {
        try {
            const data = await this.user.modelGetUser();
            const users = data.map(users => users.toObject());
            return limit ? users.slice(0, limit) : users;
        } catch (error) {
            console.error(error);
            throw new Error("Error al obtener los usuarios");
        }
    };

    getUserById = async (uid) => {
        const users = await this.getUsers();
        const user = users.find((u) => u._id == uid);
        if (!user) {
            throw new Error("No se pudo encontrar el usuario seleccionado");
        }
        return user;
    };

    findByEmail = async (email) => {
        const users = await this.getUsers();
        const user = users.find((u) => u.email == email);
        if (!user) {
            throw new Error("No se pudo encontrar el correo seleccionado");
        }
        return user;
    }

    validarEmail(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    checkUserEmail = async (email) => {
        const user = await this.user.modelUserCheck(email)
        return user !== null;
    };

    validateUserData(nombre, apellido, fecha_de_nacimiento, password, repeated_password) {
        if (!nombre) {
            throw new Error("El nombre del usuario es requerido");
        }
        if (!apellido) {
            throw new Error("El apellido del usuario es requerido");
        }
        if (!fecha_de_nacimiento) {
            throw new Error("La fecha nacimiento del usuario es requerida");
        }
        if (!password) {
            throw new Error("La contraseña es requerida");
        }
        if (!repeated_password) {
            throw new Error("La contraseña repetida es requerida");
        }
    };

    isSequentialNumeric = (password) => {
        const sequentialPatterns = ["12345678", "87654321", "123456789", "987654321", "12345678910", "10987654321"];
        return sequentialPatterns.some(pattern => password.includes(pattern));
    };

    containsWhitespace = (password) => {
        return password.includes(" ");
    };

    isSameAsNameOrApellido = (password, nombre, apellido) => {
        const lowerCasePassword = password.toLowerCase();
        const lowerCaseNombre = nombre.toLowerCase();
        const lowerCaseApellido = apellido.toLowerCase();
        const capitalizedNombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
        const capitalizedApellido = apellido.charAt(0).toUpperCase() + apellido.slice(1);

        return (
            lowerCasePassword === lowerCaseNombre ||
            lowerCasePassword === lowerCaseApellido ||
            lowerCasePassword === capitalizedNombre ||
            lowerCasePassword === capitalizedApellido
        );
    };

    calculateAge = (fecha_de_nacimiento) => {
        const today = moment();
        const birthDate = moment(fecha_de_nacimiento, 'YYYY-MM-DD');
        const age = today.diff(birthDate, 'years');
        return age.toString();
    }

    capitalizeFirstLetter = (str) => {
        return str.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
            return char.toUpperCase();
        });
    };

    registerUser = async (user) => {
        this.validateUserData(user.nombre, user.apellido, user.fecha_de_nacimiento, user.password, user.repeated_password);
        if (!this.validarEmail(user.email)) {
            throw new Error("El correo electrónico no es válido");
        }
        if (await this.checkUserEmail(user.email)) {
            throw new Error("El correo electrónico ya está en uso");
        }
        if (user.password !== user.repeated_password) {
            throw new Error("La contraseña repetida no coincide con la contraseña original");
        }
        if (user.password.length < 8) {
            throw new Error("La contraseña debe tener al menos 8 caracteres");
        }
        if (this.isSequentialNumeric(user.password)) {
            throw new Error("La contraseña no puede contener números secuenciales");
        }
        if (this.containsWhitespace(user.password)) {
            throw new Error("La contraseña no puede contener espacios en blanco");
        }
        if (this.isSameAsNameOrApellido(user.password, user.nombre, user.apellido)) {
            throw new Error("La contraseña no puede ser igual al nombre o apellido del usuario");
        }

        try {
            const newUser = {
                nombre: this.capitalizeFirstLetter(user.nombre),
                apellido: this.capitalizeFirstLetter(user.apellido),
                fecha_de_nacimiento: user.fecha_de_nacimiento,
                email: user.email,
                edad: this.calculateAge(user.fecha_de_nacimiento) ,
                password: createHash(user.password),
                role: 'usuario',
                equipo: this.capitalizeFirstLetter(user.equipo),
                foto: 'no definida',
                tipo: 'no definido',
            };

            await this.user.modelUserCreate(newUser);
            return { status: "success", message: "Usuario registrado" };
        } catch (error) {
            console.error(error);
            throw new Error("Error al registrar el usuario");
        }
    };

    loginUser = async (email, password, req, res) => {
        try {
            
        const user = await this.user.modelRegisterAndLogin(email);
        if (!user) {
            return { status: "error", error: `El email ${email} no es correcto` };
        }
        const validPassword = isValidPassword(user, password);
        if (!validPassword) {
            return { status: "error", error: 'la contraseña es incorrecta' };
        }

            const { email: userEmail, role: userRole } = user;
            const token = jwt.sign({ email: userEmail, role: userRole }, "userKey", {
                expiresIn: "24h",
            });
            console.log('token', token);
            res.cookie("tokenCookie", token, { httpOnly: true });
            user.last_connection = new Date();
            await user.save();

            req.session.user = {
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                edad: user.edad,
                fecha_de_nacimiento: user.fecha_de_nacimiento,
                role: user.role,
                equipo:  user.equipo,
                tipo: user.tipo,
                last_connection: user.last_connection
            };

            return {
                status: "success",
                message: "Inició sesión",
                payload: req.session.user,
            };
        } catch (error) {
            return { status: "error", error: 'error al inicar sesion' };
        }
    };

    logoutUser = async (req) => {
        try {
            req.session.destroy();
            return { status: "success", message: "Sesión cerrada" };
        } catch (error) {
            return { status: "error", error: 'No se pudo cerrar sesion' };
        }
    };

    sendPasswordResetEmail = async (user, resetToken) => {
        const transporter = this.user.createTransportCorreo();
        const correo = this.user.correoTextEnCola(user, resetToken);
        try {
            const info = await this.user.enviarCorreo(transporter, correo);
            console.log(`Correo electrónico enviado: ${info.messageId}`);
        } catch (error) {
            console.error(error);
        }
    };

    solicitarContraseña = async (email) => {
        try {
            const user = await this.findByEmail(email);
            const resetToken = this.generateToken(user.id, '15m');
            const isTokenValid = await this.isValidResetToken(resetToken);
            if (!isTokenValid) {
                throw new Error('Token inválido o expirado');
            }
            await this.user.saveResetToken(user._id, resetToken);
            await this.sendPasswordResetEmail(email, resetToken);
        } catch (error) {
            console.error(error);
            throw new Error('No se pudo encontrar el correo seleccionado');
        }
    }

    restablecerContraseña = async (email, newPassword, userbody) => {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                throw new Error("No se encuentra ese usuario");
            }
            const isSamePassword = isValidPassword(user, newPassword);
            if (isSamePassword) {
                throw new Error("No puedes usar la misma contraseña anterior.");
            }
            if (newPassword !== userbody.repeated_password) {
                throw new Error("La contraseña repetida no coincide con la nueva contraseña");
            }
            if (newPassword.length < 8) {
                throw new Error("La contraseña debe tener al menos 8 caracteres");
            }
            if (this.isSequentialNumeric(newPassword)) {
                throw new Error("La contraseña no puede contener números secuenciales");
            }
            if (this.containsWhitespace(newPassword)) {
                throw new Error("La contraseña no puede contener espacios en blanco");
            }
            const hashedPassword = createHash(newPassword);
            await this.user.modelUpdateUserPassword(email, hashedPassword);
            return { status: "success", message: "Contraseña restablecida correctamente." };
        } catch (error) {
            console.error(error);
            return { status: "error", error: error.message };
        }
    };

    editarUsuario = async (userId, changes) => {
        try {
            const usuarios = await this.getUsers();
            const usuarioIndex = usuarios.findIndex((user) => user._id == userId);
            if (usuarioIndex === -1) {
                throw new Error(`No se encontró el usuario con ID ${userId}`);
            }
            const updatedUser = {
                ...usuarios[usuarioIndex],
                ...changes,
            };
            usuarios[usuarioIndex] = updatedUser;
            await this.user.modelUserEdit(userId, updatedUser);
            return updatedUser;
        } catch (error) {
            throw new Error('no se pudo editar , error interno')
        }
    }

}

export const userService = new UserService();