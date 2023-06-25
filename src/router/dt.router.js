import express from "express";
import { uploader } from "../middlewares/multer.js";
import { addDT, deleteDT, editPartidosDT, editarDT } from "../controllers/dt.controllers.js";

const router = express.Router();

router.post("/:equipoId/dt", uploader.single("foto"), addDT);
router.put("/:equipoId/dt/:dtId", uploader.single("foto"), editarDT);
router.delete("/:equipoId/dt/:dtId", deleteDT);
router.put("/:equipoId/partidoDT/:dtId", uploader.single("foto"), editPartidosDT);

export default router;