import express from "express";
import { uploader } from "../middlewares/multer.js";
import { addJugador, deleteJugador, editGolJugador, editJugador } from "../controllers/jugadores.controllers.js";

const router = express.Router();

router.post("/:equipoId/jugador", uploader.single("foto"), addJugador);
router.put("/:equipoId/jugador/:jugadorId", uploader.single("foto"), editJugador);
router.put("/:equipoId/goles/:jugadorId", uploader.single("foto"), editGolJugador);
router.delete("/:equipoId/jugadores/:jugadorId", deleteJugador);

export default router;