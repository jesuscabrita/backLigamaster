import delegadoRouter from "./delegado.router.js";
import dtRouter from "./dt.router.js";
import equiposRouter from "./equipos.router.js";
import jugadoresRouter from "./jugadores.router.js";
import loggerRouter from "./logger.router.js";
import userRouter from "./user.router.js";

export const  plugin_Rutas = (app, cors) => {
    app.use("/api/liga", cors, jugadoresRouter);
    app.use("/api/liga", cors, equiposRouter);
    app.use("/api/liga", cors, dtRouter);
    app.use("/api/liga", cors, delegadoRouter);
    app.use("/loggerTest", cors, loggerRouter);
    app.use("/api/user", cors, userRouter);
}