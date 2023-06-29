import { delegadoService } from "../services/delegado.services.js";

export const addDelegado = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const delegado = req.body;
        const equipo = await delegadoService.addDelegado(equipoId,delegado);
        return res.status(201).send({ status: 'Succes', message: 'Se creó el delegado correctamente', director_tecnico: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const deleteDelegado = async (req, res) => {
    try {
        const equipoId = req.params.equipoId;
        const delegadoId = req.params.delegadoId;
        const equipo = await delegadoService.eliminarDelegado(equipoId,delegadoId);
        return res.status(200).send({ status: "Success", message: "El delegado fue eliminado exitosamente", equipo: equipo });
    } catch (err) {
        return res.status(400).send({ status: "Error", message: err.message });
    }
};

export const editarDelegado = async (req, res) => {
    const equipoId = req.params.equipoId;
    const delegadoId = req.params.delegadoId;
    const delegado = req.body;
    try {
        const updatedDT = await delegadoService.editarDelegado(equipoId,delegadoId,delegado);
        return res.status(200).send({ status: "OK", message: `El delegado se editó correctamente`, updatedDT });
    } catch (error) {
        return res.status(404).send({ status: "Error", message: error.message });
    }
};