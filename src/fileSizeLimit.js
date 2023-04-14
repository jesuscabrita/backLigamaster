
export const fileSizeLimitMiddleware = (err, req, res, next) => {
    if (err.type === "entity.too.large") {
        return res.status(413).send({
            status: "Error",
            message: `El tamaño del archivo excede el límite permitido de 50MB`,
        });
    }
    next(err);
};

