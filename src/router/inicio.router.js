import express from "express";
import { getLigamasterInicio } from "../controllers/inicio.controllers.js";

const router = express.Router();

router.get("/", getLigamasterInicio);

export default router;