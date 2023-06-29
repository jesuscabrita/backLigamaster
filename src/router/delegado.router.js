import express from "express";
import { addDelegado, deleteDelegado, editarDelegado } from "../controllers/delegado.controllers.js";

const router = express.Router();

router.post("/:equipoId/delegado", addDelegado);
router.put("/:equipoId/delegado/:delegadoId", editarDelegado);
router.delete("/:equipoId/delegado/:delegadoId", deleteDelegado);

export default router;