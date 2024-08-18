
export const getLigamasterInicio = async (req, res) => {
    try {
        res.status(200).send({ status: 'Liga Master', message:'servicio Liga Master' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
};