import express from "express";
import { uploader } from "../middlewares/multer.js";
import { addDT, deleteDT, editAmarillaDT, editAzulDT, editFiguraDT, editPartidosDT, editRojaDT, editarDT } from "../controllers/dt.controllers.js";

const router = express.Router();

router.post("/:equipoId/dt", uploader.single("foto"), addDT);
router.put("/:equipoId/dt/:dtId", uploader.single("foto"), editarDT);
router.delete("/:equipoId/dt/:dtId", deleteDT);
router.put("/:equipoId/partidoDT/:dtId", uploader.single("foto"), editPartidosDT);
router.put("/:equipoId/amarillasDT/:dtId", uploader.single("foto"), editAmarillaDT);
router.put("/:equipoId/rojasDT/:dtId", uploader.single("foto"), editRojaDT);
router.put("/:equipoId/azulDT/:dtId", uploader.single("foto"), editAzulDT);
router.put("/:equipoId/figurasDT/:dtId", uploader.single("foto"), editFiguraDT);

export default router;