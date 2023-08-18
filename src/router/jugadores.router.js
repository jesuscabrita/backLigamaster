import express from "express";
import { uploader } from "../middlewares/multer.js";
import { addJugador, addOferta, deleteJugador, editAmarillaJugador, editAsistenciaJugador, editAutoGol, editAzulJugador, editCalculoPartido, editCapitanJugador, editFiguraJugador, editGolJugador, editJornadaJugador, editJugador, editLesionJugador, editPartidosJugador, editRojaJugador, editSuspencionJugador, editarferta, eliminarOferta, listaDeTransferibleJugador, recindirJugador, renovarJugador, valorMercaoJugador } from "../controllers/jugadores.controllers.js";

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
router.put("/:equipoId/partidos/:jugadorId", uploader.single("foto"), editPartidosJugador);
router.put("/:equipoId/suspencion/:jugadorId", uploader.single("foto"), editSuspencionJugador);
router.delete("/:equipoId/jugadores/:jugadorId", deleteJugador);
router.put("/:equipoId/lesion/:jugadorId", uploader.single("foto"), editLesionJugador);
router.put("/:equipoId/jornada/:jugadorId", uploader.single("foto"), editJornadaJugador);
router.put("/:equipoId/capitan/:jugadorId", uploader.single("foto"), editCapitanJugador);
router.put("/:equipoId/mercado/:jugadorId", uploader.single("foto"), valorMercaoJugador);
router.put("/:equipoId/renovar/:jugadorId", uploader.single("foto"), renovarJugador);
router.put("/:equipoId/transferible/:jugadorId", uploader.single("foto"), listaDeTransferibleJugador);
router.put("/:equipoId/recindir/:jugadorId", uploader.single("foto"), recindirJugador);
router.post("/:equipoId/oferta/:jugadorId", addOferta);
router.put("/:equipoId/ofertaEdit/:jugadorId/:ofertaId", uploader.single("foto"), editarferta);
router.delete("/:equipoId/deleteOferta/:jugadorId/:ofertaId", eliminarOferta);

export default router;