import express from "express";
import __dirname from "./utils.js";
import { MONGODB, PORT, SESSION_SECRET } from "./config/config.js";
import { connectToDatabase } from "./database/database.js";
import cors from "cors";
import bodyParser from 'body-parser';
import morgan from "morgan";
import { fileSizeLimitMiddleware } from "./middlewares/fileSizeLimit.js";
import { plugin_Rutas } from "./router/routes.js";
import { addLogger } from "./middlewares/logger.js";
import compression from "express-compression";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./middlewares/passport.js";
import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();

app.use(cors());
app.use(compression({ brotli: { enabled: true, zlib: { } } }))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use("/", express.static(`${__dirname}/public`));
app.use(fileSizeLimitMiddleware);
app.use(morgan("dev"));
app.use(addLogger);
app.use(cookieParser());
app.use(passport.initialize());
initializePassport();
app.use(
    session({
        store: MongoStore.create({
            mongoUrl: MONGODB,
            ttl: 7200,
        }),
        resave: true,
        saveUninitialized: false,
        secret: SESSION_SECRET,
    })
);

plugin_Rutas( app )

app.listen(PORT, () => {
    console.log(`Servidor corre en el puerto ${PORT}`);
});

connectToDatabase();

export default app;