import express from "express";
import { cambioContraseña, editUsuario, eliminarUser, getUser, getUserById, loginUser, logoutUser, registerUser, solicitarContraseña } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/",getUser);
router.get("/:uid",getUserById);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/solicitar", solicitarContraseña);
router.post("/cambiar", cambioContraseña);
router.put("/:userId",editUsuario );
router.delete("/:userId", eliminarUser);

export default router;