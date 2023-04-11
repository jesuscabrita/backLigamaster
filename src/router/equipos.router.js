import express from "express";
import { EquiposDataBase } from "../controllers/equipos.js";


const router = express.Router();
const equiposDatabase = new EquiposDataBase()

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit;
        const equipos = await equiposDatabase.getEquipos(limit)
        res.status(200).send({ equipos });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

router.get("/:pid", async (req, res) => {
    const pid = req.params.pid;
    try {
        const equipo = await equiposDatabase.getEquipoById(pid);
        return res.status(200).send({ equipo });
    } catch (error) {
        return res.status(404).send({ error: error.message });
    }
});

export default router;