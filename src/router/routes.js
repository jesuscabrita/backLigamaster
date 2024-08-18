import delegadoRouter from "./delegado.router.js";
import dtRouter from "./dt.router.js";
import equiposRouter from "./equipos.router.js";
import routerInicio from "./inicio.router.js";
import jugadoresRouter from "./jugadores.router.js";
import loggerRouter from "./logger.router.js";
import userRouter from "./user.router.js";

export const  plugin_Rutas = (app) => {
    app.use("/api/liga", jugadoresRouter);
    app.use("/api/liga", equiposRouter);
    app.use("/api/liga", dtRouter);
    app.use("/api/liga", delegadoRouter);
    app.use("/loggerTest", loggerRouter);
    app.use("/api/user", userRouter);
    app.use('/', routerInicio)
}