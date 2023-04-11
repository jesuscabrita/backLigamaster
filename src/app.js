import express from "express";
import __dirname from "./utils.js";
import { PORT } from "./config.js";
import { connectToDatabase } from "./database/database.js";
import ligaRouter from "./router/equipos.router.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(`${__dirname}/public`));

app.use("/api/liga", ligaRouter);

app.listen(PORT, () => {
    console.log(`Servidor corre en el puerto ${PORT}`);
});

connectToDatabase();