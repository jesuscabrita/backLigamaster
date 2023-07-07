import { userService } from "../services/user.services.js";

export const getUser = async (req, res) => {
    try {
        const limit = req.query.limit;
        const users = await userService.getUsers(limit);
        res.status(200).send({ status: "success", message: "Todos los usuarios" ,data: users });
    } catch (err) {
        res.status(500).send({ status: "Error", message: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const uid = req.params.uid;
        const users = await userService.getUserById(uid);
        res.status(200).send({ status: "success",message: "Usuario" ,data: users });
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
        console.error(err);
        res.status(500).send({ status: "Error", message: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password, req, res);
        if (result.status === "error") {
            return res.status(400).send({result});
        }
        res.send(result);
    } catch (error) {
        return res.status(500).send({ status: "error", error: error });
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
        return res.status(500).send({ status: "error", error: error });
    }
};