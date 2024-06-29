import { equiposService } from "../services/equipos.services.js";

export const getEquipos = async (req, res) => {
    try {
        const limit = req.query.limit;
        const equipos = await equiposService.getEquipos(limit);
        res.status(200).send({ equipos });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
};

export const getEquiposById = async (req, res) => {
    const pid = req.params.pid;
    try {
        const equipo = await equiposService.getEquipoById(pid);
        return res.status(200).send({ equipo });
    } catch (error) {
        return res.status(404).send({ error: error.message });
    }
};

export const addEquipos = async (req, res) => {
    try {
        const equipo= req.body;
        const newEquipo = await equiposService.crearEquipo(equipo);
            return res.status(201).send({ status: 'Succes', message: 'Se creó el equipo correctamente', equipo: newEquipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const editEquipos = async (req, res) => {
    const equipoID = req.params.id;
    const changes = req.body;
    try {
        const updatedEquipo = await equiposService.editarEquipo(equipoID, { ...changes });
        return res.status(200).send({ status: "OK", message: `El equipo se edito correctamente`, updatedEquipo });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editarEstadosLigas = async (req, res) => {
    const equipoID = req.params.id;
    const changes = req.body;
    try {
        const updatedEquipo = await equiposService.editarEstadosLigas(equipoID, { ...changes });
        return res.status(200).send({ status: "OK", message: `El equipo se edito correctamente`, updatedEquipo });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const deleteEquipos = async (req, res) => {
    const equipoID = req.params.id;
    try {
        const message = await equiposService.eliminarEquipo(equipoID);
        return res.status(200).send({ status: "Success", message });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const resetEquipoJugadores = async (req, res) => {
    const equipoID = req.params.equipoID;
    try {
        const updatedEquipos = await equiposService.resetEquipoJugador(equipoID);
        return res.status(200).send({ status: "OK", message: "Los equipos se resetearon correctamente", updatedEquipos });
    } catch (error) {
        return res.status(500).send({ status: "Error", message: error.message });
    }
};