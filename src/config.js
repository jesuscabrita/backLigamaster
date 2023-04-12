import { config } from "dotenv";
config();

const checkEnv = (enVar) => {
    const envVariable = process.env[enVar];
    if (!envVariable) {
        throw new Error(`Porfavor definir el nombre de la variable: ${enVar}`);
    }
    return envVariable;
};

export const PORT = checkEnv("PORT");
export const MONGODB = checkEnv("MONGODB");
export const CLOUD_NAME = checkEnv("CLOUD_NAME");
export const API_KEY = checkEnv("API_KEY");
export const API_SECRET = checkEnv("API_SECRET");