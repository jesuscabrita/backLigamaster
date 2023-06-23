import express from "express";
import { loggerTestEndpoint } from "../controllers/logger.controllers.js";

const router = express.Router();

router.get("/", loggerTestEndpoint);

export default router;