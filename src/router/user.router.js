import express from "express";
import { getUser, getUserById, loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/",getUser);
router.get("/:uid",getUserById);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;