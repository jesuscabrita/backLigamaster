import { userService } from "../services/user.services.js";

export const getUser = async (req, res) => {
    try {
        const limit = req.query.limit;
        const users = await userService.getUsers(limit);
        res
            .status(200)
            .send({ status: "success", message: "Todos los usuarios", data: users });
    } catch (err) {
        res.status(500).send({ status: "Error", message: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const uid = req.params.uid;
        const users = await userService.getUserById(uid);
        res
            .status(200)
            .send({ status: "success", message: "Usuario", data: users });
    } catch (err) {
        res.status(500).send({ status: "Error", message: err.message });
    }
};

export const registerUser = async (req, res) => {
    try {
        const user = req.body;
        const newUser = await userService.registerUser(user);
        res.status(200).send({ status: "success", data: newUser });
    } catch (err) {
        res.status(500).send({ status: "Error", message: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password, req, res);
        if (result.status === "error") {
            return res.status(400).send({ status: "Error", message: result.error });
        }
        res.send(result);
    } catch (error) {
        return res.status(500).send({ status: "Error", message: err.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const result = await userService.logoutUser(req);
        if (result.status === "error") {
            return res.status(400).send(result);
        } else {
            return res.send(result);
        }
    } catch (error) {
        return res.status(500).send({ status: "Error", message: err.message });
    }
};

export const solicitarContraseña = async (req, res) => {
    try {
        const { email } = req.body;
        await userService.solicitarContraseña(email);
        return res.status(200).send({ status: "success", message: "Solicitud de restablecimiento de contraseña enviada correctamente, recibira un email en unos segundos" });
    } catch (err) {
        return res.status(500).send({ status: "Error", message: err.message });
    }
};

export const cambioContraseña = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userbody = req.body
        const result = await userService.restablecerContraseña(email, password, userbody);
        if (result.status === "success") {
            return res.status(200).send({ status: "success", message: 'Contraseña restablecida correctamente.' });
        } else {
            return res.status(400).send({ status: "Error", message: result.error });
        }
    } catch (err) {
        return res.status(500).send({ status: "Error", message: err.message });
    }
};

export const editUsuario = async (req, res) => {
    const userId = req.params.userId;
    const changes = req.body;
    try {
        const update = await userService.editarUsuario(userId, changes);
        return res.status(200).send({ status: "success", message: "Se edito el usuario correctamente", update });
    } catch (error) {
        return res.status(404).send({ status: 'Error', error: error.message });
    }
};

export const eliminarUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        await userService.deleteUser(userId);
        return res.status(200).send({ status: "success", message: "Se elimino el usuario correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ status: "Error", error: error.message });
    }
}


