import { dtService } from "../services/dt.services.js";

export const addDT = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const dt = req.body;
        const equipo = await dtService.addDT(equipoId,dt);
        return res.status(201).send({ status: 'Succes', message: 'Se creó el director tecnico correctamente', director_tecnico: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const editarDT = async (req, res) => {
    const equipoId = req.params.equipoId;
    const dtId = req.params.dtId;
    const dt = req.body;
    try {
        const updatedDT = await dtService.editarDT(equipoId,dtId,dt);
        return res.status(200).send({ status: "OK", message: `El director tecnico se editó correctamente`, updatedDT });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const deleteDT = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const dtId = req.params.dtId;
        const equipo = await dtService.eliminarDT(equipoId,dtId);
        return res.status(200).send({ status: "Success", message: "El director tecnico fue eliminado exitosamente", equipo: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const editPartidosDT = async (req, res) => {
    const equipoId = req.params.equipoId;
    const dtId = req.params.dtId;
    const dt = req.body;
    try {
        const updatedTecnico = await dtService.editarPartidosDT(equipoId,dtId,dt)
        return res.status(200).send({ status: "OK", message: `El director tecnico se editó correctamente`, updatedTecnico });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editAmarillaDT = async (req, res) => {
    const equipoId = req.params.equipoId;
    const dtId = req.params.dtId;
    const dt = req.body;
    const amarillas = req.body.tarjetasAmarillas;
    const rojas = req.body.tarjetasRojas;
    try {
        const updatedDT = await dtService.editarAmarillaDT(equipoId,dtId,dt,amarillas,rojas);
        return res.status(200).send({ status: "OK", message: `El tecnico se editó correctamente`, updatedDT });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editRojaDT = async (req, res) => {
    const equipoId = req.params.equipoId;
    const dtId = req.params.dtId;
    const dt = req.body;
    const rojas = req.body.tarjetasRojas;
    try {
        const updatedDT = await dtService.editarRojaDT(equipoId,dtId,dt,rojas);
        return res.status(200).send({ status: "OK", message: `El director tecnico se editó correctamente`, updatedDT });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editAzulDT = async (req, res) => {
    const equipoId = req.params.equipoId;
    const dtId = req.params.dtId;
    const dt = req.body;
    try {
        const updatedDT = await dtService.editarAzulDT(equipoId,dtId,dt);
        return res.status(200).send({ status: "OK", message: `El director tecnico se editó correctamente`, updatedDT });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editFiguraDT = async (req, res) => {
    const equipoId = req.params.equipoId;
    const dtId = req.params.dtId;
    const dt = req.body;
    try {
        const updatedDT = await dtService.editarFiguraDT(equipoId,dtId,dt);
        return res.status(200).send({ status: "OK", message: `El director tecnico se editó correctamente`, updatedDT });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editSuspencionDT = async (req, res) => {
    const equipoId = req.params.equipoId;
    const dtId = req.params.dtId;
    const dt = req.body;
    try {
        const updatedDT = await dtService.editarSuspencionDT(equipoId,dtId,dt);
        return res.status(200).send({ status: "OK", message: `El director tecnico se editó correctamente`, updatedDT });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};

export const editJornadaDT = async (req, res) => {
    const equipoId = req.params.equipoId;
    const dtId = req.params.dtId;
    const dt = req.body;
    try {
        const updatedDT = await dtService.editarJornadaDT(equipoId,dtId,dt);
        return res.status(200).send({ status: "OK", message: `El tecnico se editó correctamente`, updatedDT });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};