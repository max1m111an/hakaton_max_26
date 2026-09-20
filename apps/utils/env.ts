import dotenv from "dotenv";

dotenv.config({ path: "@/.env" });

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required env variable: ${name}`);
    }
    return value;
}

export const env = {
    getEnv: function(name: string): string {
      return requiredEnv(name);
    },
};