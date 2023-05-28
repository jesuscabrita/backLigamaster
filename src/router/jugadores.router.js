import express from "express";
import { uploader } from "../middlewares/multer.js";
import { addJugador, deleteJugador, editAmarillaJugador, editAsistenciaJugador, editAutoGol, editAzulJugador, editCalculoPartido, editFiguraJugador, editGolJugador, editJugador, editRojaJugador } from "../controllers/jugadores.controllers.js";

const router = express.Router();

router.post("/:equipoId/jugador", uploader.single("foto"), addJugador);
router.put("/:equipoId/jugador/:jugadorId", uploader.single("foto"), editJugador);
router.put("/:equipoId/goles/:jugadorId", uploader.single("foto"), editGolJugador);
router.put("/:equipoId/partido", editCalculoPartido);
router.put("/:equipoId/autogol", editAutoGol);
router.put("/:equipoId/amarillas/:jugadorId", uploader.single("foto"), editAmarillaJugador);
router.put("/:equipoId/rojas/:jugadorId", uploader.single("foto"), editRojaJugador);
router.put("/:equipoId/azul/:jugadorId", uploader.single("foto"), editAzulJugador);
router.put("/:equipoId/asistencias/:jugadorId", uploader.single("foto"), editAsistenciaJugador);
router.put("/:equipoId/figuras/:jugadorId", uploader.single("foto"), editFiguraJugador);
router.delete("/:equipoId/jugadores/:jugadorId", deleteJugador);

export default router;