import express from "express";
import __dirname from "./utils.js";
import { PORT } from "./config.js";
import { connectToDatabase } from "./database/database.js";
import cors from "cors";
import bodyParser from 'body-parser';
import morgan from "morgan";
import { fileSizeLimitMiddleware } from "./middlewares/fileSizeLimit.js";
import { plugin_Rutas } from "./router/routes.js";
import { addLogger } from "./middlewares/logger.js";
import compression from "express-compression";

const app = express();

app.use(cors());
app.use(compression({ brotli: { enabled: true, zlib: { } } }))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use("/", express.static(`${__dirname}/public`));
app.use(fileSizeLimitMiddleware);
app.use(morgan("dev"));
app.use(addLogger);

plugin_Rutas(app, cors())

app.listen(PORT, () => {
    console.log(`Servidor corre en el puerto ${PORT}`);
});

connectToDatabase();