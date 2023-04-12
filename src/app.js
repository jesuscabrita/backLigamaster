import express from "express";
import __dirname from "./utils.js";
import { PORT } from "./config.js";
import { connectToDatabase } from "./database/database.js";
import ligaRouter from "./router/equipos.router.js";
import cors from "cors";
import { fileSizeLimitMiddleware} from "./fileSizeLimit.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(`${__dirname}/public`));
app.use(fileSizeLimitMiddleware);

app.use("/api/liga", cors(), ligaRouter);

app.listen(PORT, () => {
    console.log(`Servidor corre en el puerto ${PORT}`);
});

connectToDatabase();