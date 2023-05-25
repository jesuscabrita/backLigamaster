import equiposRouter from "./equipos.router.js";
import jugadoresRouter from "./jugadores.router.js";

export const  plugin_Rutas = (app, cors) => {
    app.use("/api/liga", cors, jugadoresRouter);
    app.use("/api/liga", cors, equiposRouter);
}