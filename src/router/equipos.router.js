import express from "express";
import { uploader } from "../middlewares/multer.js";
import { addEquipos, deleteEquipos, editEquipos, getEquipos, getEquiposById, resetEquipoJugadores } from "../controllers/equipos.controllers.js";

const router = express.Router();

router.get("/", getEquipos);
router.get("/:pid", getEquiposById);
router.post("/", uploader.single("logo"), addEquipos);
router.put("/:id", uploader.single("logo"), editEquipos);
router.put("/reset/:equipoID", resetEquipoJugadores)
router.delete("/:id", deleteEquipos);

export default router;