import dotenv from "dotenv";


dotenv.config();

export function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required env variable: ${name}`);
    }
    return value;
};
